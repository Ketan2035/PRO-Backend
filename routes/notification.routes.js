import express from "express";
import { getNotifications, markAsRead, markOneAsRead, markOneAsUnread, deleteNotification } from "../controllers/notification.controller.js";
import { isLoggedIn } from "../middleware/isUserLoggedIn.js";

const router = express.Router();

router.get("/notifications", isLoggedIn, getNotifications);
router.put("/notifications/read", isLoggedIn, markAsRead);
router.put("/notifications/:id/read", isLoggedIn, markOneAsRead);
router.put("/notifications/:id/unread", isLoggedIn, markOneAsUnread);
router.delete("/notifications/:id", isLoggedIn, deleteNotification);

export default router;
