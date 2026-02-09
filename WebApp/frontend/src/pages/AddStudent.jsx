import { useState } from "react";
import axios from "axios";
import { Camera } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

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

import useDepartments from "../hooks/useDepartments";


export default function AddStudent() {
  const API_URL = import.meta.env.VITE_API_URL;

  const { departments: facultyOptions, loading: facultyLoading } =
    useDepartments();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEnrollFaceModal, setShowEnrollFaceModal] = useState(false);
  const [enrollRollNo, setEnrollRollNo] = useState("");

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
      
      // Open face enrollment modal with the roll number
      setEnrollRollNo(formData.RollNo);
      setShowEnrollFaceModal(true);
      
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />

      <div className="max-w-5xl mx-auto p-6 space-y-8 mb-16 pt-24" onKeyDown={handleKeyDown}>
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

        <div className="flex gap-4 items-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-3 rounded-xl text-white ${
              loading ? "bg-gray-400" : "bg-emerald-600"
            }`}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
          
          {/* Manual Enroll Face Button */}
          <button
            onClick={() => {
              if (formData.RollNo.trim()) {
                setEnrollRollNo(formData.RollNo);
                setShowEnrollFaceModal(true);
              } else {
                setToast({ message: "Please enter a Roll Number first", type: "error" });
              }
            }}
            type="button"
            className="px-6 py-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Camera size={20} />
            Enroll Face
          </button>
        </div>
      </div>

      {/* Face Enrollment Modal */}
      {showEnrollFaceModal && (
        <EnrollFaceModal
          rollNo={enrollRollNo}
          onClose={() => {
            setShowEnrollFaceModal(false);
            setEnrollRollNo("");
          }}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <Footer />
    </div>
  );
}

// Face Enrollment Modal Component
function EnrollFaceModal({ rollNo, onClose }) {
  const [toast, setToast] = useState(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Face Enrollment</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-emerald-100 text-sm mt-1">
            Roll Number: <span className="font-semibold">{rollNo}</span>
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded mb-6">
            <p className="text-sm text-emerald-800">
              <strong>✓ Student Added Successfully!</strong> Now let's enroll their face for attendance tracking.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Important:</strong> If you didn't check "Remember Me" during login, the new tab may redirect. Use the button below to navigate in the same tab.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">What's Next?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">1.</span>
                  <span>Click the button below to go to Face Enrollment page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">2.</span>
                  <span>Capture 5-10 clear photos of the student's face</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">3.</span>
                  <span>Complete enrollment</span>
                </li>
              </ul>
            </div>

            <Link
              to={`/enroll-face?rollNo=${rollNo}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg shadow-lg"
            >
              <Camera size={24} />
              Go to Face Enrollment Page
            </Link>

            <p className="text-xs text-center text-gray-500">
              Opens in same tab • Roll number will be prefilled • Use browser back to return
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 rounded-b-2xl border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Skip for Now
          </button>
        </div>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
