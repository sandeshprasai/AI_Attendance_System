import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: `${API_URL}api/v1`,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token dynamically
API.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  if (token) config.headers.authorization = `Bearer ${token}`;
  return config;
});

// Build final image URL
export const getUserImageURL = (filename) => {
  if (!filename) return "/default-avatar.png";

  // If Cloudinary URL → return as is
  if (filename.startsWith("http")) return filename;

  // Local uploaded images
  return `${API_URL}/public/${filename}`;
};

// Fetch raw image (optional)
export const fetchUserImage = async (filename) => {
  if (!filename) return null;

  try {
    const response = await axios.get(`${API_URL}/public/${filename}`, {
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  } catch (err) {
    console.error("Failed to fetch image", err);
    return "/default-avatar.png";
  }
};

export default API;
