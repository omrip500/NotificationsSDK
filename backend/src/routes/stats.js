import express from "express";
import {
  getOverviewStats,
  getPerUserStats,
} from "../controllers/statsController.js";
import authenticate from "../middlewares/authMiddleware.js"; // 👈 חדש

const router = express.Router();

router.get("/overview/:appId", getOverviewStats);
router.get("/per-user/:appId", authenticate, getPerUserStats); // 👈 חדש

export default router;
