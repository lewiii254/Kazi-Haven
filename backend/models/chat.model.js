import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    enum: ["text", "file", "image", "video"],
    default: "text",
  },
  fileUrl: {
    type: String,
  },
  fileName: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }],
  chatType: {
    type: String,
    enum: ["direct", "group"],
    default: "direct",
  },
  title: {
    type: String,
    // Required for group chats, optional for direct chats
  },
  description: {
    type: String,
  },
  messages: [messageSchema],
  lastMessage: {
    type: messageSchema,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // For job-related chats
  relatedJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  },
  relatedApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
  },
  // Chat settings
  settings: {
    notifications: {
      type: Boolean,
      default: true,
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  // Typing indicators
  typingUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, { timestamps: true });

// Indexes for performance
chatSchema.index({ participants: 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ relatedJob: 1 });
chatSchema.index({ relatedApplication: 1 });
chatSchema.index({ "messages.senderId": 1, "messages.createdAt": -1 });

// Virtual for unread message count per user
chatSchema.methods.getUnreadCount = function(userId) {
  return this.messages.filter(message => 
    !message.isRead && 
    message.senderId.toString() !== userId.toString()
  ).length;
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  this.messages.forEach(message => {
    if (message.senderId.toString() !== userId.toString() && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
    }
  });
  return this.save();
};

// Method to add message
chatSchema.methods.addMessage = function(messageData) {
  const message = {
    ...messageData,
    _id: new mongoose.Types.ObjectId(),
  };
  
  this.messages.push(message);
  this.lastMessage = message;
  this.lastActivity = new Date();
  
  return this.save();
};

// Static method to find chat between two users
chatSchema.statics.findDirectChat = function(user1Id, user2Id) {
  return this.findOne({
    chatType: "direct",
    participants: { $all: [user1Id, user2Id], $size: 2 }
  });
};

// Static method to create or get direct chat
chatSchema.statics.createOrGetDirectChat = async function(user1Id, user2Id) {
  let chat = await this.findDirectChat(user1Id, user2Id);
  
  if (!chat) {
    chat = new this({
      participants: [user1Id, user2Id],
      chatType: "direct",
    });
    await chat.save();
  }
  
  return chat;
};

export const Chat = mongoose.model("Chat", chatSchema);