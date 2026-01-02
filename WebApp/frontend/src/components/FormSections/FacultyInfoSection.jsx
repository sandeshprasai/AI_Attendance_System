import { useState, useEffect } from "react";
import { GraduationCap, Hash, Calendar, Briefcase, BookOpen } from "lucide-react";
import InputGroup from "../ui/InputGroup";
import Select from "react-select";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function FacultyInfoSection({ formData, handleInputChange, errors, loading }) {
  const currentYear = new Date().getFullYear();

  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const getToken = () => {
    return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || null;
  };

  const getAuthConfig = (params = {}) => {
    const token = getToken();
    if (!token) return null;

    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params,
    };
  };

  // Fetch all departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      setDataLoading(true);
      try {
        const config = getAuthConfig();
        if (!config) return;

        const res = await axios.get(`${API_URL}api/v1/academics/allDepartments`, config);
        if (res.data.success && res.data.data) {
          const deptNames = res.data.data.map((d) => d.DepartmentName);
          setDepartments(deptNames);
        }
      } catch (err) {
        console.error("Error fetching departments:", err);
        setDepartments([]);
        if (err.response?.status === 401) {
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

  // Fetch subjects when faculty changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!formData.Faculty) {
        setSubjects([]);
        return;
      }

      setDataLoading(true);
      try {
        const config = getAuthConfig({ DepartmentName: formData.Faculty });
        if (!config) return;

        const res = await axios.get(`${API_URL}api/v1/academics/allSubjects`, config);
        if (res.data.success && res.data.data) {
          const subjectNames = res.data.data.map((s) => s.SubjectName);
          setSubjects(subjectNames.map((s) => ({ label: s, value: s })));
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setSubjects([]);
        if (err.response?.status === 401) {
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

  // Clear selected subjects when faculty changes
  useEffect(() => {
    handleInputChange({ target: { name: "Subject", value: [] } });
  }, [formData.Faculty]);

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <h3 className="text-xl font-bold text-cyan-600 flex items-center gap-2">
        <GraduationCap className="w-6 h-6" />
        Faculty & Subject Information
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

        {/* Faculty */}
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
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors?.Faculty && <p className="text-red-500 text-sm">{errors.Faculty}</p>}
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

        {/* Subjects using React-Select */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-bold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Subjects
          </label>
          <Select
            isMulti
            name="Subject"
            value={formData.Subject.map((s) => ({ label: s, value: s }))}
            onChange={(selected) =>
              handleInputChange({
                target: {
                  name: "Subject",
                  value: selected ? selected.map((s) => s.value) : [],
                },
              })
            }
            options={subjects}
            isDisabled={loading || dataLoading || !formData.Faculty}
            placeholder={
              !formData.Faculty
                ? "Select faculty first"
                : dataLoading
                ? "Loading subjects..."
                : "Select subjects"
            }
            classNamePrefix="react-select"
          />
          {errors?.Subject && <p className="text-red-500 text-sm mt-1">{errors.Subject}</p>}
        </div>
      </div>
    </div>
  );
}
