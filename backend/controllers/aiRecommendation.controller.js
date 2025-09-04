import jobRecommendationEngine from "../services/jobRecommendation.service.js";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { AnalyticsEvent } from "../models/analytics.model.js";
import { cacheUtils } from "../config/redis.js";
import socketService from "../config/socket.js";

// Get personalized job recommendations
export const getJobRecommendations = async (req, res) => {
  try {
    const userId = req.id;
    const { limit = 10, refresh = false } = req.query;

    // Clear cache if refresh is requested
    if (refresh === 'true') {
      await jobRecommendationEngine.clearUserCache(userId);
    }

    const recommendations = await jobRecommendationEngine.getRecommendations(
      userId, 
      parseInt(limit)
    );

    // Track analytics event
    await AnalyticsEvent.create({
      user: userId,
      eventType: 'ai_recommendations_viewed',
      eventData: {
        recommendationsCount: recommendations.length,
        averageScore: recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length,
        topScore: recommendations[0]?.score || 0
      }
    });

    res.status(200).json({
      success: true,
      recommendations,
      message: `Found ${recommendations.length} personalized job recommendations`
    });
  } catch (error) {
    console.error("Error getting job recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get job recommendations"
    });
  }
};

// Get explanation for a specific job recommendation
export const getRecommendationExplanation = async (req, res) => {
  try {
    const userId = req.id;
    const { jobId } = req.params;

    const user = await User.findById(userId);
    const job = await Job.findById(jobId).populate('company', 'name location');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    // Build user profile for explanation
    const userProfile = await jobRecommendationEngine.buildUserProfile(userId);
    const score = await jobRecommendationEngine.calculateJobScore(userProfile, job);
    const matchReasons = jobRecommendationEngine.getMatchReasons(userProfile, job, score);

    // Detailed breakdown
    const breakdown = {
      overallScore: score,
      skillsMatch: jobRecommendationEngine.calculateSkillsScore(userProfile.skills, job.requirements),
      locationMatch: jobRecommendationEngine.calculateLocationScore(userProfile.location, job.location),
      experienceMatch: jobRecommendationEngine.calculateExperienceScore(userProfile.experience, job.experienceLevel),
      salaryMatch: jobRecommendationEngine.calculateSalaryScore(userProfile.salaryRange, {
        min: job.salaryFrom,
        max: job.salaryTo
      }),
      jobTypeMatch: jobRecommendationEngine.calculateJobTypeScore(userProfile.preferredJobTypes, job.jobType)
    };

    res.status(200).json({
      success: true,
      job: {
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location
      },
      score,
      matchReasons,
      breakdown,
      userFactors: {
        skills: userProfile.skills,
        experience: userProfile.experience,
        location: userProfile.location,
        preferredJobTypes: userProfile.preferredJobTypes,
        salaryRange: userProfile.salaryRange
      }
    });
  } catch (error) {
    console.error("Error getting recommendation explanation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get recommendation explanation"
    });
  }
};

