import { AnalyticsEvent, JobAnalytics, UserAnalytics } from "../models/analytics.model.js";
import { Job } from "../models/job.model.js";
import mongoose from "mongoose";

// Track analytics event
export const trackEvent = async (req, res) => {
  try {
    const { eventType, eventData, deviceInfo, location } = req.body;
    const userId = req.id || null;
    const sessionId = req.headers['x-session-id'] || req.sessionID || 'anonymous';

    const event = await AnalyticsEvent.create({
      user: userId,
      sessionId,
      eventType,
      eventData: {
        ...eventData,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        referrer: req.headers.referer
      },
      deviceInfo,
      location
    });

    // Update relevant analytics based on event type
    if (userId) {
      await updateUserAnalytics(userId, eventType, eventData);
    }

    if (eventType === 'job_view' && eventData.job) {
      await updateJobAnalytics(eventData.job, 'view', userId);
    }

    if (eventType === 'job_apply' && eventData.job) {
      await updateJobAnalytics(eventData.job, 'application', userId);
    }

    return res.status(200).json({
      success: true,
      message: "Event tracked successfully"
    });
  } catch (error) {
    console.error("Error tracking event:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get user analytics dashboard
export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.id;
    const { timeframe = '30d' } = req.query;

    const dateFilter = getDateFilter(timeframe);

    // Get user analytics summary
    let userAnalytics = await UserAnalytics.findOne({ user: userId });
    if (!userAnalytics) {
      userAnalytics = await UserAnalytics.create({ user: userId });
    }

    // Get recent activity
    const recentEvents = await AnalyticsEvent.find({
      user: userId,
      createdAt: { $gte: dateFilter }
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('eventData.job', 'title company')
    .populate('eventData.company', 'name');

    // Get activity by day
    const dailyActivity = await AnalyticsEvent.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          events: { $sum: 1 },
          uniqueEvents: { $addToSet: "$eventType" }
        }
      },
      {
        $project: {
          date: "$_id",
          events: 1,
          uniqueEventTypes: { $size: "$uniqueEvents" }
        }
      },
      { $sort: { date: 1 } }
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        summary: userAnalytics,
        recentEvents,
        dailyActivity
      }
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get job analytics (for recruiters)
export const getJobAnalytics = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.id;

    // Verify job ownership
    const job = await Job.findOne({ _id: jobId, created_By: userId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or access denied"
      });
    }

    let jobAnalytics = await JobAnalytics.findOne({ job: jobId });
    if (!jobAnalytics) {
      jobAnalytics = await JobAnalytics.create({ job: jobId });
    }

    // Get recent analytics events for this job
    const recentEvents = await AnalyticsEvent.find({
      $or: [
        { 'eventData.job': jobId },
        { eventType: 'job_view', 'eventData.job': jobId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(100);

    return res.status(200).json({
      success: true,
      analytics: jobAnalytics,
      recentEvents
    });
  } catch (error) {
    console.error("Error fetching job analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get admin analytics dashboard
export const getAdminAnalytics = async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const dateFilter = getDateFilter(timeframe);

    // Overall platform metrics
    const platformMetrics = await AnalyticsEvent.aggregate([
      {
        $match: { createdAt: { $gte: dateFilter } }
      },
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: "$user" }
        }
      },
      {
        $project: {
          eventType: "$_id",
          count: 1,
          uniqueUsers: { $size: "$uniqueUsers" }
        }
      }
    ]);

    // Daily platform activity
    const dailyActivity = await AnalyticsEvent.aggregate([
      {
        $match: { createdAt: { $gte: dateFilter } }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          events: { $sum: 1 },
          uniqueUsers: { $addToSet: "$user" }
        }
      },
      {
        $project: {
          date: "$_id",
          events: 1,
          uniqueUsers: { $size: "$uniqueUsers" }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Top jobs by activity
    const topJobs = await JobAnalytics.find()
      .sort({ 'metrics.views': -1 })
      .limit(10)
      .populate('job', 'title company')
      .populate('job.company', 'name');

    // User engagement stats
    const userEngagement = await UserAnalytics.aggregate([
      {
        $group: {
          _id: null,
          avgSessionDuration: { $avg: "$engagement.averageSessionDuration" },
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [
                { $gte: ["$engagement.lastActiveDate", dateFilter] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        platformMetrics,
        dailyActivity,
        topJobs,
        userEngagement: userEngagement[0] || {}
      }
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Helper functions
const updateUserAnalytics = async (userId, eventType, eventData) => {
  try {
    const updateData = {};

    switch (eventType) {
      case 'job_view':
        updateData['$inc'] = { 'jobActivity.jobsViewed': 1 };
        break;
      case 'job_apply':
        updateData['$inc'] = { 'jobActivity.jobsApplied': 1 };
        break;
      case 'job_search':
        updateData['$inc'] = { 'jobActivity.searchesPerformed': 1 };
        break;
      case 'filter_use':
        updateData['$inc'] = { 'jobActivity.filtersUsed': 1 };
        break;
      case 'bookmark_job':
        updateData['$inc'] = { 'jobActivity.jobsBookmarked': 1 };
        break;
      case 'profile_view':
        updateData['$inc'] = { 'profileActivity.profileViews': 1 };
        break;
    }

    if (Object.keys(updateData).length > 0) {
      updateData['$set'] = { 'engagement.lastActiveDate': new Date() };
      
      await UserAnalytics.findOneAndUpdate(
        { user: userId },
        updateData,
        { upsert: true }
      );
    }
  } catch (error) {
    console.error("Error updating user analytics:", error);
  }
};

const updateJobAnalytics = async (jobId, actionType, userId) => {
  try {
    const updateData = {};
    const today = new Date().toISOString().split('T')[0];

    switch (actionType) {
      case 'view':
        updateData['$inc'] = { 'metrics.views': 1 };
        break;
      case 'application':
        updateData['$inc'] = { 'metrics.applications': 1 };
        break;
      case 'bookmark':
        updateData['$inc'] = { 'metrics.bookmarks': 1 };
        break;
      case 'share':
        updateData['$inc'] = { 'metrics.shares': 1 };
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await JobAnalytics.findOneAndUpdate(
        { job: jobId },
        updateData,
        { upsert: true }
      );

      // Update daily stats
      await JobAnalytics.findOneAndUpdate(
        { 
          job: jobId,
          'dailyStats.date': new Date(today)
        },
        {
          $inc: {
            [`dailyStats.$.${actionType}s`]: 1
          }
        }
      );

      // If no daily stat exists for today, create one
      await JobAnalytics.findOneAndUpdate(
        { 
          job: jobId,
          'dailyStats.date': { $ne: new Date(today) }
        },
        {
          $push: {
            dailyStats: {
              date: new Date(today),
              [actionType + 's']: 1
            }
          }
        }
      );
    }
  } catch (error) {
    console.error("Error updating job analytics:", error);
  }
};

const getDateFilter = (timeframe) => {
  const now = new Date();
  switch (timeframe) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
};