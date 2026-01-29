import { useEffect, useState } from "react";
import { fetchAllDepartments } from "../services/academics.service";

export default function useDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDepartments = async () => {
      setLoading(true);
      try {
        const res = await fetchAllDepartments(); // ✅ call correct function

        if (res.data?.success && res.data?.data) {
          setDepartments(
            res.data.data.map((d) => d.DepartmentName)
          );
        } else {
          setDepartments([]);
        }
      } catch (error) {
        console.error("Failed to fetch departments", error);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, []);

  return { departments, loading };
}