import mongoose from "mongoose";

const scheduledNotificationSchema = new mongoose.Schema(
  {
    appId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    title: String,
    body: String,
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
    sendAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "ScheduledNotification",
  scheduledNotificationSchema
);
