import admin from "../config/firebaseAdmin.js";
import Device from "../models/Device.js";
import ScheduledNotification from "../models/ScheduledNotification.js";
import NotificationLog from "../models/NotificationLog.js";

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

  console.log("title", title);
  console.log("body", body);
  console.log("appId", appId);
  console.log("filters", filters);

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

    // ✅ שמירת לוגים עם type ו־filters
    const logs = tokens.map((token) => ({
      token,
      appId,
      title,
      body,
      type: "broadcast",
      filters: Object.keys(filters).length > 0 ? filters : null,
    }));
    await NotificationLog.insertMany(logs);

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

// 🔸 קבלת כל ההתראות המתוזמנות לאפליקציה (רק pending)
export const getScheduledNotifications = async (req, res) => {
  const { appId } = req.params;

  try {
    const list = await ScheduledNotification.find({
      appId,
      status: "pending",
    }).sort({
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

// 🔸 שליחה למשתמשים מסוימים
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

    // ✅ שמירת לוגים עם type individual
    const logs = tokens.map((token) => ({
      token,
      appId,
      title,
      body,
      type: "individual",
    }));
    await NotificationLog.insertMany(logs);

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

// 🔎 היסטוריה לפי App ID
export const getNotificationHistoryByAppId = async (req, res) => {
  const { appId } = req.params;

  if (!appId) {
    return res.status(400).json({ message: "App ID is required" });
  }

  try {
    const history = await NotificationLog.find({ appId }).sort({ sentAt: -1 });
    res.status(200).json(history);
  } catch (err) {
    console.error("❌ Error fetching notification history by appId:", err);
    res.status(500).json({
      message: "Failed to fetch notification history",
      error: err.message,
    });
  }
};

// 🔎 היסטוריה לפי Token (ל־SDK)
export const getNotificationHistoryByToken = async (req, res) => {
  console.log("🔎 Fetching notification history by token...");
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const history = await NotificationLog.find({ token }).sort({ sentAt: -1 });
    res.status(200).json(history);
  } catch (err) {
    console.error("❌ Error fetching notification history by token:", err);
    res.status(500).json({
      message: "Failed to fetch notification history",
      error: err.message,
    });
  }
};

// ❌ מחיקת התראה לפי ID (משמש את ה־SDK)
export const deleteNotificationById = async (req, res) => {
  console.log("❌ Deleting notification...");

  const { id } = req.params;

  try {
    const deleted = await NotificationLog.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    console.error("❌ Error deleting notification:", err);
    res.status(500).json({
      message: "Failed to delete notification",
      error: err.message,
    });
  }
};

// 🔹 סטטיסטיקה לפי תאריך
export const getDailyNotificationStats = async (req, res) => {
  const { appId } = req.params;
  if (!appId) return res.status(400).json({ message: "App ID is required" });

  try {
    const stats = await NotificationLog.aggregate([
      { $match: { appId } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$sentAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(stats);
  } catch (err) {
    console.error("❌ Error fetching daily stats:", err);
    res.status(500).json({
      message: "Failed to fetch stats",
      error: err.message,
    });
  }
};

// 🔸 עדכון התראה מתוזמנת
export const updateScheduledNotification = async (req, res) => {
  const { id } = req.params;
  const { title, body, sendAt, filters } = req.body;

  try {
    const notification = await ScheduledNotification.findById(id);
    if (!notification) {
      return res
        .status(404)
        .json({ message: "Scheduled notification not found" });
    }

    if (notification.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot update non-pending notification" });
    }

    const updatedNotification = await ScheduledNotification.findByIdAndUpdate(
      id,
      { title, body, sendAt: new Date(sendAt), filters },
      { new: true }
    );

    res.json(updatedNotification);
  } catch (err) {
    console.error("❌ Error updating scheduled notification:", err);
    res
      .status(500)
      .json({ message: "Failed to update scheduled notification" });
  }
};

// 🔸 מחיקת התראה מתוזמנת
export const deleteScheduledNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await ScheduledNotification.findById(id);
    if (!notification) {
      return res
        .status(404)
        .json({ message: "Scheduled notification not found" });
    }

    if (notification.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot delete non-pending notification" });
    }

    await ScheduledNotification.findByIdAndDelete(id);
    res.json({ message: "Scheduled notification deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting scheduled notification:", err);
    res
      .status(500)
      .json({ message: "Failed to delete scheduled notification" });
  }
};

// 🗺️ שליחת התראות לפי מיקום גיאוגרפי
export const sendNotificationByLocation = async (req, res) => {
  const { appId, title, body, bounds } = req.body;

  if (!appId || !title || !body || !bounds) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const { north, south, east, west } = bounds;

  try {
    // מציאת כל המכשירים באזור הגיאוגרפי
    const devices = await Device.find({
      appId,
      "userInfo.location.lat": { $gte: south, $lte: north },
      "userInfo.location.lng": { $gte: west, $lte: east },
    });

    if (devices.length === 0) {
      return res.status(200).json({
        message: "No devices found in the specified area",
        devicesFound: 0,
        successCount: 0,
      });
    }

    const tokens = devices.map((device) => device.token);

    // שליחת ההתראה
    const message = {
      notification: { title, body },
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // שמירת לוגים
    const logs = tokens.map((token) => ({
      token,
      appId,
      title,
      body,
      type: "location-based",
      filters: { location: bounds },
    }));
    await NotificationLog.insertMany(logs);

    res.status(200).json({
      message: `Notification sent to ${response.successCount} devices in the specified area`,
      devicesFound: devices.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
      bounds,
    });
  } catch (err) {
    console.error("❌ Error sending location-based notification:", err);
    res.status(500).json({
      message: "Failed to send location-based notification",
      error: err.message,
    });
  }
};
