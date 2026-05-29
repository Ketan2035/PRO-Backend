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
    enum: [
      "pending",
      "accepted",
      "on_the_way",
      "in_progress",
      "completed",
      "cancelled",
    ],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "online"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: String,
  cancelledBy: {
    type: String,
    enum: ["customer", "professional"],
  },
  cancelReason: String,
  acceptedAt: Date,
  completedAt: Date,

}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);