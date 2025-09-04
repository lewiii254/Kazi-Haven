import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "application_received",
        "application_status_update", 
        "job_match",
        "new_job_posting",
        "company_follow",
        "profile_view",
        "system_announcement",
        "interview_scheduled",
        "offer_extended"
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    relatedCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application", 
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    actionUrl: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Indexes for performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

export const Notification = mongoose.model("Notification", notificationSchema);