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

export const getDevicesByAppId = async (req, res) => {
  const { appId } = req.params;

  try {
    const devices = await Device.find({ appId });

    res.status(200).json(devices);
  } catch (err) {
    console.error("❌ Error fetching devices:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch devices", error: err.message });
  }
};

export const getDeviceByToken = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const device = await Device.findOne({ token });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.status(200).json({ userInfo: device.userInfo });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch device", error: err.message });
  }
};

export const updateDeviceInfo = async (req, res) => {
  const { token, userInfo } = req.body;

  if (!token || !userInfo) {
    return res.status(400).json({ message: "Missing token or userInfo" });
  }

  try {
    const updated = await Device.findOneAndUpdate(
      { token },
      { userInfo },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.status(200).json({ message: "Device updated", device: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update", error: err.message });
  }
};

export const unregisterDevice = async (req, res) => {
  const { token } = req.params;

  try {
    const deleted = await Device.findOneAndDelete({ token });

    if (!deleted) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.status(200).json({ message: "Device unregistered successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to unregister device",
      error: err.message,
    });
  }
};
