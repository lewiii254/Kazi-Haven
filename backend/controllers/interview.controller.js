import { InterviewSession } from "../models/interviewSession.model.js";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { Notification } from "../models/notification.model.js";
import socketService from "../config/socket.js";
import { cacheUtils } from "../config/redis.js";
import { v4 as uuidv4 } from 'uuid';

// Schedule a new interview
export const scheduleInterview = async (req, res) => {
  try {
    const { candidateId, jobId, applicationId, scheduledAt, duration = 60, recordingEnabled = false } = req.body;
    const interviewerId = req.id;

    // Validate interviewer is recruiter
    const interviewer = await User.findById(interviewerId);
    if (interviewer.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can schedule interviews"
      });
    }

    // Validate candidate exists
    const candidate = await User.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }

    // Validate job and application
    const job = await Job.findById(jobId);
    const application = await Application.findById(applicationId);
    
    if (!job || !application) {
      return res.status(404).json({
        success: false,
        message: "Job or application not found"
      });
    }

    // Check for scheduling conflicts
    const scheduledTime = new Date(scheduledAt);
    const conflictWindow = 30 * 60 * 1000; // 30 minutes buffer
    
    const conflicts = await InterviewSession.find({
      $or: [
        { interviewer: interviewerId },
        { candidate: candidateId }
      ],
      status: { $in: ['scheduled', 'in_progress'] },
      scheduledAt: {
        $gte: new Date(scheduledTime.getTime() - conflictWindow),
        $lte: new Date(scheduledTime.getTime() + conflictWindow)
      }
    });

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Scheduling conflict detected. Please choose a different time."
      });
    }

    // Generate unique session ID and room ID
    const sessionId = uuidv4();
    const roomId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create interview session
    const interviewSession = new InterviewSession({
      interviewer: interviewerId,
      candidate: candidateId,
      job: jobId,
      application: applicationId,
      scheduledAt: scheduledTime,
      duration,
      sessionId,
      callConfig: {
        roomId,
        recordingEnabled,
        screenSharingEnabled: true,
      },
      meetingDetails: {
        joinUrl: `${process.env.FRONTEND_URL || 'https://kazi-haven.vercel.app'}/interview/${sessionId}`,
        hostKey: Math.random().toString(36).substr(2, 12),
        participantKey: Math.random().toString(36).substr(2, 12),
      }
    });

    await interviewSession.save();

    // Create notifications
    await Notification.create([
      {
        recipient: candidateId,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `You have an interview scheduled for ${job.title} on ${scheduledTime.toLocaleString()}`,
        relatedJob: jobId,
        relatedApplication: applicationId,
        actionUrl: `/interview/${sessionId}`,
        metadata: { interviewSessionId: interviewSession._id }
      },
      {
        recipient: interviewerId,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `Interview scheduled with ${candidate.fullName} for ${job.title} on ${scheduledTime.toLocaleString()}`,
        relatedJob: jobId,
        relatedApplication: applicationId,
        actionUrl: `/interview/${sessionId}`,
        metadata: { interviewSessionId: interviewSession._id }
      }
    ]);

    // Real-time notifications
    socketService.sendNotificationToUser(candidateId, {
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: `Interview scheduled for ${job.title}`,
      data: { sessionId, scheduledAt }
    });

    socketService.sendNotificationToUser(interviewerId, {
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: `Interview scheduled with ${candidate.fullName}`,
      data: { sessionId, scheduledAt }
    });

    // Update application status
    await Application.findByIdAndUpdate(applicationId, {
      status: 'interview_scheduled'
    });

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      interviewSession: {
        ...interviewSession.toObject(),
        interviewer: { fullName: interviewer.fullName, email: interviewer.email },
        candidate: { fullName: candidate.fullName, email: candidate.email },
        job: { title: job.title }
      }
    });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule interview"
    });
  }
};

