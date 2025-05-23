import express from "express";
import {
  registerDeviceToken,
  getDevicesByAppId,
  getDeviceByToken,
  updateDeviceInfo,
  unregisterDevice,
} from "../controllers/deviceController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerDeviceToken);

router.get("/app/:appId", authenticate, getDevicesByAppId);

router.get("/me/:token", getDeviceByToken);

router.put("/update", updateDeviceInfo);

router.delete("/unregister/:token", unregisterDevice);

export default router;
