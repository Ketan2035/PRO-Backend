import Booking from "../models/bookingSchema.js";
import Notification from "../models/notificationSchema.js";
import Professional from "../models/professionalSchema.js";
import mongoose from "mongoose";
import { emitToUser } from "../socketHandler.js";
import { calculatePricing } from "../services/PricingService.js";
//create the boooking
export const createBooking = async (req, res) => {
  try {
    const { professionalId, service, address, date, time, paymentMethod } = req.body;
    
    // Fetch professional to get base price
    const professional = await Professional.findById(professionalId);
    if (!professional) return res.status(404).json({ success: false, message: "Professional not found" });

    // Calculate Pricing
    const basePrice = professional.pricePerHour || 100; // Default if not set
    const pricing = calculatePricing(basePrice, 1); // Assuming 1 hour for now, can be updated later

    const booking = new Booking({
      customer: req.user.id || req.user._id,
      professional: professionalId,
      service,
      address,
      date,
      time,
      paymentMethod,
      bookingType: req.body.bookingType,
      status: req.body.bookingType === "instant" ? "accepted" : "pending",
      acceptedAt: req.body.bookingType === "instant" ? new Date() : null,
      
      // Save Pricing Breakdown
      basePrice: pricing.basePrice,
      platformFee: pricing.platformFee,
      taxAmount: pricing.taxAmount,
      price: pricing.totalAmount, // Final amount
      professionalEarnings: pricing.professionalEarnings,
    });
    await booking.save();

    // Create Notification for Professional
    const notif = await Notification.create({
      user: professionalId,
      userModel: "Professional",
      title: "New Booking Request",
      message: `You have a new booking request for ${service}`,
      type: "new_booking",
      link: "/profile/pro"
    });
    
    // Emit real-time
    emitToUser(professionalId, "newNotification", notif);
    emitToUser(professionalId, "refresh_bookings", { bookingId: booking._id });
    emitToUser(req.user.id || req.user._id, "refresh_bookings", { bookingId: booking._id });

    res.status(201).json({
      success: true,
      message: "Booking created",
      booking,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//send the booking 

export const sendBookings = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const role = req.user.role;

    let bookings;

    if (role === "customer") {
      bookings = await Booking.find({ customer: userId })
        .populate("professional", "name profession pricePerHour")
        .sort({ createdAt: -1 });

    } else {
      bookings = await Booking.find({ professional: userId })
        .populate("customer", "name mob_no")
        .sort({ createdAt: -1 });
    }

    res.json({ success: true, bookings });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const userId = (req.user.id || req.user._id).toString();
    const role = req.user.role;

    // Verify ownership
    if (role === "customer" && booking.customer.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (role === "professional" && booking.professional.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Status validations
    const validStatuses = ["pending", "accepted", "on_the_way", "in_progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    booking.status = status;

    // Map job statuses
    const jobStatuses = ["not_started", "on_the_way", "in_progress", "completed"];
    if (jobStatuses.includes(status)) {
      booking.jobStatus = status;
    }

    if (status === "accepted") {
      booking.acceptedAt = new Date();
    } else if (status === "completed") {
      booking.completedAt = new Date();
    } else if (status === "cancelled") {
      booking.cancelledBy = role;
      booking.cancelReason = cancelReason;
    }

    await booking.save();

    // Notify the other party
    const targetUserId = role === "customer" ? booking.professional : booking.customer;
    const targetUserModel = role === "customer" ? "Professional" : "Customer";
    
    const notif = await Notification.create({
      user: targetUserId,
      userModel: targetUserModel,
      title: "Booking Updated",
      message: `Booking status changed to ${(status || "").replace("_", " ")}`,
      type: "booking_update",
      link: targetUserModel === "Professional" ? "/profile/pro" : "/profile/customer"
    });
    
    emitToUser(targetUserId, "newNotification", notif);
    emitToUser(targetUserId, "refresh_bookings", { bookingId: booking._id });
    emitToUser(req.user.id || req.user._id, "refresh_bookings", { bookingId: booking._id });

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEarningsAnalytics = async (req, res) => {
  try {
    const professionalId = req.user.id || req.user._id;
    if (req.user.role !== "professional") {
      return res.status(403).json({ success: false, message: "Only professionals can view earnings" });
    }

    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const analytics = await Booking.aggregate([
      {
        $match: {
          professional: new mongoose.Types.ObjectId(professionalId),
          status: "completed"
        }
      },
      {
        $group: {
          _id: "$date",
          revenue: { $sum: "$price" },
          jobs: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 } // Sort by date ascending
      }
    ]);

    // Format for Recharts
    const formattedData = analytics.map(item => ({
      date: item._id,
      revenue: item.revenue,
      jobs: item.jobs
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
