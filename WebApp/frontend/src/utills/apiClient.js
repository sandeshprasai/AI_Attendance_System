import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: `${API_URL}api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===== Request Interceptor (Attach Token) ===== */
apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ===== Response Interceptor (Refresh Token) ===== */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          localStorage.getItem("refreshToken") ||
          sessionStorage.getItem("refreshToken");

        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${API_URL}api/v1/auth/refresh`,
          { refreshToken }
        );

        localStorage.setItem("accessToken", data.accessToken);

        originalRequest.headers.Authorization =
          `Bearer ${data.accessToken}`;

        return apiClient(originalRequest);
      } catch (err) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;