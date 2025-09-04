import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import notificationRoute from "./routes/notification.route.js";
import analyticsRoute from "./routes/analytics.route.js";
import chatRoute from "./routes/chat.route.js";
import aiRoute from "./routes/ai.route.js";
import interviewRoute from "./routes/interview.route.js";
import socketService from "./config/socket.js";
import { redis } from "./config/redis.js";

dotenv.config({});
const app = express();
const httpServer = createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "https://kazi-haven.vercel.app",
    credentials: true,
  })
);

const PORT = process.env.PORT || 3000;

// Initialize Redis connection
redis.connect().catch(console.error);

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.log(err);
  }
};
connectToDB();

// Initialize Socket.IO
socketService.init(httpServer);

//api's

app.use("/api/user", userRoute);
app.use("/api/company", companyRoute);
app.use("/api/job", jobRoute);
app.use("/api/application", applicationRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/api/chat", chatRoute);
app.use("/api/ai", aiRoute);
app.use("/api/interview", interviewRoute);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server is ready for connections`);
});
