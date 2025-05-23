import express from "express";
import {
  createSegment,
  getSegmentsByApp,
  deleteSegment,
} from "../controllers/segmentController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticate); // כל המסלולים דורשים התחברות

router.post("/", createSegment);
router.get("/:appId", getSegmentsByApp);
router.delete("/:segmentId", deleteSegment);

export default router;
