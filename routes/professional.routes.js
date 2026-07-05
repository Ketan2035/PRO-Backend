import express from "express";
import {
  getProfessionals,
  getProfessionalById,
  registerPro,
  sendProfessionalData,
  uploadKyc,
  uploadProfileImage,
  updateLocation,
  toggleAvailability
} from "../controllers/professional.controller.js";
import { isLoggedIn } from "../middleware/isUserLoggedIn.js";
import validate from "../middleware/validate.js";
import upload from "../middleware/upload.js";
import { professionalSignupSchema } from "../validation/auth.schema.js";

const professionalRoutes = express.Router();

professionalRoutes.get("/", getProfessionals);
professionalRoutes.get("/:id", getProfessionalById);
professionalRoutes.post("/pro_signup", validate(professionalSignupSchema), registerPro);
professionalRoutes.get("/pro/me", sendProfessionalData);
professionalRoutes.post("/pro/kyc", isLoggedIn, upload.single("idDocument"), uploadKyc);
professionalRoutes.post("/pro/profile-image", isLoggedIn, upload.single("profileImage"), uploadProfileImage);
professionalRoutes.put("/pro/location", isLoggedIn, updateLocation);
professionalRoutes.put("/pro/availability", isLoggedIn, toggleAvailability);

export default professionalRoutes;
