import mongoose from "mongoose";

const notificationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    preferences: {
      email: {
        jobMatches: { type: Boolean, default: true },
        applicationUpdates: { type: Boolean, default: true },
        newJobPostings: { type: Boolean, default: false },
        companyUpdates: { type: Boolean, default: false },
        marketingEmails: { type: Boolean, default: false },
      },
      inApp: {
        jobMatches: { type: Boolean, default: true },
        applicationUpdates: { type: Boolean, default: true },
        newJobPostings: { type: Boolean, default: true },
        companyUpdates: { type: Boolean, default: true },
        profileViews: { type: Boolean, default: true },
      },
      push: {
        jobMatches: { type: Boolean, default: false },
        applicationUpdates: { type: Boolean, default: true },
        newJobPostings: { type: Boolean, default: false },
        urgent: { type: Boolean, default: true },
      },
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: "22:00" },
      endTime: { type: String, default: "08:00" },
      timezone: { type: String, default: "Africa/Nairobi" },
    },
    frequency: {
      digest: {
        type: String,
        enum: ["never", "daily", "weekly", "monthly"],
        default: "weekly",
      },
      summary: {
        type: String,
        enum: ["never", "daily", "weekly"],
        default: "daily",
      },
    },
  },
  { timestamps: true }
);

export const NotificationPreference = mongoose.model("NotificationPreference", notificationPreferenceSchema);