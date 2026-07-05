import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import { Server } from "socket.io";
import connectDb from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import professionalRoutes from "./routes/professional.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import searchRoutes from "./routes/search.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const httpServer = createServer(app);

// Socket.io setup
export const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

// Track connected users: { userId: socketId }
const connectedUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    connectedUsers.set(userId, socket.id);
  }

  socket.on("disconnect", () => {
    connectedUsers.forEach((sid, uid) => {
      if (sid === socket.id) connectedUsers.delete(uid);
    });
  });
});

// Helper to emit to a specific user
export const emitToUser = (userId, event, data) => {
  const socketId = connectedUsers.get(userId?.toString());
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// Security HTTP headers
app.use(helmet());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000, // Increased for local development testing
  message: "Too many requests from this IP, please try again later",
});
app.use("/api", limiter);

// Serve static uploads
app.use("/uploads", express.static("uploads"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect DB
connectDb();

app.use("/api", userRoutes);
app.use("/api", bookingRoutes);
app.use("/api/professionals", professionalRoutes);
app.use("/api", professionalRoutes);
app.use("/api", searchRoutes);
app.use("/api", paymentRoutes);
app.use("/api", reviewRoutes);
app.use("/api/admin", adminRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start server via httpServer (not app.listen)
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