// Get interview sessions for a user
export const getUserInterviews = async (req, res) => {
  try {
    const userId = req.id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = {
      $or: [
        { interviewer: userId },
        { candidate: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const interviews = await InterviewSession.find(query)
      .populate('interviewer', 'fullName email profile.profilePhoto')
      .populate('candidate', 'fullName email profile.profilePhoto')
      .populate('job', 'title company')
      .populate('application', 'status')
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalInterviews = await InterviewSession.countDocuments(query);

    res.status(200).json({
      success: true,
      interviews,
      totalInterviews,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalInterviews / limit)
    });
  } catch (error) {
    console.error("Error getting user interviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get interviews"
    });
  }
};

// Get specific interview session
export const getInterviewSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.id;

    const interview = await InterviewSession.findOne({ sessionId })
      .populate('interviewer', 'fullName email profile.profilePhoto role')
      .populate('candidate', 'fullName email profile.profilePhoto role')
      .populate('job', 'title description company requirements')
      .populate('application', 'status createdAt');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found"
      });
    }

    // Check if user is authorized to access this interview
    const isAuthorized = interview.interviewer._id.toString() === userId || 
                        interview.candidate._id.toString() === userId;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.status(200).json({
      success: true,
      interview
    });
  } catch (error) {
    console.error("Error getting interview session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get interview session"
    });
  }
};

// Join interview session
export const joinInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.id;
    const { connectionQuality = 'good' } = req.body;

    const interview = await InterviewSession.findOne({ sessionId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found"
      });
    }

    // Check if user is authorized
    const isAuthorized = interview.interviewer.toString() === userId || 
                        interview.candidate.toString() === userId;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Check if interview is schedulable to join
    const now = new Date();
    const scheduledTime = new Date(interview.scheduledAt);
    const joinWindow = 15 * 60 * 1000; // 15 minutes before/after

    if (now < scheduledTime - joinWindow) {
      return res.status(400).json({
        success: false,
        message: "Interview session is not yet available for joining"
      });
    }

    // Start session if first participant
    if (interview.status === 'scheduled') {
      await interview.startSession();
    }

    // Add participant
    await interview.addParticipant(userId, connectionQuality);
    await interview.logEvent('participant_joined', userId, { connectionQuality });

    // Get user info
    const user = await User.findById(userId).select('fullName role');

    // Notify other participant
    const otherParticipantId = interview.interviewer.toString() === userId ? 
                              interview.candidate.toString() : 
                              interview.interviewer.toString();

    socketService.sendToUser(otherParticipantId, 'participant_joined', {
      sessionId,
      participant: {
        id: userId,
        name: user.fullName,
        role: user.role
      }
    });

    res.status(200).json({
      success: true,
      message: "Joined interview session successfully",
      roomId: interview.callConfig.roomId,
      isHost: interview.interviewer.toString() === userId,
      config: interview.callConfig
    });
  } catch (error) {
    console.error("Error joining interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join interview"
    });
  }
};

// Leave interview session
export const leaveInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.id;

    const interview = await InterviewSession.findOne({ sessionId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found"
      });
    }

    // Remove participant
    await interview.removeParticipant(userId);
    await interview.logEvent('participant_left', userId);

    // Get user info
    const user = await User.findById(userId).select('fullName role');

    // Notify other participant
    const otherParticipantId = interview.interviewer.toString() === userId ? 
                              interview.candidate.toString() : 
                              interview.interviewer.toString();

    socketService.sendToUser(otherParticipantId, 'participant_left', {
      sessionId,
      participant: {
        id: userId,
        name: user.fullName,
        role: user.role
      }
    });

    // End session if both participants have left
    const activeParticipants = interview.participants.filter(p => !p.leftAt);
    if (activeParticipants.length === 0 && interview.status === 'in_progress') {
      await interview.endSession();
    }

    res.status(200).json({
      success: true,
      message: "Left interview session successfully"
    });
  } catch (error) {
    console.error("Error leaving interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to leave interview"
    });
  }
};

// Submit interview assessment
export const submitAssessment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.id;
    const { rating, feedback, technicalSkills, softSkills, overallRecommendation, notes } = req.body;

    const interview = await InterviewSession.findOne({ sessionId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found"
      });
    }

    // Only interviewer can submit assessment
    if (interview.interviewer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the interviewer can submit assessment"
      });
    }

    // Update assessment
    interview.assessment = {
      rating,
      feedback,
      technicalSkills,
      softSkills,
      overallRecommendation,
      notes
    };

    await interview.save();

    // Update application status based on recommendation
    let newStatus = 'under_review';
    if (overallRecommendation === 'strongly_recommend' || overallRecommendation === 'recommend') {
      newStatus = 'interview_passed';
    } else if (overallRecommendation === 'not_recommend' || overallRecommendation === 'strongly_not_recommend') {
      newStatus = 'rejected';
    }

    await Application.findByIdAndUpdate(interview.application, { status: newStatus });

    // Send notification to candidate
    await Notification.create({
      recipient: interview.candidate,
      type: 'interview_feedback',
      title: 'Interview Feedback Available',
      message: 'Your interview feedback has been submitted',
      relatedJob: interview.job,
      relatedApplication: interview.application,
      metadata: { interviewSessionId: interview._id }
    });

    res.status(200).json({
      success: true,
      message: "Assessment submitted successfully",
      assessment: interview.assessment
    });
  } catch (error) {
    console.error("Error submitting assessment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit assessment"
    });
  }
};

