import admin from "../config/firebaseAdmin.js";
import Device from "../models/Device.js";
import ScheduledNotification from "../models/ScheduledNotification.js";

// helper לחישוב מרחק בין 2 נקודות גאוגרפיות (בק"מ)
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

// 🔹 שליחה מיידית
export const sendNotification = async (req, res) => {
  console.log("📢 Sending notification...");
  const { title, body, appId, filters = {} } = req.body;

  if (!title || !body || !appId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    let devices = await Device.find({ appId });

    if (filters.gender) {
      devices = devices.filter((d) => d.userInfo.gender === filters.gender);
    }
    if (filters.ageMin) {
      devices = devices.filter((d) => d.userInfo.age >= filters.ageMin);
    }
    if (filters.ageMax) {
      devices = devices.filter((d) => d.userInfo.age <= filters.ageMax);
    }
    if (filters.interests?.length > 0) {
      devices = devices.filter((d) =>
        d.userInfo.interests?.some((i) => filters.interests.includes(i))
      );
    }
    if (filters.location) {
      const { lat, lng, radiusKm } = filters.location;
      devices = devices.filter((d) => {
        const loc = d.userInfo.location;
        if (!loc?.lat || !loc?.lng) return false;
        const dist = haversineDistance(lat, lng, loc.lat, loc.lng);
        return dist <= radiusKm;
      });
    }

    const tokens = devices.map((d) => d.token);
    if (tokens.length === 0) {
      return res.status(404).json({ message: "No matching devices found" });
    }

    const message = {
      notification: { title, body },
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    res.status(200).json({
      message: `Notification sent to ${response.successCount} devices`,
      failures: response.failureCount,
    });
  } catch (err) {
    console.error("❌ Error sending notification:", err);
    res.status(500).json({
      message: "Failed to send notification",
      error: err.message,
    });
  }
};

// 🔸 תזמון שליחה עתידית
export const scheduleNotification = async (req, res) => {
  const { title, body, appId, filters = {}, sendAt } = req.body;

  if (!title || !body || !appId || !sendAt) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const scheduled = await ScheduledNotification.create({
      title,
      body,
      appId,
      filters,
      sendAt,
    });

    res.status(201).json({
      message: "Notification scheduled successfully",
      scheduled,
    });
  } catch (err) {
    console.error("❌ Error scheduling notification:", err);
    res.status(500).json({
      message: "Failed to schedule notification",
      error: err.message,
    });
  }
};

// 🔸 קבלת כל ההתראות המתוזמנות לאפליקציה
export const getScheduledNotifications = async (req, res) => {
  const { appId } = req.params;

  try {
    const list = await ScheduledNotification.find({ appId }).sort({
      sendAt: 1,
    });
    res.status(200).json(list);
  } catch (err) {
    console.error("❌ Error fetching scheduled notifications:", err);
    res.status(500).json({
      message: "Failed to fetch scheduled notifications",
      error: err.message,
    });
  }
};

export const sendToSpecificTokens = async (req, res) => {
  const { title, body, appId, tokens } = req.body;

  if (!title || !body || !appId || !tokens || !Array.isArray(tokens)) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const message = {
      notification: { title, body },
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    res.status(200).json({
      message: `Notification sent to ${response.successCount} devices`,
      failures: response.failureCount,
    });
  } catch (err) {
    console.error("❌ Error sending specific notification:", err);
    res.status(500).json({
      message: "Failed to send specific notification",
      error: err.message,
    });
  }
};
