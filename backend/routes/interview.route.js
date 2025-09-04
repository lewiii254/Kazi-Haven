import express from "express";
import {
  scheduleInterview,
  getUserInterviews,
  getInterviewSession,
  joinInterview,
  leaveInterview,
  submitAssessment,
  rescheduleInterview,
  cancelInterview,
  getInterviewStats
} from "../controllers/interview.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Schedule a new interview
router.post("/schedule", isAuthenticated, scheduleInterview);

// Get user's interviews
router.get("/", isAuthenticated, getUserInterviews);

// Get specific interview session
router.get("/:sessionId", isAuthenticated, getInterviewSession);

// Join interview session
router.post("/:sessionId/join", isAuthenticated, joinInterview);

// Leave interview session
router.post("/:sessionId/leave", isAuthenticated, leaveInterview);

// Submit interview assessment (interviewer only)
router.post("/:sessionId/assessment", isAuthenticated, submitAssessment);

// Reschedule interview
router.patch("/:sessionId/reschedule", isAuthenticated, rescheduleInterview);

// Cancel interview
router.patch("/:sessionId/cancel", isAuthenticated, cancelInterview);

// Get interview statistics
router.get("/stats/overview", isAuthenticated, getInterviewStats);

export default router;