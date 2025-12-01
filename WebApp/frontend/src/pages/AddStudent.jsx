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
} from "../../utills/validations";

import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

import Toast from "../components/ui/Toast";
import PersonalInfoSection from "../components/FormSections/PersonalInfoSection";
import AcademicInfoSection from "../components/FormSections/AcademicInfoSection";
import ProfilePhotoSection from "../components/FormSections/ProfilePhotoSection";

export default function AddStudent() {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    FullName: "",
    RollNo: "",
    Faculty: "",
    YearOfEnrollment: "",
    Email: "",
    Phone: "",
    DateOfBirth: "",
    Class: "",
    Section: "",
    FullAddress: "",
    UniversityReg: "",
    ProfileImagePath: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);

  const facultyOptions = [
    "CIVIL",
    "COMPUTER",
    "BE IT",
    "BBA",
    "ARCHITECTURE",
    "ELECTRONICS",
    "BE SOFTWARE",
    "BE INFORMATION",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate on input change
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
    if (file) {
      setFormData((prev) => ({ ...prev, ProfileImagePath: file }));
      setErrors((prev) => ({
        ...prev,
        ProfileImagePath: validateProfileImage(file),
      }));

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, ProfileImagePath: null }));
    setErrors((prev) => ({ ...prev, ProfileImagePath: "Profile image is required." }));
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    // Run full form validation
    const validationErrors = validateForm({
      FullName: { value: formData.FullName, validator: validateName },
      RollNo: { value: formData.RollNo, validator: validateRollNo },
      Faculty: { value: formData.Faculty, validator: (val) => validateFaculty(val, facultyOptions) },
      YearOfEnrollment: { value: formData.YearOfEnrollment, validator: validateYearOfEnrollment },
      Email: { value: formData.Email, validator: validateEmail },
      Phone: { value: formData.Phone, validator: validatePhone },
      DateOfBirth: { value: formData.DateOfBirth, validator: validateDOB },
      Class: { value: formData.Class, validator: validateClass },
      Section: { value: formData.Section, validator: validateSection },
      FullAddress: { value: formData.FullAddress, validator: validateAddress },
      UniversityReg: { value: formData.UniversityReg, validator: validateUniversityReg },
      ProfileImagePath: { value: formData.ProfileImagePath, validator: validateProfileImage },
    });

    setErrors(validationErrors);

    // Stop submit if any errors
    const hasErrors = Object.values(validationErrors).some((e) => e);
    if (hasErrors) return;

    try {
      const data = new FormData();
      for (const key in formData) {
        if (key === "ProfileImagePath" && formData[key]) {
          data.append(key, formData[key]);
        } else {
          data.append(key, formData[key]);
        }
      }

      const res = await axios.post(
        "http://localhost:9000/api/v1/users/students",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setToast({ message: "Student added successfully!", type: "success" });

      setFormData({
        FullName: "",
        RollNo: "",
        Faculty: "",
        YearOfEnrollment: "",
        Email: "",
        Phone: "",
        DateOfBirth: "",
        Class: "",
        Section: "",
        FullAddress: "",
        UniversityReg: "",
        ProfileImagePath: null,
      });
      setErrors({});
      setImagePreview(null);
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.error || "Failed to add student. Server error.";
      setToast({ message, type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <ProfilePhotoSection
          imagePreview={imagePreview}
          handleImageUpload={handleImageUpload}
          removeImage={removeImage}
          error={errors.ProfileImagePath}
        />

        <PersonalInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
        />

        <AcademicInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          facultyOptions={facultyOptions}
          errors={errors}
        />

        <button
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <Footer />
    </div>
  );
}