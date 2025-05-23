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
      gender: { type: String },
      ageMin: Number,
      ageMax: Number,
      interests: [String],
      location: {
        lat: Number,
        lng: Number,
        radiusKm: Number,
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Segment", segmentSchema);
