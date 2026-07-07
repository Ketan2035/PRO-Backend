import { Server } from "socket.io";
import Message from "./models/messageSchema.js";

let io;
const connectedUsers = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      connectedUsers.set(userId, socket.id);
    }

    // Phase 6: Live Location Tracking & Chat Rooms
    socket.on("joinBooking", (bookingId) => {
      socket.join(bookingId);
    });

    socket.on("updateLocation", (data) => {
      const { bookingId, location } = data;
      // Broadcast the location update to others in the room
      socket.to(bookingId).emit("locationUpdate", location);
    });

    socket.on("sendMessage", async (data) => {
      const { bookingId, senderId, senderModel, text } = data;
      try {
        const newMessage = await Message.create({
          bookingId,
          senderId,
          senderModel,
          text
        });
        io.to(bookingId).emit("receiveMessage", newMessage);
      } catch (err) {
        console.error("Chat Error:", err);
      }
    });

    socket.on("disconnect", () => {
      connectedUsers.forEach((sid, uid) => {
        if (sid === socket.id) connectedUsers.delete(uid);
      });
    });
  });
};

export const emitToUser = (userId, event, data) => {
  if (!io) return;
  const socketId = connectedUsers.get(userId?.toString());
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};
