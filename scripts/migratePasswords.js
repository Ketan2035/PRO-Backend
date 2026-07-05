import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Customer from "../models/customerSchema.js";
import Professional from "../models/professionalSchema.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const migratePasswords = async () => {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URL);

    const defaultPassword = await bcrypt.hash("Password@123", 10);

    // Update customers
    const customers = await Customer.find({ password: { $exists: false } });
    for (const c of customers) {
      c.password = defaultPassword;
      await c.save();
    }
    console.log(`Updated ${customers.length} customers with default password.`);

    // Update professionals
    const professionals = await Professional.find({ password: { $exists: false } });
    for (const p of professionals) {
      p.password = defaultPassword;
      await p.save();
    }
    console.log(`Updated ${professionals.length} professionals with default password.`);

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migratePasswords();
