import express from "express";
import { getChatHistory } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/chat/:bookingId", getChatHistory);

export default router;
