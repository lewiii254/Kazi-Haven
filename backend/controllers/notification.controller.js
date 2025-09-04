import { Notification } from "../models/notification.model.js";
import { NotificationPreference } from "../models/notificationPreference.model.js";

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.id;
    const { page = 1, limit = 20, type, isRead } = req.query;

    const filter = { recipient: userId };
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const notifications = await Notification.find(filter)
      .populate({
        path: "sender",
        select: "fullName profilePhoto"
      })
      .populate({
        path: "relatedJob", 
        select: "title company",
        populate: {
          path: "company",
          select: "name logo"
        }
      })
      .populate({
        path: "relatedCompany",
        select: "name logo"
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalNotifications = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });

    return res.status(200).json({
      success: true,
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalNotifications / limit),
        totalNotifications,
        hasNext: page < Math.ceil(totalNotifications / limit),
        hasPrev: page > 1
      },
      unreadCount
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.id;

    let preferences = await NotificationPreference.findOne({ user: userId });
    
    if (!preferences) {
      // Create default preferences if none exist
      preferences = await NotificationPreference.create({ user: userId });
    }

    return res.status(200).json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.id;
    const { preferences, quietHours, frequency } = req.body;

    const updateData = {};
    if (preferences) updateData.preferences = preferences;
    if (quietHours) updateData.quietHours = quietHours;
    if (frequency) updateData.frequency = frequency;

    const updatedPreferences = await NotificationPreference.findOneAndUpdate(
      { user: userId },
      updateData,
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Create notification (utility function for internal use)
export const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  relatedJob = null,
  relatedCompany = null,
  relatedApplication = null,
  priority = "medium",
  actionUrl = null,
  metadata = {}
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      relatedJob,
      relatedCompany,
      relatedApplication,
      priority,
      actionUrl,
      metadata
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.id;

    const stats = await Notification.aggregate([
      { $match: { recipient: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            type: "$type",
            isRead: "$isRead"
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      unread: 0,
      byType: {}
    };

    stats.forEach(stat => {
      formattedStats.total += stat.count;
      if (!stat._id.isRead) {
        formattedStats.unread += stat.count;
      }
      
      if (!formattedStats.byType[stat._id.type]) {
        formattedStats.byType[stat._id.type] = { total: 0, unread: 0 };
      }
      
      formattedStats.byType[stat._id.type].total += stat.count;
      if (!stat._id.isRead) {
        formattedStats.byType[stat._id.type].unread += stat.count;
      }
    });

    return res.status(200).json({
      success: true,
      stats: formattedStats
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};