// Update user preferences and refresh recommendations
export const updatePreferencesAndRefresh = async (req, res) => {
  try {
    const userId = req.id;
    const { preferences } = req.body;

    // Update user preferences
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        'profile.careerPreferences': {
          ...preferences
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Clear recommendations cache to force refresh
    await jobRecommendationEngine.clearUserCache(userId);

    // Generate new recommendations
    const recommendations = await jobRecommendationEngine.getRecommendations(userId, 10);

    // Send real-time update
    socketService.sendToUser(userId, 'recommendations_updated', {
      count: recommendations.length,
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: "Preferences updated and recommendations refreshed",
      recommendations
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update preferences"
    });
  }
};

// Get similar jobs based on a specific job
export const getSimilarJobs = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { limit = 5 } = req.query;
    const userId = req.id;

    const targetJob = await Job.findById(jobId).populate('company');
    if (!targetJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    // Get user profile for personalized similar jobs
    const userProfile = await jobRecommendationEngine.buildUserProfile(userId);

    // Find similar jobs based on multiple criteria
    const similarJobs = await Job.find({
      _id: { $ne: jobId },
      isActive: true,
      $or: [
        // Same job title keywords
        { title: { $regex: targetJob.title.split(' ')[0], $options: 'i' } },
        // Same company
        { company: targetJob.company._id },
        // Similar salary range (±20%)
        {
          salaryFrom: {
            $gte: targetJob.salaryFrom * 0.8,
            $lte: targetJob.salaryFrom * 1.2
          }
        },
        // Same location
        { location: targetJob.location },
        // Same job type
        { jobType: targetJob.jobType }
      ]
    }).populate('company', 'name location').limit(parseInt(limit) * 2);

    // Score each similar job for the user
    const scoredSimilarJobs = await Promise.all(
      similarJobs.map(async (job) => {
        const score = await jobRecommendationEngine.calculateJobScore(userProfile, job);
        return { job, score };
      })
    );

    // Sort by score and take top results
    const topSimilarJobs = scoredSimilarJobs
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit));

    // Track analytics
    await AnalyticsEvent.create({
      user: userId,
      eventType: 'similar_jobs_viewed',
      eventData: {
        targetJobId: jobId,
        similarJobsCount: topSimilarJobs.length
      }
    });

    res.status(200).json({
      success: true,
      targetJob: {
        _id: targetJob._id,
        title: targetJob.title,
        company: targetJob.company
      },
      similarJobs: topSimilarJobs
    });
  } catch (error) {
    console.error("Error getting similar jobs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get similar jobs"
    });
  }
};

// Get trending jobs based on AI analysis
export const getTrendingJobs = async (req, res) => {
  try {
    const { limit = 10, category } = req.query;

    // Cache key for trending jobs
    const cacheKey = `trending_jobs:${category || 'all'}:${limit}`;
    const cached = await cacheUtils.get(cacheKey);
    
    if (cached) {
      return res.status(200).json({
        success: true,
        trendingJobs: cached,
        fromCache: true
      });
    }

    // Analyze trending patterns from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Get job interaction analytics
    const trendingAnalytics = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: { $in: ['job_view', 'job_apply', 'job_bookmark'] },
          createdAt: { $gte: sevenDaysAgo },
          'eventData.job': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$eventData.job',
          viewCount: { $sum: { $cond: [{ $eq: ['$eventType', 'job_view'] }, 1, 0] } },
          applyCount: { $sum: { $cond: [{ $eq: ['$eventType', 'job_apply'] }, 1, 0] } },
          bookmarkCount: { $sum: { $cond: [{ $eq: ['$eventType', 'job_bookmark'] }, 1, 0] } },
          totalInteractions: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' },
          trendScore: {
            $add: [
              { $multiply: ['$viewCount', 1] },
              { $multiply: ['$applyCount', 5] },
              { $multiply: ['$bookmarkCount', 3] },
              { $multiply: [{ $size: '$uniqueUsers' }, 2] }
            ]
          }
        }
      },
      { $sort: { trendScore: -1 } },
      { $limit: parseInt(limit) * 2 }
    ]);

    // Get job details
    const jobIds = trendingAnalytics.map(item => item._id);
    let jobQuery = { _id: { $in: jobIds }, isActive: true };
    
    if (category && category !== 'all') {
      jobQuery.category = category;
    }

    const jobs = await Job.find(jobQuery)
      .populate('company', 'name location logo')
      .lean();

    // Combine analytics with job data
    const trendingJobs = trendingAnalytics
      .map(analytics => {
        const job = jobs.find(j => j._id.toString() === analytics._id.toString());
        if (!job) return null;
        
        return {
          job,
          trendingMetrics: {
            trendScore: analytics.trendScore,
            viewCount: analytics.viewCount,
            applyCount: analytics.applyCount,
            bookmarkCount: analytics.bookmarkCount,
            uniqueUsers: analytics.uniqueUserCount,
            totalInteractions: analytics.totalInteractions
          }
        };
      })
      .filter(item => item !== null)
      .slice(0, parseInt(limit));

    // Cache for 30 minutes
    await cacheUtils.set(cacheKey, trendingJobs, 1800);

    res.status(200).json({
      success: true,
      trendingJobs,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error("Error getting trending jobs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get trending jobs"
    });
  }
};

