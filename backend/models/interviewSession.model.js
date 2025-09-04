import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema({
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true,
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // Duration in minutes
    default: 60,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled',
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  // Video call configuration
  callConfig: {
    roomId: String,
    maxParticipants: {
      type: Number,
      default: 2,
    },
    recordingEnabled: {
      type: Boolean,
      default: false,
    },
    screenSharingEnabled: {
      type: Boolean,
      default: true,
    },
  },
  // Session tracking
  actualStartTime: Date,
  actualEndTime: Date,
  actualDuration: Number, // Actual duration in minutes
  
  // Participants tracking
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    joinedAt: Date,
    leftAt: Date,
    connectionQuality: String, // 'excellent', 'good', 'poor'
  }],
  
  // Recording information
  recording: {
    enabled: {
      type: Boolean,
      default: false,
    },
    url: String,
    startTime: Date,
    endTime: Date,
    size: Number, // File size in bytes
  },
  
  // Interview assessment
  assessment: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
    technicalSkills: [{
      skill: String,
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
    }],
    softSkills: [{
      skill: String,
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
    }],
    overallRecommendation: {
      type: String,
      enum: ['strongly_recommend', 'recommend', 'neutral', 'not_recommend', 'strongly_not_recommend'],
    },
    notes: String,
  },
  
  // Technical details
  connectionLogs: [{
    timestamp: Date,
    event: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    details: mongoose.Schema.Types.Mixed,
  }],
  
  // Follow-up actions
  followUp: {
    nextRound: {
      scheduled: {
        type: Boolean,
        default: false,
      },
      scheduledAt: Date,
      type: String, // 'technical', 'final', 'panel'
    },
    feedback: {
      sent: {
        type: Boolean,
        default: false,
      },
      sentAt: Date,
    },
  },
  
  // Meeting links and credentials
  meetingDetails: {
    joinUrl: String,
    hostKey: String,
    participantKey: String,
    backupMeeting: {
      platform: String, // 'zoom', 'meet', 'teams'
      url: String,
    },
  },
  
  // Reminders and notifications
  reminders: [{
    type: {
      type: String,
      enum: ['24_hours', '2_hours', '30_minutes'],
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: Date,
  }],
  
}, { timestamps: true });

// Indexes for performance
interviewSessionSchema.index({ interviewer: 1, scheduledAt: 1 });
interviewSessionSchema.index({ candidate: 1, scheduledAt: 1 });
interviewSessionSchema.index({ job: 1, scheduledAt: 1 });
interviewSessionSchema.index({ status: 1, scheduledAt: 1 });
interviewSessionSchema.index({ sessionId: 1 });

// Virtual for session duration in a readable format
interviewSessionSchema.virtual('durationFormatted').get(function() {
  if (this.actualDuration) {
    const hours = Math.floor(this.actualDuration / 60);
    const minutes = this.actualDuration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
  return `${this.duration}m (scheduled)`;
});

// Method to start session
interviewSessionSchema.methods.startSession = function() {
  this.status = 'in_progress';
  this.actualStartTime = new Date();
  return this.save();
};

// Method to end session
interviewSessionSchema.methods.endSession = function() {
  if (this.actualStartTime) {
    this.actualEndTime = new Date();
    this.actualDuration = Math.round(
      (this.actualEndTime - this.actualStartTime) / (1000 * 60)
    );
  }
  this.status = 'completed';
  return this.save();
};

// Method to add participant
interviewSessionSchema.methods.addParticipant = function(userId, connectionQuality = 'good') {
  const existingParticipant = this.participants.find(p => p.userId.toString() === userId.toString());
  
  if (existingParticipant) {
    // Update join time if reconnecting
    existingParticipant.joinedAt = new Date();
    existingParticipant.connectionQuality = connectionQuality;
  } else {
    this.participants.push({
      userId,
      joinedAt: new Date(),
      connectionQuality
    });
  }
  
  return this.save();
};

// Method to remove participant
interviewSessionSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (participant) {
    participant.leftAt = new Date();
  }
  return this.save();
};

// Method to log connection event
interviewSessionSchema.methods.logEvent = function(event, userId, details = {}) {
  this.connectionLogs.push({
    timestamp: new Date(),
    event,
    userId,
    details
  });
  return this.save();
};

// Static method to find active sessions for user
interviewSessionSchema.statics.findActiveForUser = function(userId) {
  return this.find({
    $or: [
      { interviewer: userId },
      { candidate: userId }
    ],
    status: { $in: ['scheduled', 'in_progress'] }
  }).populate('interviewer candidate job application');
};

// Static method to find sessions requiring reminders
interviewSessionSchema.statics.findSessionsForReminders = function() {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);

  return this.find({
    status: 'scheduled',
    $or: [
      {
        scheduledAt: { $lte: in24Hours, $gte: now },
        'reminders.type': { $ne: '24_hours' }
      },
      {
        scheduledAt: { $lte: in2Hours, $gte: now },
        'reminders.type': { $ne: '2_hours' }
      },
      {
        scheduledAt: { $lte: in30Minutes, $gte: now },
        'reminders.type': { $ne: '30_minutes' }
      }
    ]
  });
};

export const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);