import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  start: { type: String, required: true }, // e.g., "09:00"
  end: { type: String, required: true },   // e.g., "17:00"
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Professional",
    required: true,
    unique: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  schedule: {
    monday: [slotSchema],
    tuesday: [slotSchema],
    wednesday: [slotSchema],
    thursday: [slotSchema],
    friday: [slotSchema],
    saturday: [slotSchema],
    sunday: [slotSchema]
  },
  blockedDates: [{
    type: Date
  }]
}, { timestamps: true });

export default mongoose.model("Availability", availabilitySchema);
