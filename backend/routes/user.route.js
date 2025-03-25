import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  updateProfile,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";
const router = express.Router();

router.post("/login", loginUser);
router.post("/register", singleUpload, registerUser);
router.get("/logout", logoutUser);
router.post("/profile/update", isAuthenticated, singleUpload, updateProfile);

export default router;
