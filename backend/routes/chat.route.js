import express from "express";
import {
  getUserChats,
  getChat,
  createOrGetDirectChat,
  sendMessage,
  deleteMessage,
  markChatAsRead,
  toggleChatArchive,
  getChatStats
} from "../controllers/chat.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

// Get all chats for user
router.get("/", isAuthenticated, getUserChats);

// Get specific chat
router.get("/:chatId", isAuthenticated, getChat);

// Create or get direct chat
router.post("/direct", isAuthenticated, createOrGetDirectChat);

// Send message
router.post("/:chatId/messages", isAuthenticated, sendMessage);

// Delete message
router.delete("/:chatId/messages/:messageId", isAuthenticated, deleteMessage);

// Mark chat as read
router.patch("/:chatId/read", isAuthenticated, markChatAsRead);

// Archive/unarchive chat
router.patch("/:chatId/archive", isAuthenticated, toggleChatArchive);

// Get chat statistics
router.get("/stats/overview", isAuthenticated, getChatStats);

export default router;