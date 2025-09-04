import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import socketService from "../config/socket.js";
import { cacheUtils } from "../config/redis.js";

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.id;
    const { page = 1, limit = 20 } = req.query;

    // Check cache first
    const cacheKey = `user_chats:${userId}:${page}:${limit}`;
    const cachedChats = await cacheUtils.get(cacheKey);
    
    if (cachedChats) {
      return res.status(200).json({
        success: true,
        chats: cachedChats.chats,
        totalChats: cachedChats.totalChats,
        currentPage: parseInt(page),
        totalPages: cachedChats.totalPages,
        fromCache: true
      });
    }

    const skip = (page - 1) * limit;
    
    const chats = await Chat.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'fullName email profile.profilePhoto role')
    .populate('relatedJob', 'title company')
    .populate('relatedApplication', 'status')
    .sort({ lastActivity: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const totalChats = await Chat.countDocuments({
      participants: userId,
      isActive: true
    });

    // Add unread count and other metadata
    const chatsWithMetadata = chats.map(chat => {
      const chatObj = chat.toObject();
      chatObj.unreadCount = chat.getUnreadCount(userId);
      
      // For direct chats, get the other participant
      if (chat.chatType === 'direct') {
        const otherParticipant = chat.participants.find(p => p._id.toString() !== userId);
        chatObj.otherParticipant = otherParticipant;
        chatObj.displayName = otherParticipant?.fullName || 'Unknown User';
        chatObj.displayPhoto = otherParticipant?.profile?.profilePhoto || '';
      } else {
        chatObj.displayName = chat.title || 'Group Chat';
        chatObj.displayPhoto = '';
      }
      
      return chatObj;
    });

    const result = {
      chats: chatsWithMetadata,
      totalChats,
      totalPages: Math.ceil(totalChats / limit)
    };

    // Cache the result for 5 minutes
    await cacheUtils.set(cacheKey, result, 300);

    res.status(200).json({
      success: true,
      ...result,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error("Error getting user chats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get chats"
    });
  }
};

// Get specific chat
export const getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.id;
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId)
      .populate('participants', 'fullName email profile.profilePhoto role')
      .populate('relatedJob', 'title company description')
      .populate('relatedApplication', 'status');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p._id.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Get paginated messages
    const skip = (page - 1) * limit;
    const messages = chat.messages
      .slice(-skip - parseInt(limit), chat.messages.length - skip)
      .reverse();

    // Mark messages as read
    await chat.markAsRead(userId);

    // Clear cache for user chats
    await cacheUtils.delPattern(`user_chats:${userId}:*`);

    res.status(200).json({
      success: true,
      chat: {
        ...chat.toObject(),
        messages,
        totalMessages: chat.messages.length,
        currentPage: parseInt(page),
        hasMore: skip + parseInt(limit) < chat.messages.length
      }
    });
  } catch (error) {
    console.error("Error getting chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get chat"
    });
  }
};

// Create or get direct chat
export const createOrGetDirectChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.id;

    if (participantId === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot create chat with yourself"
      });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const chat = await Chat.createOrGetDirectChat(userId, participantId);
    
    await chat.populate('participants', 'fullName email profile.profilePhoto role');

    // Clear cache
    await cacheUtils.delPattern(`user_chats:${userId}:*`);
    await cacheUtils.delPattern(`user_chats:${participantId}:*`);

    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    console.error("Error creating/getting chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create chat"
    });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = "text", fileUrl, fileName } = req.body;
    const userId = req.id;

    const chat = await Chat.findById(chatId)
      .populate('participants', 'fullName email profile.profilePhoto role');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p._id.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const messageData = {
      senderId: userId,
      content,
      messageType,
      fileUrl,
      fileName
    };

    await chat.addMessage(messageData);

    // Get the newly added message
    const newMessage = chat.messages[chat.messages.length - 1];

    // Real-time update via Socket.IO
    socketService.io.to(`chat:${chatId}`).emit('new_message', {
      chatId,
      message: newMessage,
      senderInfo: {
        _id: userId,
        fullName: req.user?.fullName || 'Unknown User',
        profilePhoto: req.user?.profile?.profilePhoto || ''
      }
    });

    // Send notification to other participants
    const otherParticipants = chat.participants.filter(p => p._id.toString() !== userId);
    otherParticipants.forEach(participant => {
      socketService.sendNotificationToUser(participant._id.toString(), {
        type: 'new_message',
        title: 'New Message',
        message: `${req.user?.fullName || 'Someone'} sent you a message`,
        data: { chatId, messageId: newMessage._id }
      });
    });

    // Clear cache
    const participantIds = chat.participants.map(p => p._id.toString());
    for (const pId of participantIds) {
      await cacheUtils.delPattern(`user_chats:${pId}:*`);
    }

    res.status(200).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message"
    });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const userId = req.id;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Check if user is the sender or has permission to delete
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Permission denied"
      });
    }

    message.deleteOne();
    
    // Update last message if it was the deleted one
    if (chat.lastMessage && chat.lastMessage._id.toString() === messageId) {
      chat.lastMessage = chat.messages[chat.messages.length - 1] || null;
    }

    await chat.save();

    // Real-time update
    socketService.io.to(`chat:${chatId}`).emit('message_deleted', {
      chatId,
      messageId
    });

    // Clear cache
    const participantIds = chat.participants.map(p => p._id.toString());
    for (const pId of participantIds) {
      await cacheUtils.delPattern(`user_chats:${pId}:*`);
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message"
    });
  }
};

// Mark chat as read
export const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.id;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p._id.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    await chat.markAsRead(userId);

    // Real-time update
    socketService.io.to(`chat:${chatId}`).emit('messages_read', {
      chatId,
      userId,
      timestamp: new Date()
    });

    // Clear cache
    await cacheUtils.delPattern(`user_chats:${userId}:*`);

    res.status(200).json({
      success: true,
      message: "Messages marked as read"
    });
  } catch (error) {
    console.error("Error marking chat as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read"
    });
  }
};

// Archive/unarchive chat
export const toggleChatArchive = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.id;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p._id.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    chat.settings.archived = !chat.settings.archived;
    await chat.save();

    // Clear cache
    await cacheUtils.delPattern(`user_chats:${userId}:*`);

    res.status(200).json({
      success: true,
      message: `Chat ${chat.settings.archived ? 'archived' : 'unarchived'} successfully`,
      archived: chat.settings.archived
    });
  } catch (error) {
    console.error("Error toggling chat archive:", error);
    res.status(500).json({
      success: false,
      message: "Failed to archive/unarchive chat"
    });
  }
};

// Get chat statistics
export const getChatStats = async (req, res) => {
  try {
    const userId = req.id;

    const stats = await Chat.aggregate([
      { $match: { participants: userId } },
      {
        $group: {
          _id: null,
          totalChats: { $sum: 1 },
          directChats: { $sum: { $cond: [{ $eq: ["$chatType", "direct"] }, 1, 0] } },
          groupChats: { $sum: { $cond: [{ $eq: ["$chatType", "group"] }, 1, 0] } },
          archivedChats: { $sum: { $cond: ["$settings.archived", 1, 0] } },
          totalMessages: { $sum: { $size: "$messages" } }
        }
      }
    ]);

    const result = stats[0] || {
      totalChats: 0,
      directChats: 0,
      groupChats: 0,
      archivedChats: 0,
      totalMessages: 0
    };

    res.status(200).json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error("Error getting chat stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get chat statistics"
    });
  }
};