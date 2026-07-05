import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Admin from "../models/adminSchema.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const seedAdmin = async () => {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URL);

    const existingAdmin = await Admin.findOne({ email: "admin@urbansaathi.com" });

    if (existingAdmin) {
      console.log("Admin account already exists!");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = new Admin({
      name: "Super Admin",
      email: "admin@urbansaathi.com",
      password: hashedPassword,
    });

    await admin.save();
    console.log("Admin account created successfully!");
    console.log("Email: admin@urbansaathi.com");
    console.log("Password: Admin@123");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
