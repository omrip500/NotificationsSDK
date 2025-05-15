import express from "express";
import {
  createApplication,
  getApplications,
  getApplicationInterests,
} from "../controllers/applicationController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", authenticate, createApplication);
router.get("/my-apps", authenticate, getApplications);
router.get("/:appId/interests", authenticate, getApplicationInterests);

export default router;
