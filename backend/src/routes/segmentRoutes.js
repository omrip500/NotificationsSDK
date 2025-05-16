import express from "express";
import {
  createSegment,
  getSegments,
} from "../controllers/segmentController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", authenticate, createSegment);
router.get("/:appId", authenticate, getSegments);

export default router;
