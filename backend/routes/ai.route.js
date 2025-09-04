import express from "express";
import {
  getJobRecommendations,
  getRecommendationExplanation,
  updatePreferencesAndRefresh,
  getSimilarJobs,
  getTrendingJobs,
  getRecruiterInsights,
  submitRecommendationFeedback
} from "../controllers/aiRecommendation.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Get AI-powered job recommendations
router.get("/recommendations", isAuthenticated, getJobRecommendations);

// Get explanation for a specific recommendation
router.get("/recommendations/:jobId/explanation", isAuthenticated, getRecommendationExplanation);

// Update preferences and refresh recommendations
router.post("/preferences/update", isAuthenticated, updatePreferencesAndRefresh);

// Get similar jobs
router.get("/jobs/:jobId/similar", isAuthenticated, getSimilarJobs);

// Get trending jobs
router.get("/trending", getTrendingJobs);

// Get recruiter insights (AI-powered analytics)
router.get("/recruiter/insights", isAuthenticated, getRecruiterInsights);

// Submit recommendation feedback
router.post("/feedback", isAuthenticated, submitRecommendationFeedback);

export default router;