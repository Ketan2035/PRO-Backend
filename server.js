import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import professionalRoutes from "./routes/professional.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
dotenv.config();
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//connect db
connectDb();

app.use("/api", userRoutes);
app.use("/api", bookingRoutes);
app.use("/api/professionals", professionalRoutes);
app.use("/api",professionalRoutes);

// start server
// const PORT = process.env.PORT || 5000;
export default app;