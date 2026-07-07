import Razorpay from "razorpay";
import Booking from "../models/bookingSchema.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { processSuccessfulPayment } from "../services/PaymentService.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order for a booking
// @route   POST /api/payment/create-order/:bookingId
// @access  Private (Customer)
export const createPaymentOrder = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Verify ownership
    if (booking.customer.toString() !== (req.user.id || req.user._id).toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Booking already paid" });
    }

    const amount = (booking.price || 100) * 100; // Amount in paise (₹ × 100)

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify payment signature & mark booking as paid
// @route   POST /api/payment/verify
// @access  Private (Customer)
export const verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Payment verification failed. Invalid signature." });
    }

    // Process payment with ACID compliance
    const booking = await processSuccessfulPayment(bookingId, {
      method: "online",
      razorpay_payment_id,
      razorpay_order_id
    }, session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Payment verified and booking marked as paid",
      booking,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process a cash payment collection
// @route   POST /api/payment/cash-collected
// @access  Private (Professional)
export const processCashPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { bookingId } = req.body;
    const professionalId = req.user.id || req.user._id;
    
    const booking = await Booking.findById(bookingId).session(session);
    
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    if (booking.professional.toString() !== professionalId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const updatedBooking = await processSuccessfulPayment(bookingId, {
      method: "cash"
    }, session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Cash payment recorded successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};
