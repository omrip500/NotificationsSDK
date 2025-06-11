import express from "express";
import {
  sendNotification,
  getNotificationHistoryByAppId,
  getNotificationHistoryByToken,
  deleteNotificationById,
  scheduleNotification,
  getScheduledNotifications,
  updateScheduledNotification,
  deleteScheduledNotification,
  sendToSpecificTokens,
  sendNotificationByLocation,
  getDailyNotificationStats,
} from "../controllers/notificationController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send", authenticate, sendNotification);
router.post("/send-by-location", authenticate, sendNotificationByLocation);
router.post("/schedule", authenticate, scheduleNotification);
router.get("/scheduled/:appId", authenticate, getScheduledNotifications);
router.put("/scheduled/:id", authenticate, updateScheduledNotification);
router.delete("/scheduled/:id", authenticate, deleteScheduledNotification);
router.post("/send-to-specific", authenticate, sendToSpecificTokens);
router.get("/history/app/:appId", getNotificationHistoryByAppId);
router.get("/history/:token", getNotificationHistoryByToken);
router.delete("/:id", deleteNotificationById);
router.get("/stats/daily/:appId", getDailyNotificationStats);

export default router;
