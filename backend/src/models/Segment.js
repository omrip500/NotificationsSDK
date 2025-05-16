import mongoose from "mongoose";

const segmentSchema = new mongoose.Schema(
  {
    appId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    filters: {
      gender: String,
      ageMin: Number,
      ageMax: Number,
      interests: [String],
      location: {
        lat: Number,
        lng: Number,
        radiusKm: Number,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Segment", segmentSchema);
