import { useState } from "react";
import axios from "axios";

import {
  validateForm,
  validateName,
  validateEmail,
  validatePhone,
  validateDOB,
  validateRollNo,
  validateFaculty,
  validateYearOfEnrollment,
  validateClass,
  validateSection,
  validateAddress,
  validateUniversityReg,
  validateProfileImage,
} from "../utills/validations";

import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Toast from "../components/ui/Toast";

import PersonalInfoSection from "../components/FormSections/PersonalInfoSection";
import AcademicInfoSection from "../components/FormSections/AcademicInfoSection";
import ProfilePhotoSection from "../components/FormSections/ProfilePhotoSection";
import GuardianInfoSection from "../components/FormSections/GuardianInfoSection";

import useDepartments from "../../hooks/useDepartments";

export default function AddStudent() {
  const API_URL = import.meta.env.VITE_API_URL;

  const { departments: facultyOptions, loading: facultyLoading } =
    useDepartments();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    FullName: "",
    RollNo: "",
    Faculty: "",
    YearOfEnrollment: "",
    Email: "",
    Phone: "",
    DateOfBirth: "",
    GuardianName: "",
    GuardianPhone: "",
    Class: "",
    Section: "",
    FullAddress: "",
    UniversityReg: "",
    ProfileImagePath: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let error = "";
    switch (name) {
      case "FullName":
        error = validateName(value);
        break;
      case "RollNo":
        error = validateRollNo(value);
        break;
      case "Faculty":
        error = validateFaculty(value, facultyOptions);
        break;
      case "YearOfEnrollment":
        error = validateYearOfEnrollment(value);
        break;
      case "Email":
        error = validateEmail(value);
        break;
      case "Phone":
        error = validatePhone(value);
        break;
      case "DateOfBirth":
        error = validateDOB(value);
        break;
      case "GuardianName":
        error = validateName(value);
        break;
      case "GuardianPhone":
        error = validatePhone(value);
        break;
      case "Class":
        error = validateClass(value);
        break;
      case "Section":
        error = validateSection(value);
        break;
      case "FullAddress":
        error = validateAddress(value);
        break;
      case "UniversityReg":
        error = validateUniversityReg(value);
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, ProfileImagePath: file }));
    setErrors((prev) => ({
      ...prev,
      ProfileImagePath: validateProfileImage(file),
    }));

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, ProfileImagePath: null }));
    setErrors((prev) => ({
      ...prev,
      ProfileImagePath: "Profile image is required",
    }));
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (loading) return;

    const validationErrors = validateForm({
      FullName: { value: formData.FullName, validator: validateName },
      RollNo: { value: formData.RollNo, validator: validateRollNo },
      Faculty: {
        value: formData.Faculty,
        validator: (v) => validateFaculty(v, facultyOptions),
      },
      GuardianName: { value: formData.GuardianName, validator: validateName },
      GuardianPhone: { value: formData.GuardianPhone, validator: validatePhone },
      YearOfEnrollment: {
        value: formData.YearOfEnrollment,
        validator: validateYearOfEnrollment,
      },
      Email: { value: formData.Email, validator: validateEmail },
      Phone: { value: formData.Phone, validator: validatePhone },
      DateOfBirth: { value: formData.DateOfBirth, validator: validateDOB },
      Class: { value: formData.Class, validator: validateClass },
      Section: { value: formData.Section, validator: validateSection },
      FullAddress: { value: formData.FullAddress, validator: validateAddress },
      UniversityReg: {
        value: formData.UniversityReg,
        validator: validateUniversityReg,
      },
      ProfileImagePath: {
        value: formData.ProfileImagePath,
        validator: validateProfileImage,
      },
    });

    setErrors(validationErrors);
    if (Object.values(validationErrors).some(Boolean)) return;

    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      setLoading(true);

      const data = new FormData();
      Object.keys(formData).forEach((key) =>
        data.append(key, formData[key])
      );

      await axios.post(`${API_URL}api/v1/users/students`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setToast({ message: "Student added successfully!", type: "success" });
      setFormData({
        FullName: "",
        RollNo: "",
        Faculty: "",
        YearOfEnrollment: "",
        Email: "",
        Phone: "",
        DateOfBirth: "",
        GuardianName: "",
        GuardianPhone: "",
        Class: "",
        Section: "",
        FullAddress: "",
        UniversityReg: "",
        ProfileImagePath: null,
      });
      setErrors({});
      setImagePreview(null);
    } catch (error) {
      setToast({
        message:
          error.response?.data?.error ||
          "Failed to add student. Server error.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />

      <div className="max-w-5xl mx-auto p-6 space-y-8 mb-16 pt-24">
        <h1 className="text-3xl font-bold text-gray-800">
          Add New Student
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

        <GuardianInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
          loading={loading}
        />

        <AcademicInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          facultyOptions={facultyOptions}
          facultyLoading={facultyLoading}
          errors={errors}
          loading={loading}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-3 rounded-xl text-white ${
            loading ? "bg-gray-400" : "bg-emerald-600"
          }`}
        >
          {loading ? "Saving..." : "Submit"}
        </button>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <Footer />
    </div>
  );
}
