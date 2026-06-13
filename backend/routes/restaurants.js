import express from "express";
import Restaurant from "../models/Restaurant.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Get all restaurants with filters
router.get("/", async (req, res) => {
  try {
    const { category, cuisine, search, sort, minBudget, maxBudget } = req.query;
    let query = {};
    
    if (category && category !== "all") query.category = category;
    if (cuisine && cuisine !== "all") query.cuisine = cuisine;
    if (minBudget || maxBudget) {
      query.budgetMin = {};
      if (minBudget) query.budgetMin.$gte = Number(minBudget);
      if (maxBudget) query.budgetMin.$lte = Number(maxBudget);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { cuisine: { $regex: search, $options: "i" } },
        { "menu.name": { $regex: search, $options: "i" } }
      ];
    }
    
    let restaurants = await Restaurant.find(query);
    
    // Sort
    if (sort === "low-high") restaurants.sort((a, b) => a.budgetMin - b.budgetMin);
    else if (sort === "high-low") restaurants.sort((a, b) => b.budgetMax - a.budgetMax);
    else if (sort === "rating") restaurants.sort((a, b) => b.rating - a.rating);
    else restaurants.sort((a, b) => b.likes - a.likes);
    
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single restaurant
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create restaurant (admin only)
router.post("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    await restaurant.save();
    
    req.app.get("io").to("admin").emit("restaurant_created", restaurant);
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update restaurant
router.put("/:id", authenticate, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    
    req.app.get("io").to(`restaurant:${restaurant._id}`).emit("restaurant_updated", restaurant);
    res.json(restaurant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Like restaurant
router.post("/:id/like", authenticate, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
