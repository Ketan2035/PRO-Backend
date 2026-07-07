import express from "express";
import { createPaymentOrder, verifyPayment, processCashPayment } from "../controllers/payment.controller.js";
import { isLoggedIn } from "../middleware/isUserLoggedIn.js";

const paymentRoutes = express.Router();

paymentRoutes.post("/payment/create-order/:bookingId", isLoggedIn, createPaymentOrder);
paymentRoutes.post("/payment/verify", isLoggedIn, verifyPayment);
paymentRoutes.post("/payment/cash-collected", isLoggedIn, processCashPayment);

export default paymentRoutes;
