import Application from "../models/Application.js";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { clearCache, clearClientCache } from "../config/firebaseAppManager.js";

dotenv.config();

// הגדרת S3 client
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/**
 * פונקציה להעלאת service account ל-S3 ויצירת clientId מתוך project_id
 */
export const uploadServiceAccount = async (req, res) => {
  try {
    const { serviceAccountData } = req.body;

    if (!serviceAccountData) {
      return res.status(400).json({
        message: "serviceAccountData is required",
      });
    }

    // ולידציה של JSON
    let parsedServiceAccount;
    try {
      parsedServiceAccount =
        typeof serviceAccountData === "string"
          ? JSON.parse(serviceAccountData)
          : serviceAccountData;
    } catch (error) {
      return res.status(400).json({
        message: "Invalid JSON format for service account",
      });
    }

    // בדיקה שהקובץ מכיל את השדות הנדרשים
    const requiredFields = [
      "type",
      "project_id",
      "private_key_id",
      "private_key",
      "client_email",
    ];
    const missingFields = requiredFields.filter(
      (field) => !parsedServiceAccount[field]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields in service account: ${missingFields.join(
          ", "
        )}`,
      });
    }

    if (parsedServiceAccount.type !== "service_account") {
      return res.status(400).json({
        message: "Service account type must be 'service_account'",
      });
    }

    // יצירת clientId מתוך project_id
    const projectId = parsedServiceAccount.project_id;
    const clientId = `${projectId}-${uuidv4().split("-")[0]}`; // שימוש ב-project_id + חלק מ-uuid

    // בדיקה שה-clientId לא קיים כבר
    const existingApp = await Application.findOne({ clientId });
    if (existingApp) {
      return res.status(400).json({
        message: `An application with this Firebase project already exists. Project ID: ${projectId}`,
      });
    }

    // העלאה ל-S3
    const s3Key = `clients/${clientId}.json`;
    const uploadParams = {
      Bucket: process.env.FIREBASE_SA_BUCKET,
      Key: s3Key,
      Body: JSON.stringify(parsedServiceAccount, null, 2),
      ContentType: "application/json",
      ServerSideEncryption: "AES256", // הצפנה
    };

    console.log(
      `📤 Uploading service account for client: ${clientId} (project: ${projectId})`
    );
    const uploadResult = await s3.upload(uploadParams).promise();

    res.status(200).json({
      message: "Service account uploaded successfully",
      clientId,
      projectId: parsedServiceAccount.project_id,
      clientEmail: parsedServiceAccount.client_email,
      s3Location: uploadResult.Location,
    });
  } catch (error) {
    console.error("❌ Error uploading service account:", error);
    res.status(500).json({
      message: "Failed to upload service account",
      error: error.message,
    });
  }
};

export const createApplication = async (req, res) => {
  try {
    const { name, platform, clientId, interests } = req.body;

    if (!clientId) {
      return res.status(400).json({ message: "clientId is required" });
    }

    // בדיקה שה-service account קיים ב-S3
    try {
      const s3Key = `clients/${clientId}.json`;
      await s3
        .headObject({
          Bucket: process.env.FIREBASE_SA_BUCKET,
          Key: s3Key,
        })
        .promise();
    } catch (s3Error) {
      return res.status(400).json({
        message:
          "Service account file not found for this clientId. Please upload service account first.",
      });
    }

    const newApp = new Application({
      name,
      platform,
      user: req.userId,
      clientId,
      interests: interests || [], // ← שמור את האינטרסים
    });

    await newApp.save();

    res
      .status(201)
      .json({ message: "Application created", application: newApp });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create application", error: err.message });
  }
};

export const getApplications = async (req, res) => {
  try {
    const apps = await Application.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json(apps);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch applications",
      error: err.message,
    });
  }
};

export const getApplicationById = async (req, res) => {
  const { appId } = req.params;

  try {
    const app = await Application.findById(appId);
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json(app);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve application", error: err.message });
  }
};

export const getApplicationInterests = async (req, res) => {
  const { appId } = req.params;

  try {
    const app = await Application.findById(appId);
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ interests: app.interests || [] });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve interests", error: err.message });
  }
};

/**
 * עדכון אינטרסים של אפליקציה - עבור ה-SDK
 */
export const updateApplicationInterests = async (req, res) => {
  const { appId } = req.params;
  const { interests } = req.body;

  console.log(`🔄 Updating interests for app: ${appId}`);
  console.log(`📝 New interests:`, interests);

  try {
    const app = await Application.findById(appId);
    if (!app) {
      console.log(`❌ Application not found: ${appId}`);
      return res.status(404).json({ message: "Application not found" });
    }

    // עדכון האינטרסים
    app.interests = interests || [];
    await app.save();

    console.log(`✅ Successfully updated interests for app: ${app.name}`);
    res.status(200).json({
      message: "Interests updated successfully",
      interests: app.interests,
    });
  } catch (err) {
    console.error(`❌ Error updating interests for app ${appId}:`, err);
    res
      .status(500)
      .json({ message: "Failed to update interests", error: err.message });
  }
};

/**
 * קבלת clientId לפי appId - עבור ה-SDK
 */
export const getClientIdByAppId = async (req, res) => {
  console.log("getClientIdByAppId");
  const { appId } = req.params;
  console.log(`🔍 Getting client ID for app: ${appId}`);

  try {
    const app = await Application.findById(appId);
    if (!app) {
      console.log(`❌ Application not found: ${appId}`);
      return res.status(404).json({ message: "Application not found" });
    }

    console.log(`✅ Found app: ${app.name}, clientId: ${app.clientId}`);
    res.status(200).json({
      clientId: app.clientId,
      appId: app._id,
    });
  } catch (err) {
    console.error(`❌ Error getting client ID for app ${appId}:`, err);
    res
      .status(500)
      .json({ message: "Failed to retrieve client ID", error: err.message });
  }
};

/**
 * בדיקת סטטוס service account עבור אפליקציה
 */
export const getServiceAccountStatus = async (req, res) => {
  try {
    const { appId } = req.params;

    const app = await Application.findById(appId);
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (app.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const s3Key = `clients/${app.clientId}.json`;

    try {
      const s3Object = await s3
        .headObject({
          Bucket: process.env.FIREBASE_SA_BUCKET,
          Key: s3Key,
        })
        .promise();

      // ניסיון לקרוא את הקובץ כדי לוודא שהוא תקין
      const s3Data = await s3
        .getObject({
          Bucket: process.env.FIREBASE_SA_BUCKET,
          Key: s3Key,
        })
        .promise();

      const serviceAccount = JSON.parse(s3Data.Body.toString());

      res.status(200).json({
        status: "active",
        clientId: app.clientId,
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        lastModified: s3Object.LastModified,
        size: s3Object.ContentLength,
      });
    } catch (s3Error) {
      res.status(200).json({
        status: "missing",
        clientId: app.clientId,
        message: "Service account file not found",
      });
    }
  } catch (error) {
    console.error("❌ Error checking service account status:", error);
    res.status(500).json({
      message: "Failed to check service account status",
      error: error.message,
    });
  }
};

/**
 * מחיקת אפליקציה
 */
export const deleteApplication = async (req, res) => {
  try {
    const { appId } = req.params;

    const app = await Application.findById(appId);
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (app.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // מחיקת service account מ-S3
    try {
      const s3Key = `clients/${app.clientId}.json`;
      await s3
        .deleteObject({
          Bucket: process.env.FIREBASE_SA_BUCKET,
          Key: s3Key,
        })
        .promise();
      console.log(`🗑️ Deleted service account from S3: ${s3Key}`);
    } catch (s3Error) {
      console.warn(
        `⚠️ Failed to delete service account from S3: ${s3Error.message}`
      );
      // ממשיכים עם המחיקה גם אם נכשלנו במחיקת הקובץ מ-S3
    }

    // מחיקת כל הנתונים הקשורים לאפליקציה
    const { default: Device } = await import("../models/Device.js");
    const { default: Segment } = await import("../models/Segment.js");
    const { default: ScheduledNotification } = await import(
      "../models/ScheduledNotification.js"
    );
    const { default: NotificationLog } = await import(
      "../models/NotificationLog.js"
    );

    // מחיקת כל המכשירים הקשורים לאפליקציה
    const deletedDevices = await Device.deleteMany({ appId });
    console.log(`🗑️ Deleted ${deletedDevices.deletedCount} devices`);

    // מחיקת כל הסגמנטים הקשורים לאפליקציה
    const deletedSegments = await Segment.deleteMany({ appId });
    console.log(`🗑️ Deleted ${deletedSegments.deletedCount} segments`);

    // מחיקת כל ההתראות המתוזמנות הקשורות לאפליקציה
    const deletedScheduled = await ScheduledNotification.deleteMany({ appId });
    console.log(
      `🗑️ Deleted ${deletedScheduled.deletedCount} scheduled notifications`
    );

    // מחיקת כל לוגי ההתראות הקשורים לאפליקציה
    const deletedLogs = await NotificationLog.deleteMany({ appId });
    console.log(`🗑️ Deleted ${deletedLogs.deletedCount} notification logs`);

    // מחיקת האפליקציה מהמסד נתונים
    await Application.findByIdAndDelete(appId);

    res.status(200).json({
      message: "Application and all related data deleted successfully",
      deletedCounts: {
        devices: deletedDevices.deletedCount,
        segments: deletedSegments.deletedCount,
        scheduledNotifications: deletedScheduled.deletedCount,
        notificationLogs: deletedLogs.deletedCount,
      },
    });
  } catch (error) {
    console.error("❌ Error deleting application:", error);
    res.status(500).json({
      message: "Failed to delete application",
      error: error.message,
    });
  }
};

/**
 * החלפת service account עבור אפליקציה קיימת
 */
export const updateServiceAccount = async (req, res) => {
  try {
    const { appId } = req.params;
    const { serviceAccountData } = req.body;

    const app = await Application.findById(appId);
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (app.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!serviceAccountData) {
      return res.status(400).json({
        message: "serviceAccountData is required",
      });
    }

    // ולידציה של JSON
    let parsedServiceAccount;
    try {
      parsedServiceAccount =
        typeof serviceAccountData === "string"
          ? JSON.parse(serviceAccountData)
          : serviceAccountData;
    } catch (error) {
      return res.status(400).json({
        message: "Invalid JSON format for service account",
      });
    }

    // בדיקה שהקובץ מכיל את השדות הנדרשים
    const requiredFields = [
      "type",
      "project_id",
      "private_key_id",
      "private_key",
      "client_email",
    ];
    const missingFields = requiredFields.filter(
      (field) => !parsedServiceAccount[field]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields in service account: ${missingFields.join(
          ", "
        )}`,
      });
    }

    // העלאה ל-S3 עם fallback מקומי (החלפה)
    const s3Key = `clients/${app.clientId}.json`;
    const uploadParams = {
      Bucket: process.env.FIREBASE_SA_BUCKET,
      Key: s3Key,
      Body: JSON.stringify(parsedServiceAccount, null, 2),
      ContentType: "application/json",
      ServerSideEncryption: "AES256",
    };

    console.log(`🔄 Updating service account for client: ${app.clientId}`);
    await s3.upload(uploadParams).promise();

    // Clear Firebase cache for this specific client to force reload of new service account
    console.log(`🧹 Clearing Firebase cache for updated service account: ${app.clientId}`);
    clearClientCache(app.clientId);

    res.status(200).json({
      message: "Service account updated successfully",
      clientId: app.clientId,
      projectId: parsedServiceAccount.project_id,
    });
  } catch (error) {
    console.error("❌ Error updating service account:", error);
    res.status(500).json({
      message: "Failed to update service account",
      error: error.message,
    });
  }
};

/**
 * Clear Firebase apps cache manually
 */
export const clearFirebaseCache = async (req, res) => {
  try {
    console.log("🧹 Manual Firebase cache clear requested");
    clearCache();

    res.status(200).json({
      message: "Firebase cache cleared successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error clearing Firebase cache:", error);
    res.status(500).json({
      message: "Failed to clear Firebase cache",
      error: error.message,
    });
  }
};
