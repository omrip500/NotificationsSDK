import express from "express";
import { sendNotification } from "../controllers/notificationController.js";
import authenticateApiKey from "../middlewares/authenticateApiKey.js";

const router = express.Router();

router.post("/send", authenticateApiKey, sendNotification);

export default router;
