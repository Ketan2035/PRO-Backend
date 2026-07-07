import Booking from "../models/bookingSchema.js";
import Professional from "../models/professionalSchema.js";
import { createTransaction } from "./TransactionService.js";

// Processes a successful payment and executes ACID transactions
export const processSuccessfulPayment = async (bookingId, paymentData, session) => {
  const booking = await Booking.findById(bookingId).session(session);
  if (!booking) throw new Error("Booking not found");

  if (booking.paymentStatus === "paid") {
    throw new Error("Booking is already paid");
  }

  // 1. Mark Booking as Paid
  booking.paymentStatus = "paid";
  booking.paymentMethod = paymentData.method; // 'online' or 'cash'
  
  await booking.save({ session });

  // 2. Transaction: Payment In from Customer
  await createTransaction({
    bookingId: booking._id,
    userId: booking.customer,
    userType: "Customer",
    amount: booking.totalAmount || booking.price, // Fallback if old schema
    type: "payment_in",
    method: paymentData.method,
    status: "success",
    razorpay_payment_id: paymentData.razorpay_payment_id || null,
    razorpay_order_id: paymentData.razorpay_order_id || null,
    description: "Payment for booking",
  }, session);

  // 3. Update Professional Financials
  const professional = await Professional.findById(booking.professional).session(session);
  
  if (paymentData.method === "online") {
    // If online, platform collected the money. Add earnings to professional wallet.
    professional.walletBalance += (booking.professionalEarnings || (booking.price * 0.9)); // Fallback
    professional.lifetimeEarnings += (booking.professionalEarnings || (booking.price * 0.9));
    
    await createTransaction({
      bookingId: booking._id,
      userId: professional._id,
      userType: "Professional",
      amount: booking.professionalEarnings || (booking.price * 0.9),
      type: "earnings_added",
      method: "wallet",
      status: "success",
      description: "Earnings credited to wallet",
    }, session);
  } else if (paymentData.method === "cash") {
    // If cash, professional collected the full amount including platform fee and tax.
    professional.cashInHand += booking.totalAmount || booking.price;
    professional.lifetimeEarnings += booking.professionalEarnings || (booking.price * 0.9);
    
    // They owe the platform the commission + tax
    const platformOwed = (booking.platformFee + booking.taxAmount) || (booking.price * 0.1);
    
    // We deduct it from their digital wallet balance (can go negative if they don't have enough)
    professional.walletBalance -= platformOwed;
    
    await createTransaction({
      bookingId: booking._id,
      userId: professional._id,
      userType: "Professional",
      amount: platformOwed,
      type: "commission_deducted",
      method: "wallet",
      status: "success",
      description: "Platform fee deducted for cash booking",
    }, session);
  }

  await professional.save({ session });
  
  return booking;
};
