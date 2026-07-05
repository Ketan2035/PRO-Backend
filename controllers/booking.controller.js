import Booking from "../models/bookingSchema.js";
import { emitToUser } from "../server.js";
//create the boooking
export const createBooking = async (req, res) => {
  try {
    const { professionalId, service, address, date, time } = req.body;
    const booking = new Booking({
      customer: req.user.id||req.user._id,
      professional: professionalId,
      service,
      address,
      date,
      time,
    });
    await booking.save();

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

    if (status === "accepted") {
      booking.acceptedAt = new Date();
    } else if (status === "completed") {
      booking.completedAt = new Date();
    } else if (status === "cancelled") {
      booking.cancelledBy = role;
      booking.cancelReason = cancelReason;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
