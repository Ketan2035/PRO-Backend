import express from "express";
import { sendMail, verifyOtp, logout } from "../controllers/auth.controller.js";
import {
  registerCustomer,
  sendCustomerData,
  addAddress,
  deleteAddress,
  getMe,
} from "../controllers/user.controller.js";
import { isUserRegistered } from "../middleware/isUserRegistered.js";
import { isLoggedIn } from "../middleware/isUserLoggedIn.js";

const userRoutes = express.Router();

//for customer
userRoutes.post("/customer_signup", registerCustomer);
//login route
userRoutes.post("/login", isUserRegistered, sendMail);
//login verification
userRoutes.post("/verify", verifyOtp);

//stay logged check route
userRoutes.get("/customer/me", isLoggedIn, sendCustomerData);
userRoutes.get("/me", isLoggedIn, getMe);

//logout
userRoutes.post("/logout", logout);
// add address
userRoutes.post("/user/address", isLoggedIn, addAddress);
//deleteaddress
userRoutes.delete("/user/address/:index", isLoggedIn, deleteAddress);

export default userRoutes;
