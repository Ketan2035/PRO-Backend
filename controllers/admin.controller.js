import Admin from "../models/adminSchema.js";
import Professional from "../models/professionalSchema.js";
import Customer from "../models/customerSchema.js";
import Booking from "../models/bookingSchema.js";
import Transaction from "../models/transactionSchema.js";
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
    const pendingVerifications = await Professional.countDocuments({ verificationStatus: "pending" });
    const totalBookings = await Booking.countDocuments();
    // Transaction Ledger Aggregations
    const grossTransactions = await Transaction.aggregate([
      { $match: { type: { $in: ["payment_in", "cash_payment_received"] }, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalGrossRevenue = grossTransactions[0]?.total || 0;

    const commissionTransactions = await Transaction.aggregate([
      { $match: { type: "commission_deducted", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalPlatformRevenue = commissionTransactions[0]?.total || 0;

    // Professionals pending payout (walletBalance > 0)
    const pendingPayoutsAggregation = await Professional.aggregate([
      { $match: { walletBalance: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$walletBalance" } } }
    ]);
    const totalPendingPayouts = pendingPayoutsAggregation[0]?.total || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalProfessionals,
        pendingVerifications,
        totalBookings,
        totalGrossRevenue,
        totalPlatformRevenue,
        totalPendingPayouts
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
    const filter = req.query.status === "pending" ? { verificationStatus: "pending" } : {};
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
// @route   PUT /api/admin/professional/:id/verification
// @access  Private (Admin)
export const verifyProfessional = async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    const professional = await Professional.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status, verificationReason: reason || "" },
      { new: true }
    );

    if (!professional) {
      return res.status(404).json({ success: false, message: "Professional not found" });
    }

    res.status(200).json({
      success: true,
      message: `Professional status updated to ${status}`,
      professional
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
