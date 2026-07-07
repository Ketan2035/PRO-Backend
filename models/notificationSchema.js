import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  userModel: {
    type: String,
    enum: ["Customer", "Professional", "Admin"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["booking_update", "new_booking", "system", "payment", "review"],
    default: "system",
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
