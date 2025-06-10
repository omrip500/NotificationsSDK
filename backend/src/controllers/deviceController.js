import Device from "../models/Device.js";

export const registerDeviceToken = async (req, res) => {
  console.log("📱 Registering device token...");
  console.log("📝 Request body:", JSON.stringify(req.body, null, 2));

  try {
    const { token, appId, clientId, userInfo } = req.body;

    console.log("🔍 Extracted fields:");
    console.log("   token:", token ? token.substring(0, 10) + "..." : "MISSING");
    console.log("   appId:", appId || "MISSING");
    console.log("   clientId:", clientId || "MISSING");
    console.log("   userInfo:", userInfo ? "Present" : "MISSING");

    if (!token || !appId || !clientId || !userInfo) {
      console.log("❌ Missing required fields!");
      return res.status(400).json({
        message:
          "Missing fields: token, appId, clientId, and userInfo are required",
      });
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
      { token, appId, clientId },
      { token, appId, clientId, userInfo: safeUserInfo },
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

// Debug endpoint - ללא authentication
export const getDevicesByAppIdDebug = async (req, res) => {
  const { appId } = req.params;
  console.log(`🔍 Debug: Getting devices for app: ${appId}`);

  try {
    const devices = await Device.find({ appId });
    console.log(`✅ Found ${devices.length} devices for app ${appId}`);

    // הצגת סיכום של clientIds
    const clientIdCounts = {};
    devices.forEach((device) => {
      const clientId = device.clientId || "no-client-id";
      clientIdCounts[clientId] = (clientIdCounts[clientId] || 0) + 1;
    });

    console.log(`📊 Client ID distribution:`, clientIdCounts);

    res.status(200).json({
      totalDevices: devices.length,
      clientIdDistribution: clientIdCounts,
      devices: devices.map((d) => ({
        token: d.token.substring(0, 20) + "...",
        clientId: d.clientId,
        userId: d.userInfo?.userId,
        createdAt: d.createdAt,
      })),
    });
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

export const getDevicesWithLocation = async (req, res) => {
  const { appId } = req.params;

  try {
    const devices = await Device.find({
      appId,
      "userInfo.location.lat": { $exists: true, $ne: null },
      "userInfo.location.lng": { $exists: true, $ne: null },
    });

    const devicesWithLocation = devices.map((device) => ({
      _id: device._id,
      token: device.token,
      userInfo: device.userInfo,
      location: device.userInfo.location,
    }));

    res.status(200).json(devicesWithLocation);
  } catch (err) {
    console.error("❌ Error fetching devices with location:", err);
    res.status(500).json({
      message: "Failed to fetch devices with location",
      error: err.message,
    });
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

// New endpoint specifically for location updates (more efficient)
export const updateDeviceLocation = async (req, res) => {
  const { token, lat, lng } = req.body;

  if (!token || lat === undefined || lng === undefined) {
    return res.status(400).json({ message: "Missing token, lat, or lng" });
  }

  try {
    const updated = await Device.findOneAndUpdate(
      { token },
      {
        "userInfo.location.lat": lat,
        "userInfo.location.lng": lng,
        "userInfo.lastLocationUpdate": new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Device not found" });
    }

    console.log(`📍 Location updated for device ${token}: ${lat}, ${lng}`);
    res.status(200).json({
      message: "Location updated successfully",
      location: { lat, lng },
    });
  } catch (err) {
    console.error("❌ Error updating device location:", err);
    res
      .status(500)
      .json({ message: "Failed to update location", error: err.message });
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
