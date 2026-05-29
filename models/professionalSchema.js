import mongoose from "mongoose";

const professionalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mob: {
      type: String,
      required: true,
      unique: true,
      match: [/^\+?[0-9]{10,15}$/, "Invalid phone number"],
    },
    role: {
      type: String,
      enum: ["customer", "professional"],
      default: "professional",
    },
    profession: {
      type: String,
      required: true,
    },

    experience: {
      type: Number,
      required: true,
      min: 0,
    },

    qualification: {
      type: String,
      required: true,
      trim: true,
    },

    bio: {
      type: String,
      maxlength: 300,
    },

    service_area: {
      type: String,
      required: true,
    },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: "India",
      },
    },

    profileImage: {
      url: String,
      filename: String,
    },

    workImages: [
      {
        url: String,
        filename: String,
      },
    ],

    pricePerHour: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    idProof: {
      type: {
        type: String,
        enum: ["Aadhar", "PAN", "Driving License"],
      },
      number: String,
      image: {
        url: String,
        filename: String,
      },
    },

    experienceCertificates: [
      {
        title: String,
        image: {
          url: String,
          filename: String,
        },
      },
    ],

    isAvailable: {
      type: Boolean,
      default: true,
    },

    workingHours: {
      start: String,
      end: String,
    },

    password: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Professional", professionalSchema);
