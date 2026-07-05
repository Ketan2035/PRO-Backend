import express from "express";
import { createPaymentOrder, verifyPayment } from "../controllers/payment.controller.js";
import { isLoggedIn } from "../middleware/isUserLoggedIn.js";

const paymentRoutes = express.Router();

paymentRoutes.post("/payment/create-order/:bookingId", isLoggedIn, createPaymentOrder);
paymentRoutes.post("/payment/verify", isLoggedIn, verifyPayment);

export default paymentRoutes;
