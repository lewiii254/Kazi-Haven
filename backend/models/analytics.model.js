import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      enum: [
        'page_view',
        'job_view',
        'job_search',
        'job_apply',
        'profile_view',
        'company_view',
        'filter_use',
        'bookmark_job',
        'share_job',
        'download_resume',
        'user_signup',
        'user_login',
        'job_post',
        'application_status_change'
      ],
      required: true,
    },
    eventData: {
      page: { type: String },
      job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
      company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
      searchQuery: { type: String },
      filters: { type: mongoose.Schema.Types.Mixed },
      application: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
      duration: { type: Number }, // Time spent on page/action in seconds
      referrer: { type: String },
      userAgent: { type: String },
      ipAddress: { type: String }
    },
    deviceInfo: {
      type: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
      browser: { type: String },
      os: { type: String }
    },
    location: {
      country: { type: String },
      city: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    }
  },
  { timestamps: true }
);

// Indexes for performance
analyticsEventSchema.index({ user: 1, createdAt: -1 });
analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ sessionId: 1 });
analyticsEventSchema.index({ 'eventData.job': 1 });
analyticsEventSchema.index({ 'eventData.company': 1 });

export const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);

const jobAnalyticsSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      unique: true,
    },
    metrics: {
      views: { type: Number, default: 0 },
      uniqueViews: { type: Number, default: 0 },
      applications: { type: Number, default: 0 },
      bookmarks: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      clickThroughRate: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 }
    },
    dailyStats: [{
      date: { type: Date, required: true },
      views: { type: Number, default: 0 },
      applications: { type: Number, default: 0 },
      bookmarks: { type: Number, default: 0 }
    }],
    topSources: [{
      source: { type: String },
      count: { type: Number, default: 0 }
    }],
    viewerDemographics: {
      experienceLevels: { type: Map, of: Number, default: {} },
      locations: { type: Map, of: Number, default: {} },
      devices: { type: Map, of: Number, default: {} }
    }
  },
  { timestamps: true }
);

export const JobAnalytics = mongoose.model("JobAnalytics", jobAnalyticsSchema);

const userAnalyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    engagement: {
      totalSessions: { type: Number, default: 0 },
      totalTimeSpent: { type: Number, default: 0 }, // in seconds
      averageSessionDuration: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: Date.now },
      daysActive: { type: Number, default: 0 }
    },
    jobActivity: {
      jobsViewed: { type: Number, default: 0 },
      jobsApplied: { type: Number, default: 0 },
      jobsBookmarked: { type: Number, default: 0 },
      searchesPerformed: { type: Number, default: 0 },
      filtersUsed: { type: Number, default: 0 }
    },
    profileActivity: {
      profileViews: { type: Number, default: 0 },
      profileUpdates: { type: Number, default: 0 },
      skillsAssessed: { type: Number, default: 0 }
    },
    preferences: {
      mostSearchedTerms: [{ term: String, count: Number }],
      preferredJobTypes: [{ type: String, count: Number }],
      preferredLocations: [{ location: String, count: Number }]
    }
  },
  { timestamps: true }
);

export const UserAnalytics = mongoose.model("UserAnalytics", userAnalyticsSchema);