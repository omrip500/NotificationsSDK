import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    appId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    userInfo: {
      userId: String,
      gender: String,
      age: Number,
      interests: [String], // 🆕 תחומי עניין
      location: {
        lat: Number,
        lng: Number,
      },
    },
  },
  { timestamps: true }
);

deviceSchema.index({ token: 1, appId: 1 }, { unique: true });

const Device = mongoose.model("Device", deviceSchema);
export default Device;
