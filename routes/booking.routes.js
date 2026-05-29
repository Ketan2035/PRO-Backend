import express from "express";
import { createBooking, sendBookings } from "../controllers/booking.controller.js";
import {isLoggedIn} from "../middleware/isUserLoggedIn.js";

const bookingRoutes = express.Router();

bookingRoutes.post("/booking",isLoggedIn,  createBooking);
bookingRoutes.get("/booking/my",isLoggedIn,  sendBookings);

export default bookingRoutes;