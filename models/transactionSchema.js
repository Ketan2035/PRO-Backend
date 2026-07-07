import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Can refer to either Customer or Professional or Admin depending on context
  },
  userType: {
    type: String,
    enum: ["Customer", "Professional", "Admin"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["payment_in", "commission_deducted", "earnings_added", "payout", "refund", "cash_collected"],
    required: true,
  },
  method: {
    type: String,
    enum: ["online", "cash", "wallet"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed", "refunded"],
    default: "success",
  },
  razorpay_payment_id: {
    type: String,
  },
  razorpay_order_id: {
    type: String,
  },
  description: {
    type: String,
  }
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
