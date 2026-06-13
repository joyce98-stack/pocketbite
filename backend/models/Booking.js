import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  dinerId: { type: String, required: true },
  dinerName: { type: String, required: true },
  dinerPhone: { type: String, required: true },
  restaurantId: { type: String, required: true },
  restaurantName: { type: String, required: true },
  items: [{
    foodId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  total: { type: Number, required: true },
  deposit: { type: Number, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending_payment", "confirmed", "checked_in", "completed", "cancelled"],
    default: "pending_payment"
  },
  qrCode: { type: String, required: true },
  mpesaCheckoutRequestId: String,
  mpesaCode: String,
  cancelled: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
