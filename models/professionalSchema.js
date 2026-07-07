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
    password: {
      type: String,
      required: true,
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

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0], // [longitude, latitude]
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

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verificationReason: {
      type: String,
      default: "",
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

    accountStatus: {
      type: String,
      enum: ["pending", "active", "suspended", "rejected"],
      default: "active",
    },
    
    // Financial Tracking
    walletBalance: {
      type: Number,
      default: 0,
    },
    lifetimeEarnings: {
      type: Number,
      default: 0,
    },
    cashInHand: {
      type: Number,
      default: 0, // Cash collected directly by pro, they owe platform fee on this
    },
    
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

professionalSchema.index({ location: "2dsphere" });

export default mongoose.model("Professional", professionalSchema);
