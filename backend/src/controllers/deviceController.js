import Device from "../models/Device.js";

export const registerDeviceToken = async (req, res) => {
  console.log("📱 Registering device token...");

  try {
    const { token, appId, userInfo } = req.body;

    if (!token || !appId || !userInfo) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // ודא שקיים מיקום ותחומי עניין – או שים ברירת מחדל
    const safeUserInfo = {
      userId: userInfo.userId || "",
      gender: userInfo.gender || "",
      age: userInfo.age || null,
      interests: userInfo.interests || [],
      location: {
        lat: userInfo.lat || 0,
        lng: userInfo.lng || 0,
      },
    };

    const device = await Device.findOneAndUpdate(
      { token, appId },
      { token, appId, userInfo: safeUserInfo },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Device registered", device });
  } catch (err) {
    res.status(500).json({
      message: "Failed to register device",
      error: err.message,
    });
  }
};
