import express from "express";
import Booking from "../models/Booking.js";
import { sendSms } from "../services/smsService.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Send booking confirmation SMS
router.post("/booking-confirmation/:bookingId", authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    const message = `Thank you ${booking.dinerName}! Your PocketBite booking at ${booking.restaurantName} is confirmed for ${booking.date} at ${booking.time}. QR Code: ${booking.qrCode}`;
    
    const result = await sendSms({
      to: booking.dinerPhone,
      message
    });
    
    res.json({ message: "SMS sent successfully", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send reminder SMS (admin/restaurant can trigger)
router.post("/reminder/:bookingId", authenticate, authorize("admin", "restaurant"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    const message = `PocketBite Reminder: Your table at ${booking.restaurantName} is tomorrow (${booking.date}) at ${booking.time}. Please carry your QR code: ${booking.qrCode}`;
    
    const result = await sendSms({
      to: booking.dinerPhone,
      message
    });
    
    res.json({ message: "Reminder sent successfully", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
