import Segment from "../models/Segment.js";

export const createSegment = async (req, res) => {
  try {
    const { name, filters, appId } = req.body;

    if (!name || !appId) {
      return res.status(400).json({ message: "Missing name or appId" });
    }

    const newSegment = await Segment.create({
      name,
      appId,
      filters,
    });

    res.status(201).json({ message: "Segment created", segment: newSegment });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create segment", error: err.message });
  }
};

export const getSegments = async (req, res) => {
  try {
    const { appId } = req.params;
    const segments = await Segment.find({ appId }).sort({ createdAt: -1 });
    res.status(200).json(segments);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch segments", error: err.message });
  }
};
