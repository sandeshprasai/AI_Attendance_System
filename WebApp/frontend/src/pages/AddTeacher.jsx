import { useState } from "react";
import axios from "axios";
import PersonalInfoSection from "../components/FormSections/PersonalInfoSection";
import ProfilePhotoSection from "../components/FormSections/ProfilePhotoSection";
import FacultyInfoSection from "../components/FormSections/FacultyInfoSection";
import Toast from "../components/ui/Toast";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import useDepartments from "../hooks/useDepartments";
import {
  validateName,
  validateEmail,
  validatePhone,
  validateAddress,
  validateDOB,
  isRequired,
  validateJoinYear,
  validateEmployeeID,
  validateProfileImage,
} from "../utills/validations";

export default function AddTeacherPage() {
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    EmployeeId: "",
    FullName: "",
    DateOfBirth: "",
    FullAddress: "",
    Phone: "",
    Email: "",
    Faculty: "",
    Subject: [],
    JoinedYear: "",
    ProfileImagePath: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // ✅ REUSED HOOK
  const { departments, loading: facultyLoading } = useDepartments();

  // ---------------- Handle Profile Image ----------------
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateProfileImage(file);
    if (error) {
      setErrors((prev) => ({ ...prev, ProfileImagePath: error }));
      setToast({ message: error, type: "error" });
      return;
    }

    setFormData((prev) => ({ ...prev, ProfileImagePath: file }));
    setErrors((prev) => ({ ...prev, ProfileImagePath: "" }));

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, ProfileImagePath: null }));
    setErrors((prev) => ({
      ...prev,
      ProfileImagePath: "Profile image is required",
    }));
  };

  // ---------------- Handle Input Changes ----------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "Subject") {
      setFormData((prev) => ({ ...prev, Subject: value || [] }));
      if (errors.Subject) setErrors((prev) => ({ ...prev, Subject: "" }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ---------------- Form Validation ----------------
  const validateForm = () => {
    let newErrors = {};

    if (!formData.ProfileImagePath)
      newErrors.ProfileImagePath = "Profile photo is required";

    newErrors.EmployeeId = validateEmployeeID(formData.EmployeeId);
    newErrors.FullName = validateName(formData.FullName);
    newErrors.DateOfBirth = validateDOB(formData.DateOfBirth);
    newErrors.FullAddress = validateAddress(formData.FullAddress);
    newErrors.Phone = validatePhone(formData.Phone);
    newErrors.Email = validateEmail(formData.Email);
    newErrors.Faculty = isRequired(formData.Faculty);
    newErrors.JoinedYear = validateJoinYear(formData.JoinedYear);
    newErrors.Subject =
      formData.Subject.length === 0 ? "Select at least one subject" : "";

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, v]) => v)
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  // ---------------- Submit ----------------
  const handleSubmit = async () => {
    if (loading) return;

    if (!validateForm()) {
      setToast({ message: "Please fix all errors", type: "error" });
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      const data = new FormData();
      data.append("ProfileImagePath", formData.ProfileImagePath);

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "ProfileImagePath") return;
        if (key === "Subject") {
          value.forEach((subject) => {
            data.append("Subject", subject);
          });
        } else {
          data.append(key, value);
        }
      });

      await axios.post(`${API_URL}api/v1/users/teachers`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setToast({ message: "Teacher added successfully", type: "success" });

      setFormData({
        EmployeeId: "",
        FullName: "",
        DateOfBirth: "",
        FullAddress: "",
        Phone: "",
        Email: "",
        Faculty: "",
        Subject: [],
        JoinedYear: "",
        ProfileImagePath: null,
      });

      setImagePreview(null);
      setErrors({});
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to add teacher",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Render ----------------
  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />

      <div className="max-w-5xl mx-auto p-6 space-y-8 pt-24 mb-16">
        <h1 className="text-3xl font-bold text-gray-800">
          Add New Teacher
        </h1>

        <ProfilePhotoSection
          imagePreview={imagePreview}
          handleImageUpload={handleImageUpload}
          removeImage={removeImage}
          error={errors.ProfileImagePath}
          loading={loading}
        />

        <PersonalInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
          loading={loading}
        />

        <FacultyInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          facultyOptions={departments}
          errors={errors}
          loading={loading || facultyLoading}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-3 rounded-xl text-white
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
        >
          {loading ? "Saving..." : "Add Teacher"}
        </button>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <Footer />
    </div>
  );
}
