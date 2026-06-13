import express from "express";
import Booking from "../models/Booking.js";
import { sendStkPush, parseMpesaCallback } from "../services/mpesaService.js";

const router = express.Router();

/**
 * POST /api/mpesa/stk
 * Sends STK Push to the diner's phone
 */
router.post("/stk", async (req, res) => {
  try {
    const { bookingId, phone, amount, accountReference, transactionDesc } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ message: "phone and amount are required" });
    }

    console.log("🔵 Sending STK Push:", { bookingId, phone, amount });

    const response = await sendStkPush({
      bookingId,
      phone,
      amount,
      accountReference,
      transactionDesc,
    });

    console.log("✅ STK Response:", response);

    // Save checkout IDs to MongoDB booking (if it exists there)
    if (bookingId) {
      try {
        await Booking.findOneAndUpdate(
          { localId: bookingId },
          {
            mpesaCheckoutRequestId: response.CheckoutRequestID,
            mpesaMerchantRequestId: response.MerchantRequestID,
            dinerPhone: phone,
          },
          { upsert: false }
        );
      } catch (e) {
        // Booking might only be in localStorage — that's fine
      }
    }

    return res.json({
      message: "STK push sent successfully. Check your phone.",
      checkoutRequestId: response.CheckoutRequestID,
      merchantRequestId: response.MerchantRequestID,
      customerMessage: response.CustomerMessage,
    });
  } catch (err) {
    console.error("STK Push Error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Failed to send STK push",
      error: err.response?.data || err.message,
    });
  }
});

/**
 * POST /api/mpesa/callback
 * Safaricom calls this after the diner enters their PIN (or cancels/times out)
 */
router.post("/callback", async (req, res) => {
  const io = req.app.get("io");

  try {
    const parsed = parseMpesaCallback(req.body);

    console.log("\n==============================");
    console.log("📞 M-PESA CALLBACK RECEIVED");
    console.log("Time:", new Date().toISOString());
    console.log("Result Code:", parsed.resultCode);
    console.log("Result Desc:", parsed.resultDesc);
    console.log("Checkout ID:", parsed.checkoutRequestId);
    console.log("Receipt:", parsed.mpesaReceiptNumber);
    console.log("Amount:", parsed.amount);
    console.log("Phone:", parsed.phoneNumber);
    console.log("==============================\n");

    // Try to find booking in MongoDB
    const booking = await Booking.findOne({
      mpesaCheckoutRequestId: parsed.checkoutRequestId,
    });

    if (parsed.resultCode === 0) {
      // ✅ PAYMENT SUCCESS — Money was actually deducted
      console.log("✅ PAYMENT SUCCESS");

      if (booking) {
        booking.status = "confirmed";
        booking.mpesaCode = parsed.mpesaReceiptNumber;
        await booking.save();
        console.log("📌 MongoDB booking updated:", booking._id);
      }

      // Build payload with ALL matching info so frontend can find the booking
      const payload = {
        // IDs for matching
        bookingId: booking?._id || null,
        checkoutRequestId: parsed.checkoutRequestId,
        merchantRequestId: parsed.merchantRequestId,

        // Payment details
        mpesaCode: parsed.mpesaReceiptNumber,
        amount: parsed.amount,
        phone: parsed.phoneNumber,

        // Booking data (if found in MongoDB)
        booking: booking || null,
      };

      // Broadcast to ALL connected clients
      // This ensures the frontend receives it even if booking is only in localStorage
      io.emit("payment_success", payload);
      console.log("📡 Broadcasted payment_success to ALL clients");

    } else {
      // ❌ PAYMENT FAILED — PIN not entered, cancelled, insufficient funds, etc.
      console.log("❌ PAYMENT FAILED");
      console.log("Reason:", parsed.resultDesc);

      if (booking) {
        booking.status = "cancelled";
        await booking.save();
      }

      const payload = {
        bookingId: booking?._id || null,
        checkoutRequestId: parsed.checkoutRequestId,
        resultCode: parsed.resultCode,
        reason: parsed.resultDesc,
        booking: booking || null,
      };

      io.emit("payment_failed", payload);
      console.log("📡 Broadcasted payment_failed to ALL clients");
    }

    // Always acknowledge Safaricom
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("❌ Callback error:", err.message);
    return res.json({ ResultCode: 0, ResultDesc: "Accepted with error" });
  }
});

export default router;