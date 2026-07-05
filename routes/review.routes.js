import express from "express";
import { createReview, getProfessionalReviews } from "../controllers/review.controller.js";
import { isLoggedIn } from "../middleware/isUserLoggedIn.js";

const reviewRoutes = express.Router();

reviewRoutes.post("/reviews", isLoggedIn, createReview);
reviewRoutes.get("/reviews/professional/:proId", getProfessionalReviews);

export default reviewRoutes;
