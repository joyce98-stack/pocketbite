import mongoose from "mongoose";
import dotenv from "dotenv";
import Restaurant from "../models/Restaurant.js";

dotenv.config();

const restaurants = [
  // Local (10)
  { name: "Mama Oliech", email: "mamaoliech@pocketbite.co.ke", category: "local", cuisine: "Kenyan", location: "Kilimani, Nairobi", budgetMin: 100, budgetMax: 1200, likes: 245, rating: 4.5, openingHours: "8:00 AM", closingHours: "10:00 PM", phone: "+254799598117", description: "Cozy spot serving home-style East African comfort food", benefits: ["Car Park 🚗", "WiFi 📶"], tags: ["Budget", "Casual"], image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800" },
  { name: "K'Osewe Ranalo", email: "kosewe@pocketbite.co.ke", category: "local", cuisine: "Kenyan", location: "CBD, Nairobi", budgetMin: 150, budgetMax: 1500, likes: 220, rating: 4.6, openingHours: "7:00 AM", closingHours: "11:00 PM", phone: "+254712345678", description: "Famous for fish and ugali. Legendary since 1986", benefits: ["Car Park 🚗"], tags: ["Budget"], image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" },
  { name: "Nyama Mama", email: "nyamamama@pocketbite.co.ke", category: "local", cuisine: "Kenyan", location: "Westlands, Nairobi", budgetMin: 300, budgetMax: 1800, likes: 198, rating: 4.4, openingHours: "9:00 AM", closingHours: "11:00 PM", phone: "+254723456789", description: "Modern twist on Kenyan dishes", benefits: ["WiFi 📶"], tags: ["Family"], image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800" },
  // Formal (10)  
  { name: "Talisman", email: "talisman@pocketbite.co.ke", category: "formal", cuisine: "International", location: "Karen, Nairobi", budgetMin: 1500, budgetMax: 4000, likes: 215, rating: 4.7, openingHours: "12:00 PM", closingHours: "11:00 PM", phone: "+254701234567", description: "Enchanting garden restaurant", benefits: ["Car Park 🚗", "Outside Setting 🌳"], tags: ["Date Night"], image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800" },
  // High-end (10)
  { name: "The Monarch Room", email: "monarchroom@pocketbite.co.ke", category: "highend", cuisine: "Fine Dining", location: "Loresho, Nairobi", budgetMin: 4000, budgetMax: 12000, likes: 252, rating: 5.0, openingHours: "12:00 PM", closingHours: "11:00 PM", phone: "+254711234567", description: "High-end dining with regal interiors", benefits: ["Valet 🚙", "Private Dining 🔒"], tags: ["Luxury"], image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800" },
];

const sampleMenu = (budgetMin) => [
  { name: "Ugali & Sukuma", price: budgetMin, description: "Classic combo", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400", category: "Main", popular: true },
  { name: "Nyama Choma", price: budgetMin + 200, description: "Grilled meat", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400", category: "Main", popular: true },
  { name: "Pilau", price: budgetMin + 100, description: "Spiced rice", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", category: "Main", popular: false },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pocketbite");
    console.log("Connected to MongoDB");
    
    await Restaurant.deleteMany({});
    console.log("Cleared existing restaurants");
    
    const data = restaurants.map(r => ({
      ...r,
      menu: sampleMenu(r.budgetMin),
      offers: [],
      reviews: [{ dinerName: "PocketBite Guest", rating: 5, comment: "Great food and service!", verified: true, date: new Date() }]
    }));
    
    await Restaurant.insertMany(data);
    console.log(`✅ Seeded ${data.length} restaurants`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
