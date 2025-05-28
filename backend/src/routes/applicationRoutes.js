import express from "express";
import {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationInterests,
  uploadServiceAccount,
  generateClientId,
  getServiceAccountStatus,
  updateServiceAccount,
} from "../controllers/applicationController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = express.Router();

// יצירת clientId ייחודי
router.get("/generate-client-id", authenticate, generateClientId);

// העלאת service account
router.post("/upload-service-account", authenticate, uploadServiceAccount);

// יצירת אפליקציה
router.post("/create", authenticate, createApplication);

// קבלת אפליקציות
router.get("/my-apps", authenticate, getApplications);
router.get("/:appId", authenticate, getApplicationById);
router.get("/:appId/interests", authenticate, getApplicationInterests);

// ניהול service account
router.get(
  "/:appId/service-account-status",
  authenticate,
  getServiceAccountStatus
);
router.put("/:appId/service-account", authenticate, updateServiceAccount);

export default router;
