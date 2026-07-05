import express from "express";
import { searchNearbyProfessionals } from "../controllers/search.controller.js";

const searchRoutes = express.Router();

searchRoutes.get("/search/nearby", searchNearbyProfessionals);

export default searchRoutes;
