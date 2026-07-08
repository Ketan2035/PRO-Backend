import { Server } from "socket.io";
import Message from "./models/messageSchema.js";

let io;
const connectedUsers = new Map();
const pendingRings = new Map();

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

    // Phase 4: Instant Booking Socket Flow
    socket.on("initiate_instant_booking", (data) => {
      const { professionalId, bookingRequest } = data;
      
      const timeoutId = setTimeout(() => {
        emitToUser(professionalId, "instant_booking_timeout", { reqId: bookingRequest._id });
        io.emit(`instant_booking_result_${bookingRequest._id}`, { status: "rejected", reason: "timeout" });
        pendingRings.delete(bookingRequest._id);
      }, 30000); // 30 seconds

      pendingRings.set(bookingRequest._id, timeoutId);
      emitToUser(professionalId, "incoming_booking_ring", bookingRequest);
    });

    socket.on("accept_instant_booking", (data) => {
      const { reqId } = data;
      if (pendingRings.has(reqId)) {
        clearTimeout(pendingRings.get(reqId));
        pendingRings.delete(reqId);
      }
      io.emit(`instant_booking_result_${reqId}`, { status: "accepted" });
    });

    socket.on("reject_instant_booking", (data) => {
      const { reqId } = data;
      if (pendingRings.has(reqId)) {
        clearTimeout(pendingRings.get(reqId));
        pendingRings.delete(reqId);
      }
      io.emit(`instant_booking_result_${reqId}`, { status: "rejected", reason: "rejected" });
    });

    socket.on("cancel_instant_booking", (data) => {
      const { reqId, professionalId } = data;
      if (pendingRings.has(reqId)) {
        clearTimeout(pendingRings.get(reqId));
        pendingRings.delete(reqId);
      }
      emitToUser(professionalId, "cancel_incoming_ring", { reqId });
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
