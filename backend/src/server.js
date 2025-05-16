import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoute.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import segmentRoutes from "./routes/segmentRoutes.js";
import startNotificationWorker from "./workers/notificationWorker.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// Middleware for parsing JSON and handling CORS
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/segments", segmentRoutes);

// Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);

  // Start scheduled notifications worker
  startNotificationWorker();
});
