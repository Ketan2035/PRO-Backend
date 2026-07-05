import express from "express";
import { createBooking, sendBookings, updateBookingStatus } from "../controllers/booking.controller.js";
import {isLoggedIn} from "../middleware/isUserLoggedIn.js";

const bookingRoutes = express.Router();

bookingRoutes.post("/booking",isLoggedIn,  createBooking);
bookingRoutes.get("/booking/my",isLoggedIn,  sendBookings);
bookingRoutes.put("/booking/:id/status",isLoggedIn, updateBookingStatus);

export default bookingRoutes;