import express from "express";
import { getAvailability, updateAvailability } from "../controllers/availability.controller.js";
import { isLoggedIn } from "../middleware/isUserLoggedIn.js";

const router = express.Router();

router.get("/:professionalId", getAvailability);
router.put("/", isLoggedIn, updateAvailability);

export default router;
