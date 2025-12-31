import { useState, useEffect } from "react";
import { GraduationCap, Hash, Calendar, BookOpen, Briefcase } from "lucide-react";
import InputGroup from "../ui/InputGroup";
import MultiSelect from "../ui/MultiSelect";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function FacultyInfoSection({
  formData,
  handleInputChange,
  errors,
  loading,
}) {
  const currentYear = new Date().getFullYear();

  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  /* -------------------------------
   * Helper: get token from storage
   * ------------------------------- */
  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken") ||
      null
    );
  };

  const getAuthConfig = (params = {}) => {
    const token = getToken();
    if (!token) {
      console.error("No access token found in localStorage or sessionStorage");
      return null;
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params,
    };
  };

  /* -------------------------------
   * 1️⃣ Fetch departments on mount
   * ------------------------------- */
  useEffect(() => {
    const fetchDepartments = async () => {
      setDataLoading(true);
      try {
        const config = getAuthConfig();
        if (!config) return;

        const response = await axios.get(
          `${API_URL}api/v1/academics/allDepartments`,
          config
        );

        if (response.data.success && response.data.data) {
          const departmentNames = response.data.data.map(
            (dept) => dept.DepartmentName
          );
          setDepartments(departmentNames);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartments([]);

        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
      } finally {
        setDataLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  /* -------------------------------
   * 2️⃣ Fetch subjects when Faculty changes
   * ------------------------------- */
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!formData.Faculty) {
        setSubjects([]);
        return;
      }

      setDataLoading(true);

      try {
        const config = getAuthConfig({
          DepartmentName: formData.Faculty,
        });
        if (!config) return;

        const response = await axios.get(
          `${API_URL}api/v1/academics/allSubjects`,
          config
        );

        if (response.data.success && response.data.data) {
          const subjectNames = response.data.data.map((sub) => sub.SubjectName);
          setSubjects(subjectNames);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects([]);

        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
      } finally {
        setDataLoading(false);
      }
    };

    fetchSubjects();
  }, [formData.Faculty]);

  /* -------------------------------
   * 3️⃣ Clear selected subjects on faculty change
   * ------------------------------- */
  useEffect(() => {
    handleInputChange({
      target: {
        name: "Subject",
        value: [],
      },
    });
  }, [formData.Faculty]);

  /* -------------------------------
   * Render UI
   * ------------------------------- */
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <h3 className="text-xl font-bold text-cyan-600 flex items-center gap-2">
        <GraduationCap className="w-6 h-6" />
        Faculty Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee ID */}
        <InputGroup
          label="Employee ID"
          name="EmployeeId"
          type="text"
          value={formData.EmployeeId}
          onChange={handleInputChange}
          Icon={Hash}
          error={errors?.EmployeeId}
          disabled={loading}
          placeholder="Enter employee ID"
        />

        {/* Faculty / Department */}
        <div className="space-y-1">
          <label className="text-sm font-bold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            Faculty
          </label>

          <select
            name="Faculty"
            value={formData.Faculty}
            onChange={handleInputChange}
            disabled={loading || dataLoading}
            className={`w-full h-12 px-4 border-2 rounded-xl focus:outline-none ${
              errors?.Faculty
                ? "border-red-500 focus:border-red-500"
                : "border-emerald-400 focus:border-emerald-600"
            }`}
          >
            <option value="">
              {dataLoading ? "Loading faculties..." : "Select Faculty"}
            </option>
            {departments.map((department, index) => (
              <option key={index} value={department}>
                {department}
              </option>
            ))}
          </select>

          {errors?.Faculty && (
            <p className="text-red-500 text-sm">{errors.Faculty}</p>
          )}
        </div>

        {/* Joined Year */}
        <InputGroup
          label="Joined Year"
          name="JoinedYear"
          type="number"
          value={formData.JoinedYear}
          onChange={handleInputChange}
          Icon={Calendar}
          error={errors?.JoinedYear}
          disabled={loading}
          placeholder={`Year must be between 2010 and ${currentYear}`}
        />

        {/* Subjects */}
        <MultiSelect
          label="Subjects"
          name="Subject"
          value={formData.Subject || []}
          onChange={handleInputChange}
          options={subjects}
          error={errors?.Subject}
          disabled={loading || dataLoading || !formData.Faculty}
          Icon={BookOpen}
          placeholder={
            !formData.Faculty
              ? "Select faculty first"
              : dataLoading
              ? "Loading subjects..."
              : "Select subjects"
          }
          searchable
        />
      </div>
    </div>
  );
}