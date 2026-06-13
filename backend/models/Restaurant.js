import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  category: { type: String, enum: ["local", "formal", "highend"], required: true },
  cuisine: String,
  location: String,
  description: String,
  image: String,
  budgetMin: Number,
  budgetMax: Number,
  likes: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  benefits: [String],
  tags: [String],
  openingHours: String,
  closingHours: String,
  phone: String,
  menu: [{
    name: String,
    price: Number,
    description: String,
    image: String,
    category: String,
    popular: Boolean
  }],
  offers: [{
    title: String,
    description: String,
    discount: Number,
    validUntil: String,
    active: { type: Boolean, default: true }
  }],
  reviews: [{
    dinerId: String,
    dinerName: String,
    bookingId: String,
    rating: Number,
    comment: String,
    verified: { type: Boolean, default: true },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model("Restaurant", restaurantSchema);
