import { useEffect, useState } from "react";
import { fetchClassrooms } from "../services/academicClass.service";

export default function useClassrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadClassrooms = async () => {
      setLoading(true);
      try {
        const res = await fetchClassrooms();

        if (res.data?.success && res.data?.data) {
          // Extract just the classroom names/codes
          setClassrooms(
            res.data.data.map((c) => c.Classroom)
          );
        } else {
          setClassrooms([]);
        }
      } catch (error) {
        console.error("Failed to fetch classrooms", error);
        setClassrooms([]);
      } finally {
        setLoading(false);
      }
    };

    loadClassrooms();
  }, []);

  return { classrooms, loading };
}
