import express from "express";
import {
  adminLogin,
  getAdminStats,
  getAdminProfessionals,
  verifyProfessional
} from "../controllers/admin.controller.js";
import { isLoggedIn } from "../middleware/isUserLoggedIn.js";

const adminRoutes = express.Router();

// Public route for login
adminRoutes.post("/login", adminLogin);

// Protected routes (require admin login)
// Ideally, we'd add an isAdmin middleware here to verify req.user.role === 'admin'
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: "Not authorized as admin" });
  }
};

adminRoutes.get("/stats", isLoggedIn, isAdmin, getAdminStats);
adminRoutes.get("/professionals", isLoggedIn, isAdmin, getAdminProfessionals);
adminRoutes.put("/professional/:id/verification", isLoggedIn, isAdmin, verifyProfessional);

export default adminRoutes;
