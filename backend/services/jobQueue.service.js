import Queue from 'bull';
import { redis } from '../config/redis.js';
import { AnalyticsEvent, JobAnalytics, UserAnalytics } from '../models/analytics.model.js';
import { Notification } from '../models/notification.model.js';
import { InterviewSession } from '../models/interviewSession.model.js';
import { User } from '../models/user.model.js';
import { Job } from '../models/job.model.js';
import jobRecommendationEngine from './jobRecommendation.service.js';
import socketService from '../config/socket.js';

// Create job queues
export const analyticsQueue = new Queue('analytics processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

export const notificationQueue = new Queue('notification processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 25,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

export const recommendationQueue = new Queue('recommendation processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },
  defaultJobOptions: {
    removeOnComplete: 20,
    removeOnFail: 10,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
});

// Analytics processing jobs
analyticsQueue.process('process-analytics-event', async (job) => {
  const { eventData } = job.data;
  
  try {
    // Process the analytics event
    await processAnalyticsEvent(eventData);
    console.log(`Processed analytics event: ${eventData.eventType}`);
  } catch (error) {
    console.error('Error processing analytics event:', error);
    throw error;
  }
});

analyticsQueue.process('update-job-analytics', async (job) => {
  const { jobId, eventType, userId } = job.data;
  
  try {
    await updateJobAnalytics(jobId, eventType, userId);
    console.log(`Updated job analytics for job: ${jobId}`);
  } catch (error) {
    console.error('Error updating job analytics:', error);
    throw error;
  }
});

analyticsQueue.process('update-user-analytics', async (job) => {
  const { userId, eventType, eventData } = job.data;
  
  try {
    await updateUserAnalytics(userId, eventType, eventData);
    console.log(`Updated user analytics for user: ${userId}`);
  } catch (error) {
    console.error('Error updating user analytics:', error);
    throw error;
  }
});

// Notification processing jobs
notificationQueue.process('send-notification', async (job) => {
  const { notificationData } = job.data;
  
  try {
    await processNotification(notificationData);
    console.log('Notification processed successfully');
  } catch (error) {
    console.error('Error processing notification:', error);
    throw error;
  }
});

notificationQueue.process('send-bulk-notifications', async (job) => {
  const { notifications } = job.data;
  
  try {
    await processBulkNotifications(notifications);
    console.log(`Processed ${notifications.length} bulk notifications`);
  } catch (error) {
    console.error('Error processing bulk notifications:', error);
    throw error;
  }
});

notificationQueue.process('send-interview-reminders', async (job) => {
  try {
    await processInterviewReminders();
    console.log('Interview reminders processed');
  } catch (error) {
    console.error('Error processing interview reminders:', error);
    throw error;
  }
});

// Recommendation processing jobs
recommendationQueue.process('generate-recommendations', async (job) => {
  const { userId } = job.data;
  
  try {
    await jobRecommendationEngine.getRecommendations(userId);
    console.log(`Generated recommendations for user: ${userId}`);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
});

recommendationQueue.process('batch-generate-recommendations', async (job) => {
  const { userIds } = job.data;
  
  try {
    await jobRecommendationEngine.batchGenerateRecommendations(userIds);
    console.log(`Generated recommendations for ${userIds.length} users`);
  } catch (error) {
    console.error('Error batch generating recommendations:', error);
    throw error;
  }
});

recommendationQueue.process('update-recommendation-weights', async (job) => {
  const { feedbackData } = job.data;
  
  try {
    await updateRecommendationWeights(feedbackData);
    console.log('Updated recommendation weights based on feedback');
  } catch (error) {
    console.error('Error updating recommendation weights:', error);
    throw error;
  }
});

// Processing functions
async function processAnalyticsEvent(eventData) {
  // Create the analytics event
  const event = await AnalyticsEvent.create(eventData);
  
  // Trigger related processing
  if (eventData.eventData.job) {
    await analyticsQueue.add('update-job-analytics', {
      jobId: eventData.eventData.job,
      eventType: eventData.eventType,
      userId: eventData.user
    }, { delay: 1000 });
  }
  
  await analyticsQueue.add('update-user-analytics', {
    userId: eventData.user,
    eventType: eventData.eventType,
    eventData: eventData.eventData
  }, { delay: 1000 });
  
  return event;
}

async function updateJobAnalytics(jobId, eventType, userId) {
  let analytics = await JobAnalytics.findOne({ job: jobId });
  
  if (!analytics) {
    analytics = new JobAnalytics({
      job: jobId,
      metrics: {
        views: 0,
        uniqueViews: 0,
        applications: 0,
        bookmarks: 0,
        shares: 0
      },
      dailyStats: [],
      topSources: [],
      viewerDemographics: {
        experienceLevels: new Map(),
        locations: new Map(),
        devices: new Map()
      }
    });
  }
  
  // Update metrics based on event type
  const today = new Date().toISOString().split('T')[0];
  let dailyStat = analytics.dailyStats.find(stat => 
    stat.date.toISOString().split('T')[0] === today
  );
  
  if (!dailyStat) {
    dailyStat = {
      date: new Date(),
      views: 0,
      applications: 0,
      bookmarks: 0
    };
    analytics.dailyStats.push(dailyStat);
  }
  
  switch (eventType) {
    case 'job_view':
      analytics.metrics.views++;
      dailyStat.views++;
      break;
    case 'job_apply':
      analytics.metrics.applications++;
      dailyStat.applications++;
      break;
    case 'job_bookmark':
      analytics.metrics.bookmarks++;
      dailyStat.bookmarks++;
      break;
    case 'job_share':
      analytics.metrics.shares++;
      break;
  }
  
  // Calculate conversion rate
  if (analytics.metrics.views > 0) {
    analytics.metrics.conversionRate = (analytics.metrics.applications / analytics.metrics.views) * 100;
  }
  
  // Keep only last 30 days of daily stats
  analytics.dailyStats = analytics.dailyStats
    .filter(stat => new Date() - stat.date < 30 * 24 * 60 * 60 * 1000)
    .slice(-30);
  
  await analytics.save();
}

async function updateUserAnalytics(userId, eventType, eventData) {
  let analytics = await UserAnalytics.findOne({ user: userId });
  
  if (!analytics) {
    analytics = new UserAnalytics({
      user: userId,
      engagement: {
        totalSessions: 0,
        totalTimeSpent: 0,
        averageSessionDuration: 0,
        lastActiveDate: new Date(),
        daysActive: 0
      },
      jobActivity: {
        jobsViewed: 0,
        jobsApplied: 0,
        jobsBookmarked: 0,
        searchesPerformed: 0,
        filtersUsed: 0
      },
      profileActivity: {
        profileViews: 0,
        profileUpdates: 0,
        skillsAssessed: 0
      },
      preferences: {
        mostSearchedTerms: [],
        preferredJobTypes: [],
        preferredLocations: []
      }
    });
  }
  
  // Update analytics based on event type
  analytics.engagement.lastActiveDate = new Date();
  
  switch (eventType) {
    case 'job_view':
      analytics.jobActivity.jobsViewed++;
      break;
    case 'job_apply':
      analytics.jobActivity.jobsApplied++;
      break;
    case 'job_bookmark':
      analytics.jobActivity.jobsBookmarked++;
      break;
    case 'job_search':
      analytics.jobActivity.searchesPerformed++;
      if (eventData.searchQuery) {
        updateSearchTermPreferences(analytics, eventData.searchQuery);
      }
      break;
    case 'filter_use':
      analytics.jobActivity.filtersUsed++;
      break;
    case 'profile_view':
      analytics.profileActivity.profileViews++;
      break;
  }
  
  await analytics.save();
}

function updateSearchTermPreferences(analytics, searchQuery) {
  const terms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 2);
  
  terms.forEach(term => {
    const existingTerm = analytics.preferences.mostSearchedTerms.find(t => t.term === term);
    if (existingTerm) {
      existingTerm.count++;
    } else {
      analytics.preferences.mostSearchedTerms.push({ term, count: 1 });
    }
  });
  
  // Keep only top 20 search terms
  analytics.preferences.mostSearchedTerms = analytics.preferences.mostSearchedTerms
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

async function processNotification(notificationData) {
  // Create notification in database
  const notification = await Notification.create(notificationData);
  
  // Send real-time notification if user is online
  if (socketService.isUserOnline(notificationData.recipient.toString())) {
    socketService.sendNotificationToUser(notificationData.recipient.toString(), {
      type: 'new_notification',
      notification: notification.toObject()
    });
  }
  
  // TODO: Add email/SMS notification logic here based on user preferences
  
  return notification;
}

async function processBulkNotifications(notifications) {
  // Insert all notifications
  const createdNotifications = await Notification.insertMany(notifications);
  
  // Send real-time notifications to online users
  const onlineRecipients = notifications.filter(n => 
    socketService.isUserOnline(n.recipient.toString())
  );
  
  onlineRecipients.forEach(notification => {
    const createdNotification = createdNotifications.find(cn => 
      cn.recipient.toString() === notification.recipient.toString()
    );
    
    socketService.sendNotificationToUser(notification.recipient.toString(), {
      type: 'new_notification',
      notification: createdNotification.toObject()
    });
  });
  
  return createdNotifications;
}

async function processInterviewReminders() {
  const sessions = await InterviewSession.findSessionsForReminders();
  const notifications = [];
  
  const now = new Date();
  
  for (const session of sessions) {
    const timeUntilInterview = session.scheduledAt - now;
    
    let reminderType;
    if (timeUntilInterview <= 30 * 60 * 1000) { // 30 minutes
      reminderType = '30_minutes';
    } else if (timeUntilInterview <= 2 * 60 * 60 * 1000) { // 2 hours
      reminderType = '2_hours';
    } else if (timeUntilInterview <= 24 * 60 * 60 * 1000) { // 24 hours
      reminderType = '24_hours';
    }
    
    if (reminderType) {
      // Check if reminder already sent
      const reminderSent = session.reminders.some(r => r.type === reminderType && r.sent);
      
      if (!reminderSent) {
        // Create notifications for both participants
        notifications.push(
          {
            recipient: session.interviewer,
            type: 'interview_reminder',
            title: 'Interview Reminder',
            message: `Interview starting in ${reminderType.replace('_', ' ')}`,
            relatedJob: session.job,
            metadata: { interviewSessionId: session._id, reminderType }
          },
          {
            recipient: session.candidate,
            type: 'interview_reminder',
            title: 'Interview Reminder',
            message: `Interview starting in ${reminderType.replace('_', ' ')}`,
            relatedJob: session.job,
            metadata: { interviewSessionId: session._id, reminderType }
          }
        );
        
        // Mark reminder as sent
        session.reminders.push({
          type: reminderType,
          sent: true,
          sentAt: new Date()
        });
        
        await session.save();
      }
    }
  }
  
  if (notifications.length > 0) {
    await processBulkNotifications(notifications);
  }
}

async function updateRecommendationWeights(feedbackData) {
  // Simple feedback-based learning
  // In a production system, this would use more sophisticated ML algorithms
  
  const { userId, jobId, rating, actionTaken } = feedbackData;
  
  // Clear user cache to force fresh recommendations
  await jobRecommendationEngine.clearUserCache(userId);
  
  // TODO: Implement more sophisticated weight updating based on feedback
  // This is where you would implement machine learning algorithms to improve recommendations
  
  console.log(`Processing feedback for user ${userId}, job ${jobId}, rating ${rating}, action ${actionTaken}`);
}

// Queue management functions
export function addAnalyticsJob(type, data, options = {}) {
  return analyticsQueue.add(type, data, options);
}

export function addNotificationJob(type, data, options = {}) {
  return notificationQueue.add(type, data, options);
}

export function addRecommendationJob(type, data, options = {}) {
  return recommendationQueue.add(type, data, options);
}

// Schedule recurring jobs
export function scheduleRecurringJobs() {
  // Process interview reminders every 5 minutes
  notificationQueue.add('send-interview-reminders', {}, {
    repeat: { cron: '*/5 * * * *' }, // Every 5 minutes
    removeOnComplete: 1,
    removeOnFail: 1
  });
  
  // Generate recommendations for active users daily
  recommendationQueue.add('batch-generate-recommendations', {}, {
    repeat: { cron: '0 2 * * *' }, // Daily at 2 AM
    removeOnComplete: 1,
    removeOnFail: 1
  });
  
  console.log('Recurring jobs scheduled');
}

// Graceful shutdown
export function gracefulShutdown() {
  return Promise.all([
    analyticsQueue.close(),
    notificationQueue.close(),
    recommendationQueue.close()
  ]);
}