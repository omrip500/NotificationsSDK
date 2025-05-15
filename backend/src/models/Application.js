// backend/src/models/Application.js
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    platform: {
      type: String,
      enum: ["android", "ios", "web"],
      default: "android",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interests: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);
export default Application;
