import express from "express";
import { sendNotification } from "../controllers/notificationController.js";
import authenticateApiKey from "../middlewares/authenticateApiKey.js";
import authenticate from "../middlewares/authMiddleware.js";
import {
  scheduleNotification,
  getScheduledNotifications,
  sendToSpecificTokens,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/send", authenticateApiKey, sendNotification);
router.post("/schedule", authenticate, scheduleNotification);
router.get("/scheduled/:appId", authenticate, getScheduledNotifications);
router.post("/send-to-specific", authenticateApiKey, sendToSpecificTokens);

export default router;
