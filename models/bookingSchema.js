import mongoose from "mongoose";


const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Professional",
  },
  service: String,
  price: Number,
  address: String,
  city: String,
  pincode: String,
  location: {
    lat: Number,
    lng: Number,
  },

  date: String,
  time: String,

  description: String,
  images: [String], 

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled", "closed", "on_the_way", "in_progress", "completed"],
    default: "pending",
  },
  jobStatus: {
    type: String,
    enum: ["not_started", "on_the_way", "in_progress", "completed"],
    default: "not_started",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "processing", "paid", "failed", "cash_collected", "refunded"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "online", "wallet"],
  },
  
  // Pricing Breakdown
  basePrice: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  price: { type: Number, default: 0 }, // Represents Final Amount
  professionalEarnings: { type: Number, default: 0 },

  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: String,
  cancelledBy: {
    type: String,
    enum: ["customer", "professional", "admin"],
  },
  cancelReason: String,
  acceptedAt: Date,
  completedAt: Date,

}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);