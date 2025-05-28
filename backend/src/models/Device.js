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

// אינדקס ייחודי עבור token + appId + clientId
deviceSchema.index({ token: 1, appId: 1, clientId: 1 }, { unique: true });

// אינדקס נוסף לחיפוש מהיר לפי clientId
deviceSchema.index({ clientId: 1 });

const Device = mongoose.model("Device", deviceSchema);
export default Device;
