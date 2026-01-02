import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function useDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const getToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  useEffect(() => {
    const fetchDepartments = async () => {
      const token = getToken();
      if (!token) return;

      setLoading(true);
      try {
        const res = await axios.get(
          `${API_URL}api/v1/academics/allDepartments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data?.success && res.data.data) {
          setDepartments(
            res.data.data.map((dept) => dept.DepartmentName)
          );
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return { departments, loading };
}
