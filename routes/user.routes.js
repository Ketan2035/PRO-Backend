import express from "express";
import { login, logout } from "../controllers/auth.controller.js";
import {
  registerCustomer,
  sendCustomerData,
  addAddress,
  deleteAddress,
  getMe,
} from "../controllers/user.controller.js";
import { isUserRegistered } from "../middleware/isUserRegistered.js";
import { isLoggedIn } from "../middleware/isUserLoggedIn.js";
import validate from "../middleware/validate.js";
import {
  customerSignupSchema,
  loginSchema,
  addAddressSchema,
} from "../validation/auth.schema.js";

const userRoutes = express.Router();

//for customer
userRoutes.post("/customer_signup", validate(customerSignupSchema), registerCustomer);
//login route
userRoutes.post("/login", validate(loginSchema), login);

//stay logged check route
userRoutes.get("/customer/me", isLoggedIn, sendCustomerData);
userRoutes.get("/me", getMe);

//logout
userRoutes.post("/logout", logout);
// add address
userRoutes.post("/user/address", isLoggedIn, validate(addAddressSchema), addAddress);
//deleteaddress
userRoutes.delete("/user/address/:index", isLoggedIn, deleteAddress);

export default userRoutes;
