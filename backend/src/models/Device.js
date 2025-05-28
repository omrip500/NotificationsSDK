import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    appId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    clientId: {
      type: String,
      required: true,
      index: true, // Add index for better query performance
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
      lastLocationUpdate: { type: Date, default: Date.now }, // 🆕 זמן עדכון מיקום אחרון
    },
  },
  { timestamps: true }
);

// Compound index for unique device registration per client
deviceSchema.index({ token: 1, appId: 1, clientId: 1 }, { unique: true });

// Additional index for efficient clientId queries
deviceSchema.index({ clientId: 1 });

const Device = mongoose.model("Device", deviceSchema);
export default Device;
