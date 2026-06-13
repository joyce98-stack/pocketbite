import express from "express";
import Restaurant from "../models/Restaurant.js";
import Booking from "../models/Booking.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Add review (only verified diners who have checked in)
router.post("/:restaurantId", authenticate, async (req, res) => {
  try {
    const { rating, comment, bookingId } = req.body;
    const { restaurantId } = req.params;
    
    // Verify booking exists and user checked in
    const booking = await Booking.findOne({
      _id: bookingId,
      dinerId: req.user.id,
      restaurantId: restaurantId,
      status: { $in: ["checked_in", "completed"] }
    });
    
    if (!booking) {
      return res.status(403).json({ 
        message: "Only diners who have checked in can leave verified reviews" 
      });
    }
    
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    
    // Add review
    const review = {
      dinerId: req.user.id,
      dinerName: req.user.name,
      bookingId,
      rating,
      comment,
      verified: true,
      date: new Date()
    };
    
    restaurant.reviews.push(review);
    
    // Recalculate rating
    const totalRating = restaurant.reviews.reduce((sum, r) => sum + r.rating, 0);
    restaurant.rating = totalRating / restaurant.reviews.length;
    
    await restaurant.save();
    
    // Update booking status to completed
    booking.status = "completed";
    await booking.save();
    
    // Emit event
    req.app.get("io").to(`restaurant:${restaurantId}`).emit("new_review", { restaurant, review });
    
    res.status(201).json({ restaurant, review });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get restaurant reviews
router.get("/:restaurantId", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant.reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
