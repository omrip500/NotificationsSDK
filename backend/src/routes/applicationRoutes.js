import express from "express";
import {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationInterests,
  updateApplicationInterests,
  getClientIdByAppId,
  uploadServiceAccount,
  getServiceAccountStatus,
  updateServiceAccount,
  deleteApplication,
  clearFirebaseCache,
} from "../controllers/applicationController.js";
import authenticate from "../middlewares/authMiddleware.js";
import Application from "../models/Application.js";

const router = express.Router();

// העלאת service account (יוצר גם clientId אוטומטית)
router.post("/upload-service-account", authenticate, uploadServiceAccount);

// יצירת אפליקציה
router.post("/create", authenticate, createApplication);

// קבלת אפליקציות
router.get("/my-apps", authenticate, getApplications);

// Debug endpoint - רשימת כל ה-applications (ללא authentication)
router.get("/debug/all", async (req, res) => {
  try {
    const apps = await Application.find({}).select(
      "_id name platform clientId createdAt"
    );
    res.json({
      total: apps.length,
      applications: apps,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch applications", error: err.message });
  }
});

// קבלת clientId לפי appId (עבור SDK - ללא authentication) - חייב להיות לפני /:appId
router.get("/:appId/client-id", getClientIdByAppId);

// קבלת אינטרסים לפי appId (עבור SDK - ללא authentication) - חייב להיות לפני /:appId
router.get("/:appId/interests-config", getApplicationInterests);

router.get("/:appId", authenticate, getApplicationById);
router.get("/:appId/interests", authenticate, getApplicationInterests);

// עדכון אינטרסים של אפליקציה (עבור SDK - ללא authentication)
router.put("/:appId/interests", updateApplicationInterests);

// ניהול service account
router.get(
  "/:appId/service-account-status",
  authenticate,
  getServiceAccountStatus
);
router.put("/:appId/service-account", authenticate, updateServiceAccount);

// מחיקת אפליקציה
router.delete("/:appId", authenticate, deleteApplication);

// ניקוי cache של Firebase apps (לפתרון בעיות)
router.post("/clear-cache", authenticate, clearFirebaseCache);

export default router;
