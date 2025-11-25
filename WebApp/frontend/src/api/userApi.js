import axios from "axios";

export const getCurrentUser = async (token) => {
  if (!token) return null;
  try {
    const response = await axios.get("http://localhost:9000/api/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`, // token must be here
      },
    });
    return response.data;
  } catch (err) {
    console.error("Error fetching user:", err.response?.data || err.message);
    return null;
  }
};