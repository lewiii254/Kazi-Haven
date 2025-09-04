import { io } from 'socket.io-client';
import { store } from '../redux/store';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    const state = store.getState();
    const token = state.auth.user?.token;

    if (!token) {
      console.log('No token available for socket connection');
      return;
    }

    this.socket = io(import.meta.env.VITE_BACKEND_URL || 'https://kazi-haven-2.onrender.com', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Notification events
    this.socket.on('notification', (notification) => {
      // Dispatch to Redux store or show toast
      this.handleNotification(notification);
    });

    this.socket.on('new_notification', (data) => {
      this.handleNotification(data.notification);
    });

    // Chat events
    this.socket.on('new_message', (data) => {
      this.handleNewMessage(data);
    });

    this.socket.on('user_typing', (data) => {
      this.handleUserTyping(data);
    });

    this.socket.on('message_deleted', (data) => {
      this.handleMessageDeleted(data);
    });

    this.socket.on('messages_read', (data) => {
      this.handleMessagesRead(data);
    });

    // Video call events
    this.socket.on('incoming_video_call', (data) => {
      this.handleIncomingCall(data);
    });

    this.socket.on('video_call_accepted', (data) => {
      this.handleCallAccepted(data);
    });

    this.socket.on('video_call_rejected', (data) => {
      this.handleCallRejected(data);
    });

    this.socket.on('video_call_ended', (data) => {
      this.handleCallEnded(data);
    });

    // WebRTC signaling
    this.socket.on('webrtc_offer', (data) => {
      this.handleWebRTCOffer(data);
    });

    this.socket.on('webrtc_answer', (data) => {
      this.handleWebRTCAnswer(data);
    });

    this.socket.on('webrtc_ice_candidate', (data) => {
      this.handleWebRTCIceCandidate(data);
    });

    // Job updates
    this.socket.on('job_update', (data) => {
      this.handleJobUpdate(data);
    });

    this.socket.on('application_update', (data) => {
      this.handleApplicationUpdate(data);
    });

    // Interview events
    this.socket.on('participant_joined', (data) => {
      this.handleParticipantJoined(data);
    });

    this.socket.on('participant_left', (data) => {
      this.handleParticipantLeft(data);
    });

    // Recommendations
    this.socket.on('recommendations_updated', (data) => {
      this.handleRecommendationsUpdated(data);
    });
  }

  // Event handlers
  handleNotification(notification) {
    // Show toast notification
    if (window.showToast) {
      window.showToast(notification.title, notification.message, 'info');
    }

    // Dispatch to Redux store
    store.dispatch({
      type: 'notifications/addNotification',
      payload: notification
    });

    // Play notification sound (optional)
    this.playNotificationSound();
  }

  handleNewMessage(data) {
    store.dispatch({
      type: 'chat/addMessage',
      payload: data
    });

    // Show notification if not in active chat
    const state = store.getState();
    const activeChatId = state.chat?.activeChatId;
    
    if (activeChatId !== data.chatId) {
      this.handleNotification({
        title: 'New Message',
        message: `${data.senderInfo.fullName}: ${data.message.content.substring(0, 50)}...`,
        type: 'new_message'
      });
    }
  }

  handleUserTyping(data) {
    store.dispatch({
      type: 'chat/updateTypingStatus',
      payload: data
    });
  }

  handleMessageDeleted(data) {
    store.dispatch({
      type: 'chat/removeMessage',
      payload: data
    });
  }

  handleMessagesRead(data) {
    store.dispatch({
      type: 'chat/markMessagesRead',
      payload: data
    });
  }

  handleIncomingCall(data) {
    store.dispatch({
      type: 'video/incomingCall',
      payload: data
    });
  }

  handleCallAccepted(data) {
    store.dispatch({
      type: 'video/callAccepted',
      payload: data
    });
  }

  handleCallRejected(data) {
    store.dispatch({
      type: 'video/callRejected',
      payload: data
    });
  }

  handleCallEnded(data) {
    store.dispatch({
      type: 'video/callEnded',
      payload: data
    });
  }

  handleWebRTCOffer(data) {
    store.dispatch({
      type: 'video/webrtcOffer',
      payload: data
    });
  }

  handleWebRTCAnswer(data) {
    store.dispatch({
      type: 'video/webrtcAnswer',
      payload: data
    });
  }

  handleWebRTCIceCandidate(data) {
    store.dispatch({
      type: 'video/webrtcIceCandidate',
      payload: data
    });
  }

  handleJobUpdate(data) {
    store.dispatch({
      type: 'jobs/updateJob',
      payload: data
    });
  }

  handleApplicationUpdate(data) {
    store.dispatch({
      type: 'applications/updateApplication',
      payload: data
    });
  }

  handleParticipantJoined(data) {
    store.dispatch({
      type: 'interview/participantJoined',
      payload: data
    });
  }

  handleParticipantLeft(data) {
    store.dispatch({
      type: 'interview/participantLeft',
      payload: data
    });
  }

  handleRecommendationsUpdated(data) {
    store.dispatch({
      type: 'recommendations/updated',
      payload: data
    });
  }

  // Utility methods
  playNotificationSound() {
    // Play a subtle notification sound
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors if audio can't be played
      });
    } catch (error) {
      // Ignore audio errors
    }
  }

  // Chat methods
  joinChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_chat', { chatId });
    }
  }

  leaveChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_chat', { chatId });
    }
  }

  sendMessage(chatId, message, recipientId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', { chatId, message, recipientId });
    }
  }

  startTyping(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { chatId });
    }
  }

  stopTyping(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { chatId });
    }
  }

  // Video call methods
  initiateVideoCall(recipientId, callType, callId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('video_call_initiate', { recipientId, callType, callId });
    }
  }

  acceptVideoCall(callId, senderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('video_call_accept', { callId, senderId });
    }
  }

  rejectVideoCall(callId, senderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('video_call_reject', { callId, senderId });
    }
  }

  endVideoCall(callId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('video_call_end', { callId });
    }
  }

  // WebRTC signaling methods
  sendWebRTCOffer(recipientId, offer) {
    if (this.socket && this.isConnected) {
      this.socket.emit('webrtc_offer', { recipientId, offer });
    }
  }

  sendWebRTCAnswer(recipientId, answer) {
    if (this.socket && this.isConnected) {
      this.socket.emit('webrtc_answer', { recipientId, answer });
    }
  }

  sendWebRTCIceCandidate(recipientId, candidate) {
    if (this.socket && this.isConnected) {
      this.socket.emit('webrtc_ice_candidate', { recipientId, candidate });
    }
  }

  // Job subscription methods
  subscribeToJobUpdates(jobId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_job_updates', { jobId });
    }
  }

  unsubscribeFromJobUpdates(jobId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('unsubscribe_job_updates', { jobId });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isSocketConnected() {
    return this.socket && this.isConnected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;