// Reschedule interview
export const rescheduleInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { newScheduledAt, reason } = req.body;
    const userId = req.id;

    const interview = await InterviewSession.findOne({ sessionId })
      .populate('interviewer candidate job');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found"
      });
    }

    // Check authorization
    const isAuthorized = interview.interviewer._id.toString() === userId || 
                        interview.candidate._id.toString() === userId;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Can only reschedule if not completed
    if (interview.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: "Cannot reschedule completed interview"
      });
    }

    const oldTime = interview.scheduledAt;
    interview.scheduledAt = new Date(newScheduledAt);
    interview.status = 'scheduled'; // Reset status if it was in progress
    
    await interview.save();

    // Log the reschedule
    await interview.logEvent('rescheduled', userId, { 
      oldTime, 
      newTime: newScheduledAt, 
      reason 
    });

    // Send notifications
    const otherParticipantId = interview.interviewer._id.toString() === userId ? 
                              interview.candidate._id.toString() : 
                              interview.interviewer._id.toString();

    const user = await User.findById(userId);
    
    await Notification.create({
      recipient: otherParticipantId,
      type: 'interview_rescheduled',
      title: 'Interview Rescheduled',
      message: `${user.fullName} has rescheduled the interview for ${interview.job.title}`,
      relatedJob: interview.job._id,
      relatedApplication: interview.application,
      metadata: { 
        interviewSessionId: interview._id,
        oldTime,
        newTime: newScheduledAt,
        reason
      }
    });

    res.status(200).json({
      success: true,
      message: "Interview rescheduled successfully",
      interview
    });
  } catch (error) {
    console.error("Error rescheduling interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reschedule interview"
    });
  }
};

// Cancel interview
export const cancelInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;
    const userId = req.id;

    const interview = await InterviewSession.findOne({ sessionId })
      .populate('interviewer candidate job');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found"
      });
    }

    // Check authorization
    const isAuthorized = interview.interviewer._id.toString() === userId || 
                        interview.candidate._id.toString() === userId;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    interview.status = 'cancelled';
    await interview.save();

    // Log the cancellation
    await interview.logEvent('cancelled', userId, { reason });

    // Send notifications
    const otherParticipantId = interview.interviewer._id.toString() === userId ? 
                              interview.candidate._id.toString() : 
                              interview.interviewer._id.toString();

    const user = await User.findById(userId);
    
    await Notification.create({
      recipient: otherParticipantId,
      type: 'interview_cancelled',
      title: 'Interview Cancelled',
      message: `${user.fullName} has cancelled the interview for ${interview.job.title}`,
      relatedJob: interview.job._id,
      relatedApplication: interview.application,
      metadata: { 
        interviewSessionId: interview._id,
        reason
      }
    });

    res.status(200).json({
      success: true,
      message: "Interview cancelled successfully"
    });
  } catch (error) {
    console.error("Error cancelling interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel interview"
    });
  }
};

// Get interview statistics
export const getInterviewStats = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);

    let stats;

    if (user.role === 'recruiter') {
      // Recruiter stats
      stats = await InterviewSession.aggregate([
        { $match: { interviewer: userId } },
        {
          $group: {
            _id: null,
            totalInterviews: { $sum: 1 },
            completedInterviews: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            scheduledInterviews: { $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] } },
            cancelledInterviews: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
            averageRating: { $avg: "$assessment.rating" },
            totalDuration: { $sum: "$actualDuration" }
          }
        }
      ]);
    } else {
      // Candidate stats
      stats = await InterviewSession.aggregate([
        { $match: { candidate: userId } },
        {
          $group: {
            _id: null,
            totalInterviews: { $sum: 1 },
            completedInterviews: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            scheduledInterviews: { $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] } },
            averageRating: { $avg: "$assessment.rating" }
          }
        }
      ]);
    }

    const result = stats[0] || {
      totalInterviews: 0,
      completedInterviews: 0,
      scheduledInterviews: 0,
      cancelledInterviews: 0,
      averageRating: 0,
      totalDuration: 0
    };

    res.status(200).json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error("Error getting interview stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get interview statistics"
    });
  }
};