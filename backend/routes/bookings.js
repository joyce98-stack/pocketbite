import express from "express";
import Booking from "../models/Booking.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get all bookings (admin) or user's bookings
router.get("/", authenticate, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "diner") {
      query.dinerId = req.user.id;
    } else if (req.user.role === "restaurant") {
      query.restaurantId = req.user.restaurantId;
    }
    
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new booking
router.post("/", authenticate, async (req, res) => {
  try {
    const { restaurantId, restaurantName, items, date, time, dinerPhone } = req.body;
    
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deposit = Math.round(total * 0.3);
    
    const booking = new Booking({
      dinerId: req.user.id,
      dinerName: req.user.name,
      dinerPhone: dinerPhone || req.user.phone,
      restaurantId,
      restaurantName,
      items,
      total,
      deposit,
      date,
      time,
      qrCode: `PB-${Date.now().toString(36).toUpperCase()}`,
      status: "pending_payment"
    });
    
    await booking.save();
    
    // Emit socket event
    req.app.get("io").to(`restaurant:${restaurantId}`).emit("new_booking", booking);
    req.app.get("io").to("admin").emit("new_booking", booking);
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel booking
router.patch("/:id/cancel", authenticate, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, dinerId: req.user.id },
      { status: "cancelled", cancelled: true },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    req.app.get("io").to(`restaurant:${booking.restaurantId}`).emit("booking_cancelled", booking);
    
    res.json({ message: "Booking cancelled. Deposit is non-refundable.", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check in (restaurant scans QR)
router.patch("/:id/checkin", authenticate, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "checked_in" },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
