import Segment from "../models/Segment.js";

export const createSegment = async (req, res) => {
  try {
    const { appId, name, filters } = req.body;
    const userId = req.userId;

    const segment = new Segment({
      appId,
      name,
      filters,
      user: userId,
    });

    await segment.save();
    res.status(201).json(segment);
  } catch (error) {
    console.error("Create Segment Error:", error);
    res.status(500).json({ message: "Failed to create segment" });
  }
};

export const getSegmentsByApp = async (req, res) => {
  try {
    const { appId } = req.params;
    const segments = await Segment.find({ appId });
    res.json(segments);
  } catch (error) {
    console.error("Get Segments Error:", error);
    res.status(500).json({ message: "Failed to fetch segments" });
  }
};

export const deleteSegment = async (req, res) => {
  try {
    const { segmentId } = req.params;
    await Segment.findByIdAndDelete(segmentId);
    res.json({ message: "Segment deleted" });
  } catch (error) {
    console.error("Delete Segment Error:", error);
    res.status(500).json({ message: "Failed to delete segment" });
  }
};
