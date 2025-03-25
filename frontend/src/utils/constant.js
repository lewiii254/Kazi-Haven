export const USER_BASE_URL = "https://kazi-haven-2.onrender.com/api/user";
export const JOB_BASE_URL = "https://kazi-haven-2.onrender.com/api/job";
export const APPLICATION_BASE_URL =
  "https://kazi-haven-2.onrender.com/api/application";
export const COMPANY_BASE_URL =
  "https://kazi-haven-2.onrender.com/api/company";

export const getInitialName = (userName) => {
  if (!userName) return "CN";
  return userName
    .split(" ")
    .map((name) => name[0])
    .join("");
};
