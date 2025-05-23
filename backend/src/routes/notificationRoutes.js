import express from "express";
import {
  sendNotification,
  getNotificationHistoryByAppId,
  getNotificationHistoryByToken,
  deleteNotificationById,
} from "../controllers/notificationController.js";
import authenticateApiKey from "../middlewares/authenticateApiKey.js";
import authenticate from "../middlewares/authMiddleware.js";
import {
  scheduleNotification,
  getScheduledNotifications,
  sendToSpecificTokens,
  getDailyNotificationStats,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/send", authenticateApiKey, sendNotification);
router.post("/schedule", authenticate, scheduleNotification);
router.get("/scheduled/:appId", authenticate, getScheduledNotifications);
router.post("/send-to-specific", authenticateApiKey, sendToSpecificTokens);
router.get("/history/app/:appId", getNotificationHistoryByAppId);
router.get("/history/:token", getNotificationHistoryByToken); // ✅ חדש
router.delete("/:id", deleteNotificationById); // 👈 חדש
router.get("/stats/daily/:appId", getDailyNotificationStats);

export default router;
