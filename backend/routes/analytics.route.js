import express from "express";
import { 
  trackEvent, 
  getUserAnalytics, 
  getJobAnalytics,
  getAdminAnalytics
} from "../controllers/analytics.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/track").post(trackEvent); // Can be used without auth for anonymous tracking
router.route("/user").get(isAuthenticated, getUserAnalytics);
router.route("/job/:jobId").get(isAuthenticated, getJobAnalytics);
router.route("/admin").get(isAuthenticated, getAdminAnalytics); // Should add admin middleware

export default router;