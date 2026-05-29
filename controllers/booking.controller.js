import Booking from "../models/bookingSchema.js";
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

