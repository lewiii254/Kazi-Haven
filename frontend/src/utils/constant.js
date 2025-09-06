export const USER_BASE_URL = "https://kazi-haven-2.onrender.com/api/user";
export const JOB_BASE_URL = "https://kazi-haven-2.onrender.com/api/job";
export const APPLICATION_BASE_URL =
  "https://kazi-haven-2.onrender.com/api/application";
export const COMPANY_BASE_URL =
  "https://kazi-haven-2.onrender.com/api/company";

// Phase 2 & 3 API Base URLs
export const AI_BASE_URL = "https://kazi-haven-2.onrender.com/api/ai";
export const CHAT_BASE_URL = "https://kazi-haven-2.onrender.com/api/chat";
export const INTERVIEW_BASE_URL = "https://kazi-haven-2.onrender.com/api/interview";
export const NOTIFICATION_BASE_URL = "https://kazi-haven-2.onrender.com/api/notifications";
export const ANALYTICS_BASE_URL = "https://kazi-haven-2.onrender.com/api/analytics";

// For development, use local backend
const isDevelopment = import.meta.env.DEV;
const BACKEND_URL = isDevelopment ? "http://localhost:5000" : "https://kazi-haven-2.onrender.com";

export { BACKEND_URL };

export const getInitialName = (userName) => {
  if (!userName) return "CN";
  return userName
    .split(" ")
    .map((name) => name[0])
    .join("");
};
