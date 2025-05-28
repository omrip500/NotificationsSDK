import admin from "firebase-admin";
import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

// Cache לאפליקציות Firebase שכבר נטענו
const appsCache = new Map();

// הגדרת S3 client
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/**
 * טוען service account JSON מ-S3 עבור clientId מסוים
 * @param {string} clientId - מזהה הלקוח
 * @returns {Object} service account JSON
 */
async function getServiceAccountFromS3(clientId) {
  try {
    const params = {
      Bucket: process.env.FIREBASE_SA_BUCKET,
      Key: `clients/${clientId}.json`,
    };

    console.log(`🔍 Loading service account for client: ${clientId}`);
    const data = await s3.getObject(params).promise();
    return JSON.parse(data.Body.toString());
  } catch (error) {
    console.error(
      `❌ Failed to load service account for client ${clientId}:`,
      error.message
    );
    throw new Error(`Service account not found for client: ${clientId}`);
  }
}

/**
 * מחזיר Firebase app עבור clientId מסוים
 * אם האפליקציה כבר קיימת ב-cache, מחזיר אותה
 * אחרת טוען service account מ-S3 ויוצר אפליקציה חדשה
 * @param {string} clientId - מזהה הלקוח
 * @returns {admin.app.App} Firebase app instance
 */
export async function getFirebaseAppForClient(clientId) {
  // בדיקה אם האפליקציה כבר קיימת ב-cache
  if (appsCache.has(clientId)) {
    console.log(`✅ Using cached Firebase app for client: ${clientId}`);
    return appsCache.get(clientId);
  }

  // ולידציה שclientId מוגדר
  if (!clientId || clientId === "undefined" || clientId.trim() === "") {
    throw new Error(
      "ClientId is required. Please ensure your application has a valid clientId and service account uploaded."
    );
  }

  try {
    // טעינת service account מ-S3
    const serviceAccount = await getServiceAccountFromS3(clientId);

    // יצירת Firebase app חדשה עם שם ייחודי
    const app = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
      },
      clientId // שם ייחודי לאפליקציה
    );

    // שמירה ב-cache
    appsCache.set(clientId, app);
    console.log(`🚀 Created new Firebase app for client: ${clientId}`);

    return app;
  } catch (error) {
    console.error(
      `❌ Failed to initialize Firebase app for client ${clientId}:`,
      error.message
    );

    // הודעת שגיאה ברורה למפתח
    if (error.message.includes("Service account not found")) {
      throw new Error(
        `Service account not found for client: ${clientId}. Please upload your Firebase service account JSON file via the web portal.`
      );
    }

    throw error;
  }
}

/**
 * שולח התראה באמצעות Firebase app של לקוח מסוים
 * @param {string} clientId - מזהה הלקוח
 * @param {Object} message - הודעת Firebase
 * @returns {Promise} תוצאת השליחה
 */
export async function sendNotificationForClient(clientId, message) {
  try {
    const app = await getFirebaseAppForClient(clientId);
    const messaging = app.messaging();

    console.log(`📤 Sending notification for client: ${clientId}`);
    return await messaging.sendEachForMulticast(message);
  } catch (error) {
    console.error(
      `❌ Failed to send notification for client ${clientId}:`,
      error.message
    );
    throw error;
  }
}

/**
 * מנקה את ה-cache (שימושי לטסטים או restart)
 */
export function clearCache() {
  // סגירת כל האפליקציות לפני מחיקת ה-cache
  for (const [clientId, app] of appsCache.entries()) {
    try {
      if (app && typeof app.delete === "function") {
        app.delete();
        console.log(`🗑️ Deleted Firebase app for client: ${clientId}`);
      }
    } catch (error) {
      console.error(
        `❌ Error deleting Firebase app for client ${clientId}:`,
        error.message
      );
    }
  }

  appsCache.clear();
  console.log("🧹 Firebase apps cache cleared");
}

/**
 * מחזיר רשימת כל ה-clientIds שנטענו כרגע
 */
export function getCachedClients() {
  return Array.from(appsCache.keys());
}
