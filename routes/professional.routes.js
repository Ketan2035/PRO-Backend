import express from "express";
import {
  getProfessionals,
  getProfessionalById,
  registerPro,
  sendProfessionalData,
} from "../controllers/professional.controller.js";
import {isLoggedIn} from "../middleware/isUserLoggedIn.js";
const professionalRoutes = express.Router();

professionalRoutes.get("/", getProfessionals);
professionalRoutes.get("/:id", getProfessionalById);
professionalRoutes.post("/pro_signup", registerPro);
professionalRoutes.get("/pro/me",isLoggedIn,sendProfessionalData);
export default professionalRoutes;
