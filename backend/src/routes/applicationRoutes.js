import express from "express";
import {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationInterests,
  getClientIdByAppId,
  uploadServiceAccount,
  getServiceAccountStatus,
  updateServiceAccount,
} from "../controllers/applicationController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = express.Router();

// העלאת service account (יוצר גם clientId אוטומטית)
router.post("/upload-service-account", authenticate, uploadServiceAccount);

// יצירת אפליקציה
router.post("/create", authenticate, createApplication);

// קבלת אפליקציות
router.get("/my-apps", authenticate, getApplications);

// קבלת clientId לפי appId (עבור SDK - ללא authentication) - חייב להיות לפני /:appId
router.get("/:appId/client-id", getClientIdByAppId);

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
