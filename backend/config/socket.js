import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { pubClient, subClient } from './redis.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Store user socket mappings
  }

  // Initialize Socket.IO server
  init(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "https://kazi-haven.vercel.app",
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // Set up Redis adapter for horizontal scaling
    this.io.adapter(createAdapter(pubClient, subClient));

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.userData = user;
        
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    console.log('Socket.IO server initialized');
    return this.io;
  }

  // Handle new socket connection
  handleConnection(socket) {
    const userId = socket.userId;
    
    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    
    // Join user to their personal room
    socket.join(`user:${userId}`);
    
    // Join role-based rooms
    socket.join(`role:${socket.userRole}`);

    console.log(`User ${userId} connected with socket ${socket.id}`);

    // Update user's online status
    this.updateUserStatus(userId, true);

    // Handle real-time events
    this.setupEventHandlers(socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  // Setup event handlers for the socket
  setupEventHandlers(socket) {
    const userId = socket.userId;

    // Join chat room
    socket.on('join_chat', (data) => {
      const { chatId } = data;
      socket.join(`chat:${chatId}`);
      console.log(`User ${userId} joined chat ${chatId}`);
    });

    // Leave chat room
    socket.on('leave_chat', (data) => {
      const { chatId } = data;
      socket.leave(`chat:${chatId}`);
      console.log(`User ${userId} left chat ${chatId}`);
    });

    // Handle new message
    socket.on('send_message', (data) => {
      this.handleNewMessage(socket, data);
    });

    // Typing indicators
    socket.on('typing_start', (data) => {
      const { chatId } = data;
      socket.to(`chat:${chatId}`).emit('user_typing', {
        userId,
        userName: socket.userData.fullName,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { chatId } = data;
      socket.to(`chat:${chatId}`).emit('user_typing', {
        userId,
        userName: socket.userData.fullName,
        isTyping: false
      });
    });

    // Video call events
    socket.on('video_call_initiate', (data) => {
      this.handleVideoCallInitiate(socket, data);
    });

    socket.on('video_call_accept', (data) => {
      this.handleVideoCallAccept(socket, data);
    });

    socket.on('video_call_reject', (data) => {
      this.handleVideoCallReject(socket, data);
    });

    socket.on('video_call_end', (data) => {
      this.handleVideoCallEnd(socket, data);
    });

    // WebRTC signaling
    socket.on('webrtc_offer', (data) => {
      this.handleWebRTCSignaling(socket, data, 'webrtc_offer');
    });

    socket.on('webrtc_answer', (data) => {
      this.handleWebRTCSignaling(socket, data, 'webrtc_answer');
    });

    socket.on('webrtc_ice_candidate', (data) => {
      this.handleWebRTCSignaling(socket, data, 'webrtc_ice_candidate');
    });

    // Job application real-time updates
    socket.on('subscribe_job_updates', (data) => {
      const { jobId } = data;
      socket.join(`job:${jobId}`);
    });

    socket.on('unsubscribe_job_updates', (data) => {
      const { jobId } = data;
      socket.leave(`job:${jobId}`);
    });
  }

  // Handle socket disconnection
  handleDisconnection(socket) {
    const userId = socket.userId;
    
    // Remove user from connected users
    this.connectedUsers.delete(userId);
    
    // Update user's offline status
    this.updateUserStatus(userId, false);

    console.log(`User ${userId} disconnected`);
  }

  // Update user online/offline status
  async updateUserStatus(userId, isOnline) {
    try {
      await User.findByIdAndUpdate(userId, {
        'profile.lastActiveDate': new Date(),
        'profile.isOnline': isOnline
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  // Handle new message in chat
  handleNewMessage(socket, data) {
    const { chatId, message, recipientId } = data;
    const senderId = socket.userId;

    // Emit to chat room
    this.io.to(`chat:${chatId}`).emit('new_message', {
      chatId,
      message: {
        ...message,
        senderId,
        timestamp: new Date(),
        id: Date.now().toString()
      }
    });

    // Send notification to recipient if they're not in the chat
    if (recipientId && !this.isUserInRoom(recipientId, `chat:${chatId}`)) {
      this.sendNotificationToUser(recipientId, {
        type: 'new_message',
        title: 'New Message',
        message: `${socket.userData.fullName} sent you a message`,
        data: { chatId, senderId }
      });
    }
  }

  // Handle video call initiation
  handleVideoCallInitiate(socket, data) {
    const { recipientId, callType, callId } = data;
    const senderId = socket.userId;

    // Send call invitation to recipient
    this.sendToUser(recipientId, 'incoming_video_call', {
      callId,
      callType,
      senderId,
      senderName: socket.userData.fullName,
      senderPhoto: socket.userData.profile.profilePhoto
    });
  }

  // Handle video call acceptance
  handleVideoCallAccept(socket, data) {
    const { callId, senderId } = data;
    
    // Notify caller that call was accepted
    this.sendToUser(senderId, 'video_call_accepted', {
      callId,
      acceptorId: socket.userId,
      acceptorName: socket.userData.fullName
    });

    // Join both users to call room
    socket.join(`call:${callId}`);
    const senderSocket = this.getSocketByUserId(senderId);
    if (senderSocket) {
      this.io.sockets.sockets.get(senderSocket).join(`call:${callId}`);
    }
  }

  // Handle video call rejection
  handleVideoCallReject(socket, data) {
    const { callId, senderId } = data;
    
    // Notify caller that call was rejected
    this.sendToUser(senderId, 'video_call_rejected', {
      callId,
      rejectorId: socket.userId,
      rejectorName: socket.userData.fullName
    });
  }

  // Handle video call end
  handleVideoCallEnd(socket, data) {
    const { callId } = data;
    
    // Notify all participants that call ended
    this.io.to(`call:${callId}`).emit('video_call_ended', {
      callId,
      endedBy: socket.userId
    });

    // Remove all sockets from call room
    this.io.in(`call:${callId}`).socketsLeave(`call:${callId}`);
  }

  // Handle WebRTC signaling
  handleWebRTCSignaling(socket, data, eventType) {
    const { recipientId, ...signalData } = data;
    
    // Forward signaling data to recipient
    this.sendToUser(recipientId, eventType, signalData);
  }

  // Utility methods
  getSocketByUserId(userId) {
    return this.connectedUsers.get(userId);
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  isUserInRoom(userId, room) {
    const socketId = this.getSocketByUserId(userId);
    if (!socketId) return false;
    
    const socket = this.io.sockets.sockets.get(socketId);
    return socket ? socket.rooms.has(room) : false;
  }

  // Send message to specific user
  sendToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Send notification to specific user
  sendNotificationToUser(userId, notification) {
    this.io.to(`user:${userId}`).emit('notification', notification);
  }

  // Send to all users with specific role
  sendToRole(role, event, data) {
    this.io.to(`role:${role}`).emit(event, data);
  }

  // Send to all users
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  // Send job update to subscribers
  sendJobUpdate(jobId, update) {
    this.io.to(`job:${jobId}`).emit('job_update', update);
  }

  // Send application update
  sendApplicationUpdate(applicantId, recruiterId, update) {
    this.sendToUser(applicantId, 'application_update', update);
    this.sendToUser(recruiterId, 'application_update', update);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get users by role
  getUsersByRole(role) {
    const users = [];
    this.connectedUsers.forEach((socketId, userId) => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket && socket.userRole === role) {
        users.push(userId);
      }
    });
    return users;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;