import cron from "node-cron";
import ScheduledNotification from "../models/ScheduledNotification.js";
import Device from "../models/Device.js";
import { sendNotificationForClient } from "../config/firebaseAppManager.js";

// helper לחישוב מרחק בין 2 נקודות
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// הפונקציה ששולחת את ההתראה
async function processScheduledNotification(notification) {
  try {
    const { title, body, appId, filters = {} } = notification;

    let devices = await Device.find({ appId });
    console.log("📦 Total devices:", devices.length);

    // סינון מבוסס פילטרים אם רלוונטי
    if (filters.gender && filters.gender !== "") {
      devices = devices.filter((d) => d.userInfo.gender === filters.gender);
    }

    if (filters.ageMin != null) {
      devices = devices.filter((d) => d.userInfo.age >= filters.ageMin);
    }

    if (filters.ageMax != null) {
      devices = devices.filter((d) => d.userInfo.age <= filters.ageMax);
    }

    if (Array.isArray(filters.interests) && filters.interests.length > 0) {
      devices = devices.filter((d) =>
        d.userInfo.interests?.some((interest) =>
          filters.interests.includes(interest)
        )
      );
    }

    if (
      filters.location &&
      filters.location.lat &&
      filters.location.lng &&
      filters.location.radiusKm
    ) {
      const { lat, lng, radiusKm } = filters.location;
      devices = devices.filter((d) => {
        const userLoc = d.userInfo.location;
        if (!userLoc?.lat || !userLoc?.lng) return false;
        const dist = haversineDistance(lat, lng, userLoc.lat, userLoc.lng);
        return dist <= radiusKm;
      });
    }

    if (devices.length === 0) {
      console.log(`🟡 No matching devices for notification: "${title}"`);
      return;
    }

    // קיבוץ מכשירים לפי clientId
    const devicesByClient = devices.reduce((acc, device) => {
      const clientId = device.clientId;
      if (!acc[clientId]) {
        acc[clientId] = [];
      }
      acc[clientId].push(device);
      return acc;
    }, {});

    let totalSuccessCount = 0;
    let totalFailureCount = 0;

    // שליחה לכל client בנפרד
    for (const [clientId, clientDevices] of Object.entries(devicesByClient)) {
      try {
        const tokens = clientDevices.map((d) => d.token);
        const message = {
          notification: { title, body },
          tokens,
        };

        console.log(
          `📤 Sending scheduled notification to ${tokens.length} devices for client: ${clientId}`
        );
        const response = await sendNotificationForClient(clientId, message);

        totalSuccessCount += response.successCount;
        totalFailureCount += response.failureCount;
      } catch (error) {
        console.error(
          `❌ Failed to send scheduled notification for client ${clientId}:`,
          error.message
        );

        // אם זו שגיאת service account, נדלג על הלקוח הזה
        if (
          error.message.includes("Service account not found") ||
          error.message.includes("ClientId is required") ||
          error.message.includes("Please upload your Firebase service account")
        ) {
          console.error(
            `⚠️ Skipping client ${clientId} due to missing service account`
          );
        }

        totalFailureCount += clientDevices.length;
      }
    }

    console.log(
      `✅ Sent scheduled notification "${title}" to ${totalSuccessCount} devices across ${
        Object.keys(devicesByClient).length
      } clients`
    );
  } catch (err) {
    console.error("❌ Failed to send scheduled notification:", err);
  }
}

// פונקציית worker — נרשמת ברגע שהשרת עולה
export default function startNotificationWorker() {
  cron.schedule("* * * * *", async () => {
    const now = new Date(new Date().toISOString());
    console.log(
      "🕐 Checking for scheduled notifications at",
      now.toISOString()
    );

    try {
      const dueNotifications = await ScheduledNotification.find({
        sendAt: { $lte: now },
        status: "pending",
      }).exec();

      console.log("📦 Fetched:", dueNotifications.length, "notifications");

      for (const notification of dueNotifications) {
        await processScheduledNotification(notification);
        notification.status = "sent";
        await notification.save();
      }
    } catch (err) {
      console.error("❌ Error fetching scheduled notifications:", err);
    }
  });
}
