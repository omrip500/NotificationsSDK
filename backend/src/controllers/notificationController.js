import admin from "../config/firebaseAdmin.js";
import Device from "../models/Device.js";

// helper לחישוב מרחק בין 2 נקודות גאוגרפיות (בק"מ)
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // רדיוס כדוה"א בק"מ
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export const sendNotification = async (req, res) => {
  console.log("📢 Sending notification...");
  const { title, body, appId, filters = {} } = req.body;

  if (!title || !body || !appId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    let devices = await Device.find({ appId });

    // סינון לפי פילטרים
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
        d.userInfo.interests?.some((interest) =>
          filters.interests.includes(interest)
        )
      );
    }

    if (filters.location) {
      const { lat, lng, radiusKm } = filters.location;
      devices = devices.filter((d) => {
        const userLoc = d.userInfo.location;
        if (!userLoc?.lat || !userLoc?.lng) return false;
        const dist = haversineDistance(lat, lng, userLoc.lat, userLoc.lng);
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
