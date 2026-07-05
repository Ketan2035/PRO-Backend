import Admin from "../models/adminSchema.js";
import Professional from "../models/professionalSchema.js";
import Customer from "../models/customerSchema.js";
import Booking from "../models/bookingSchema.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    await generateToken(admin, res);

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalProfessionals = await Professional.countDocuments();
    const pendingVerifications = await Professional.countDocuments({ isVerified: false });
    const totalBookings = await Booking.countDocuments();
    
    // Calculate total revenue from paid bookings (Assuming 10% platform fee for example, but we'll return total)
    const paidBookings = await Booking.find({ paymentStatus: "paid", status: "completed" });
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.price || 100), 0);

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalProfessionals,
        pendingVerifications,
        totalBookings,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all professionals (with filter for pending)
// @route   GET /api/admin/professionals
// @access  Private (Admin)
export const getAdminProfessionals = async (req, res) => {
  try {
    const filter = req.query.status === "pending" ? { isVerified: false } : {};
    const professionals = await Professional.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      professionals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify or Reject Professional
// @route   PUT /api/admin/professional/:id/verify
// @access  Private (Admin)
export const verifyProfessional = async (req, res) => {
  try {
    const { isVerified } = req.body;
    
    const professional = await Professional.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    );

    if (!professional) {
      return res.status(404).json({ success: false, message: "Professional not found" });
    }

    res.status(200).json({
      success: true,
      message: `Professional ${isVerified ? "verified" : "unverified"} successfully`,
      professional
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
