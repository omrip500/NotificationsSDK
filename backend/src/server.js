import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoute.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import segmentRoutes from "./routes/segmentRoutes.js";
import statsRoutes from "./routes/stats.js";
// import startNotificationWorker from "./workers/notificationWorker.js";
import connectDB from "./config/db.js";
import { clearCache } from "./config/firebaseAppManager.js";

dotenv.config();

const app = express();

app.set("trust proxy", true);

// Middleware for parsing JSON and handling CORS
app.use(cors());
app.use(express.json());

// ✅ ברירת מחדל עבור בדיקת בריאות מה-Load Balancer
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/segments", segmentRoutes);
app.use("/api/stats", statsRoutes);

// Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);

  // Clear Firebase apps cache on startup
  clearCache();

  // Start scheduled notifications worker
  // startNotificationWorker();
});
