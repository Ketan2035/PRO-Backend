import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

const connectDb = async () => {
    try {
        if (isConnected) return;

        const db = await mongoose.connect(process.env.MONGO_URL);

        isConnected = db.connections[0].readyState === 1;

        console.log("Database connected successfully");

    } catch (error) {
        console.error("DB Error:", error.message);
        throw error;
    }
};

export default connectDb;