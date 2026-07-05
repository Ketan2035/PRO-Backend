import Review from "../models/reviewSchema.js";
import Booking from "../models/bookingSchema.js";
import Professional from "../models/professionalSchema.js";

// @desc    Add a review for a completed booking
// @route   POST /api/reviews
// @access  Private (Customer)
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const customerId = req.user.id || req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.customer.toString() !== customerId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to review this booking" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "Can only review completed bookings" });
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "Review already submitted for this booking" });
    }

    const review = new Review({
      booking: bookingId,
      customer: customerId,
      professional: booking.professional,
      rating: Number(rating),
      comment,
    });

    await review.save();

    // Update Professional's average rating and totalReviews
    const reviews = await Review.find({ professional: booking.professional });
    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / totalReviews;

    await Professional.findByIdAndUpdate(booking.professional, {
      rating: Number(avgRating.toFixed(1)),
      totalReviews,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a specific professional
// @route   GET /api/reviews/professional/:proId
// @access  Public
export const getProfessionalReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ professional: req.params.proId })
      .populate("customer", "name profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
