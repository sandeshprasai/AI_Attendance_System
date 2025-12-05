import axios from "axios";

const BACKEND_URL = "http://localhost:9000";

const API = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  headers: { "Content-Type": "application/json" }
});

// Attach JWT token dynamically
API.interceptors.request.use(config => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.authorization = token;
  return config;
});

// Helper function to get image URL or fetch image blob
export const getUserImageURL = (filename) => {
  if (!filename) return "/default-avatar.png"; // fallback
  return `${BACKEND_URL}/public/${filename}`;
};

// Optional: fetch image as blob (if you need to process it)
export const fetchUserImage = async (filename) => {
  if (!filename) return null;
  try {
    const response = await axios.get(`${BACKEND_URL}/public/${filename}`, {
      responseType: "blob"
    });
    return URL.createObjectURL(response.data); // returns a local URL for the blob
  } catch (err) {
    console.error("Failed to fetch image", err);
    return "/default-avatar.png";
  }
};

export default API;