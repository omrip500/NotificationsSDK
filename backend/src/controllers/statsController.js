import NotificationLog from "../models/NotificationLog.js";
import Device from "../models/Device.js";
import mongoose from "mongoose";

export const getOverviewStats = async (req, res) => {
  try {
    const { appId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(appId)) {
      return res.status(400).json({ message: "Invalid appId" });
    }

    // 1. התראות ליום
    const perDay = await NotificationLog.aggregate([
      { $match: { appId: new mongoose.Types.ObjectId(appId) } },
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

    // 2. פילוח מגדר
    const genderAgg = await Device.aggregate([
      { $match: { appId: new mongoose.Types.ObjectId(appId) } },
      {
        $group: {
          _id: "$userInfo.gender",
          count: { $sum: 1 },
        },
      },
    ]);

    const genderDistribution = {};
    genderAgg.forEach((g) => {
      genderDistribution[g._id || "unknown"] = g.count;
    });

    // 3. פילוח תחומי עניין
    const interestAgg = await Device.aggregate([
      { $match: { appId: new mongoose.Types.ObjectId(appId) } },
      { $unwind: "$userInfo.interests" },
      {
        $group: {
          _id: "$userInfo.interests",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const interests = interestAgg.map((i) => ({
      name: i._id,
      count: i.count,
    }));

    // 4. סה"כ התראות
    const total = await NotificationLog.countDocuments({
      appId: new mongoose.Types.ObjectId(appId),
    });

    res.json({
      perDay: perDay.map((d) => ({ date: d._id, count: d.count })),
      genderDistribution,
      interests,
      total,
    });
  } catch (err) {
    console.error("Error getting overview stats:", err);
    res.status(500).json({ message: "Failed to load overview stats" });
  }
};

export const getPerUserStats = async (req, res) => {
  const { appId } = req.params;

  try {
    // שלב 1: מביא את כל המכשירים הרשומים לאפליקציה עם userInfo
    const devices = await Device.find({ appId });

    const userMap = {};
    for (const device of devices) {
      const { userInfo, token } = device;
      if (!userInfo?.userId) continue;

      if (!userMap[userInfo.userId]) {
        userMap[userInfo.userId] = {
          userId: userInfo.userId,
          gender: userInfo.gender,
          age: userInfo.age,
          interests: userInfo.interests || [],
          tokens: [],
        };
      }
      userMap[userInfo.userId].tokens.push(token);
    }

    // שלב 2: עבור כל משתמש, סופר את ההתראות לפי יום
    const allStats = [];

    for (const user of Object.values(userMap)) {
      const logs = await NotificationLog.find({
        appId,
        token: { $in: user.tokens },
      });

      const perDayMap = {};
      logs.forEach((log) => {
        const dateStr = log.sentAt.toISOString().split("T")[0];
        perDayMap[dateStr] = (perDayMap[dateStr] || 0) + 1;
      });

      const perDay = Object.entries(perDayMap).map(([date, count]) => ({
        date,
        count,
      }));

      allStats.push({
        userId: user.userId,
        gender: user.gender,
        age: user.age,
        interests: user.interests,
        notifications: logs.length,
        perDay,
      });
    }

    res.json(allStats);
  } catch (err) {
    console.error("❌ Error generating per-user stats:", err);
    res.status(500).json({ message: "Failed to load per-user stats" });
  }
};
