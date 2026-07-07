import Message from "../models/messageSchema.js";
import Booking from "../models/bookingSchema.js";

// @desc    Get chat history for a booking
// @route   GET /api/chat/:bookingId
// @access  Private (Customer or Professional)
export const getChatHistory = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    const messages = await Message.find({ bookingId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
