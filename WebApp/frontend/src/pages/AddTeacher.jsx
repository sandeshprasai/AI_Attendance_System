import { useState } from "react";
import axios from "axios";
import PersonalInfoSection from "../components/FormSections/PersonalInfoSection";
import ProfilePhotoSection from "../components/FormSections/ProfilePhotoSection";
import FacultyInfoSection from "../components/FormSections/FacultyInfoSection";
import Toast from "../components/ui/Toast";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
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
    Subject: [], // array for multi-select
    JoinedYear: "",
    ProfileImagePath: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

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
      // Multi-select Subjects
      setFormData((prev) => ({ ...prev, [name]: value || [] }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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

    newErrors.EmployeeId = isRequired(formData.EmployeeId);
    newErrors.FullName = validateName(formData.FullName);
    newErrors.DateOfBirth = validateDOB(formData.DateOfBirth);
    newErrors.FullAddress = validateAddress(formData.FullAddress);
    newErrors.Phone = validatePhone(formData.Phone);
    newErrors.Email = validateEmail(formData.Email);
    newErrors.Faculty = isRequired(formData.Faculty);
    newErrors.Subject =
      !formData.Subject || formData.Subject.length === 0
        ? "At least one subject must be selected"
        : "";
    newErrors.JoinedYear = validateJoinYear(formData.JoinedYear);
    newErrors.EmployeeId = validateEmployeeID(formData.EmployeeId);

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== "")
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  // ---------------- Handle Form Submission ----------------
  const handleSubmit = async () => {
    if (loading) return;

    if (!validateForm()) {
      setToast({ message: "Please fix all errors before submitting", type: "error" });
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!token) throw new Error("Authentication token not found");

      const data = new FormData();

      // Append profile image
      data.append("ProfileImagePath", formData.ProfileImagePath);

      // Append other fields
      for (const key in formData) {
        if (key === "ProfileImagePath") continue;

        if (key === "Subject") {
          // Send Subjects as JSON string for backend parsing
          data.append("Subject", JSON.stringify(formData.Subject));
        } else {
          data.append(key, formData[key]);
        }
      }

      const res = await axios.post(`${API_URL}api/v1/users/teachers`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setToast({ message: "Teacher added successfully!", type: "success" });

      // Reset form
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
    } catch (error) {
      console.error("SERVER ERROR:", error.response?.data || error.message);
      const message = error.response?.data?.message || "Failed to add teacher";
      setToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Render --------------------
  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />
      <div className="max-w-5xl mx-auto p-6 space-y-8 mb-16 pt-24">
        <h1 className="text-3xl font-bold text-gray-800">Add New Teacher</h1>

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
          errors={errors}
          loading={loading}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-3 rounded-xl text-white flex items-center justify-center gap-2
            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {loading ? "Saving..." : "Add Teacher"}
        </button>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 font-medium">Saving teacher data...</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}