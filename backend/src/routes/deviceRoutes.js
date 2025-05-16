import express from "express";
import {
  registerDeviceToken,
  getDevicesByAppId,
} from "../controllers/deviceController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerDeviceToken);

router.get("/app/:appId", authenticate, getDevicesByAppId);

export default router;
