import express from "express";
import { registerDeviceToken } from "../controllers/deviceController.js";

const router = express.Router();

router.post("/register", registerDeviceToken);

export default router;
