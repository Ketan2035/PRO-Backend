import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mob_no: {
    type: String,
    required: true,
    match: [/^\+?[0-9]{10,15}$/, "Please enter a valid phone number"],
  },
  city: {
    type: String,
    required: true,
  },
  address: [
    {
      type: String,
    },
  ],
  profileImage: {
    url: String,
    filename: String,
  },
  role: {
    type: String,
    enum: ["customer", "professional"],
    default: "customer",
  },
});

export default mongoose.model("Customer", customerSchema);