// Get AI insights for recruiters
export const getRecruiterInsights = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);

    if (user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Recruiter role required."
      });
    }

    // Get recruiter's posted jobs
    const jobs = await Job.find({ createdBy: userId }).select('_id title');
    const jobIds = jobs.map(job => job._id);

    // Analyze candidate engagement patterns
    const insights = await AnalyticsEvent.aggregate([
      {
        $match: {
          'eventData.job': { $in: jobIds },
          eventType: { $in: ['job_view', 'job_apply'] },
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            job: '$eventData.job',
            eventType: '$eventType'
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $group: {
          _id: '$_id.job',
          metrics: {
            $push: {
              eventType: '$_id.eventType',
              count: '$count',
              uniqueUsers: { $size: '$uniqueUsers' }
            }
          }
        }
      }
    ]);

    // Calculate conversion rates and other insights
    const jobInsights = insights.map(insight => {
      const job = jobs.find(j => j._id.toString() === insight._id.toString());
      const views = insight.metrics.find(m => m.eventType === 'job_view')?.count || 0;
      const applications = insight.metrics.find(m => m.eventType === 'job_apply')?.count || 0;
      
      return {
        job: {
          _id: job._id,
          title: job.title
        },
        metrics: {
          views,
          applications,
          conversionRate: views > 0 ? ((applications / views) * 100).toFixed(2) : 0,
          engagement: insight.metrics.reduce((sum, m) => sum + m.uniqueUsers, 0)
        }
      };
    });

    // Get candidate skill trends
    const skillTrends = await AnalyticsEvent.aggregate([
      {
        $match: {
          'eventData.job': { $in: jobIds },
          eventType: 'job_apply',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'applicant'
        }
      },
      {
        $unwind: '$applicant'
      },
      {
        $unwind: '$applicant.profile.skills'
      },
      {
        $group: {
          _id: '$applicant.profile.skills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      insights: {
        jobPerformance: jobInsights,
        skillTrends: skillTrends.map(trend => ({
          skill: trend._id,
          applicantCount: trend.count
        })),
        summary: {
          totalJobs: jobs.length,
          totalViews: jobInsights.reduce((sum, j) => sum + j.metrics.views, 0),
          totalApplications: jobInsights.reduce((sum, j) => sum + j.metrics.applications, 0),
          averageConversionRate: (
            jobInsights.reduce((sum, j) => sum + parseFloat(j.metrics.conversionRate), 0) / 
            jobInsights.length
          ).toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error("Error getting recruiter insights:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get recruiter insights"
    });
  }
};

// Feedback on recommendation quality
export const submitRecommendationFeedback = async (req, res) => {
  try {
    const userId = req.id;
    const { jobId, rating, feedback, actionTaken } = req.body;

    // Record feedback for ML improvement
    await AnalyticsEvent.create({
      user: userId,
      eventType: 'recommendation_feedback',
      eventData: {
        job: jobId,
        rating, // 1-5 scale
        feedback,
        actionTaken, // 'applied', 'saved', 'dismissed', 'viewed'
        timestamp: new Date()
      }
    });

    // If positive feedback, boost similar recommendations
    if (rating >= 4) {
      // This could trigger a background job to update recommendation weights
      await jobRecommendationEngine.clearUserCache(userId);
    }

    res.status(200).json({
      success: true,
      message: "Feedback recorded successfully"
    });
  } catch (error) {
    console.error("Error submitting recommendation feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback"
    });
  }
};