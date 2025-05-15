import Application from "../models/Application.js";

export const createApplication = async (req, res) => {
  try {
    const { name, platform, interests } = req.body;

    const newApp = new Application({
      name,
      platform,
      user: req.userId,
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
