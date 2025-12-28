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
// Response interceptor to handle 401 errors
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call your refresh endpoint
        const refreshToken =
          localStorage.getItem("refreshToken") ||
          sessionStorage.getItem("refreshToken");

        if (!refreshToken) throw new Error("No refresh token available");

        const { data } = await axios.post(
          import.meta.env.VITE_API_URL + "api/v1/auth/refresh",
          { refreshToken }
        );

        // Save new access token
        localStorage.setItem("accessToken", data.accessToken);

        // Retry original request with new token
        originalRequest.headers.authorization = `Bearer ${data.accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user or redirect to login
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/"; // redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);



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
