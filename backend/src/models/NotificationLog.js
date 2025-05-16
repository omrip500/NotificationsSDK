import mongoose from "mongoose";

const notificationLogSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    appId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ["broadcast", "individual"],
      default: "broadcast",
    },
    filters: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("NotificationLog", notificationLogSchema);
