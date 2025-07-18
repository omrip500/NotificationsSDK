import express from "express";
import {
  registerDeviceToken,
  getDevicesByAppId,
  getDevicesByAppIdDebug,
  getDeviceByToken,
  getDevicesWithLocation,
  updateDeviceInfo,
  updateDeviceLocation,
  unregisterDevice,
} from "../controllers/deviceController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerDeviceToken);

router.get("/app/:appId", authenticate, getDevicesByAppId);
router.get("/app/:appId/debug", getDevicesByAppIdDebug); // Debug endpoint ללא authentication
router.get("/app/:appId/with-location", authenticate, getDevicesWithLocation);

router.get("/me/:token", getDeviceByToken);

router.put("/update", updateDeviceInfo);
router.put("/update-location", updateDeviceLocation);

router.delete("/unregister/:token", unregisterDevice);

export default router;
