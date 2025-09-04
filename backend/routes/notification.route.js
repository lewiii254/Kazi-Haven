import express from "express";
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationStats
} from "../controllers/notification.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/").get(isAuthenticated, getNotifications);
router.route("/:notificationId/read").patch(isAuthenticated, markAsRead);
router.route("/mark-all-read").patch(isAuthenticated, markAllAsRead);
router.route("/:notificationId").delete(isAuthenticated, deleteNotification);
router.route("/preferences").get(isAuthenticated, getNotificationPreferences);
router.route("/preferences").put(isAuthenticated, updateNotificationPreferences);
router.route("/stats").get(isAuthenticated, getNotificationStats);

export default router;