import Application from "../models/Application.js";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

// הגדרת S3 client
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/**
 * פונקציה להעלאת service account ל-S3
 */
export const uploadServiceAccount = async (req, res) => {
  try {
    const { serviceAccountData, clientId } = req.body;

    if (!serviceAccountData || !clientId) {
      return res.status(400).json({
        message: "serviceAccountData and clientId are required",
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

    // העלאה ל-S3 עם fallback מקומי
    const s3Key = `clients/${clientId}.json`;
    const uploadParams = {
      Bucket: process.env.FIREBASE_SA_BUCKET,
      Key: s3Key,
      Body: JSON.stringify(parsedServiceAccount, null, 2),
      ContentType: "application/json",
      ServerSideEncryption: "AES256", // הצפנה
    };

    console.log(`📤 Uploading service account for client: ${clientId}`);
    const uploadResult = await s3.upload(uploadParams).promise();

    res.status(200).json({
      message: "Service account uploaded successfully",
      clientId,
      s3Location: uploadResult.Location,
      projectId: parsedServiceAccount.project_id,
    });
  } catch (error) {
    console.error("❌ Error uploading service account:", error);
    res.status(500).json({
      message: "Failed to upload service account",
      error: error.message,
    });
  }
};

/**
 * פונקציה ליצירת clientId ייחודי
 */
export const generateClientId = async (req, res) => {
  try {
    const clientId = `client-${uuidv4()}`;

    // בדיקה שה-clientId לא קיים כבר
    const existingApp = await Application.findOne({ clientId });
    if (existingApp) {
      // אם קיים, ניצור חדש (סיכוי נמוך מאוד)
      return generateClientId(req, res);
    }

    res.status(200).json({ clientId });
  } catch (error) {
    console.error("❌ Error generating client ID:", error);
    res.status(500).json({
      message: "Failed to generate client ID",
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
