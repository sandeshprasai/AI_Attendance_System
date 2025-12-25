import { useState } from 'react';
import axios from 'axios';
import PersonalInfoSection from '../components/FormSections/PersonalInfoSection';
import ProfilePhotoSection from '../components/FormSections/ProfilePhotoSection';
import FacultyInfoSection from '../components/FormSections/FacultyInfoSection';
import Toast from '../components/ui/Toast';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateAddress,
  validateDOB,
  isRequired,
  validateJoinYear,
  validateEmployeeID,
  validateProfileImage
} from '../utills/validations';



export default function AddTeacherPage() {
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    EmployeeId: '',
    FullName: '',
    DateOfBirth: '',
    FullAddress: '',
    Phone: '',
    Email: '',
    Faculty: '',
    Subject: '',
    JoinedYear: '',
    ProfileImagePath: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate using utility function
      const error = validateProfileImage(file);
      if (error) {
        setToast({ message: error, type: 'error' });
        setErrors({ ...errors, photo: error });
        return;
      }

      setFormData((prev) => ({ ...prev, ProfileImagePath: file }));
      setErrors((prev) => ({ ...prev, photo: '' }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, ProfileImagePath: null }));
    setErrors((prev) => ({ ...prev, photo: 'Profile photo is required.' }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    let newErrors = {};

    // Profile photo validation
    if (!imagePreview) {
      newErrors.photo = 'Profile photo is required';
    }

    // Using validation utilities
    newErrors.EmployeeId = isRequired(formData.EmployeeId);
    newErrors.FullName = validateName(formData.FullName);
    newErrors.DateOfBirth = validateDOB(formData.DateOfBirth);
    
    // Additional age validation for teachers
    if (!newErrors.DateOfBirth) {
      const age = new Date().getFullYear() - new Date(formData.DateOfBirth).getFullYear();
      if (age < 22 || age > 70) {
        newErrors.DateOfBirth = 'Age must be between 22 and 70';
      }
    }

    newErrors.FullAddress = validateAddress(formData.FullAddress);
    newErrors.Phone = validatePhone(formData.Phone);
    newErrors.Email = validateEmail(formData.Email);
    newErrors.Faculty = isRequired(formData.Faculty);
    newErrors.Subject = isRequired(formData.Subject);
    newErrors.JoinedYear = validateJoinYear(formData.JoinedYear);
    newErrors.EmployeeId = validateEmployeeID(formData.EmployeeId);

    // Filter out empty error messages
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== '')
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (loading) return; // Prevent double submit

    if (!validateForm()) {
      setToast({ message: 'Please fix all errors before submitting', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      setLoading(true);
      
      const data = new FormData();
      for (const key in formData) {
        if (key === 'ProfileImagePath' && formData[key]) {
          data.append(key, formData[key]);
        } else {
          data.append(key, formData[key]);
        }
      }

      const res = await axios.post(`${API_URL}api/v1/users/teachers`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${token}`,
        },
      });

      setToast({ message: 'Teacher added successfully!', type: 'success' });
      
      // Reset form
      setFormData({
        EmployeeId: '',
        FullName: '',
        DateOfBirth: '',
        FullAddress: '',
        Phone: '',
        Email: '',
        Faculty: '',
        Subject: '',
        JoinedYear: '',
        ProfileImagePath: null
      });
      setImagePreview(null);
      setErrors({});
    } catch (error) {
      console.error(error);
      console.error('SERVER ERROR:', error.response?.data);
      const message = error.response?.data?.error || 'Failed to add teacher. Server error.';
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />

      <div className="max-w-5xl mx-auto p-6 space-y-8 mb-16 pt-24">
        <h1 className="text-3xl font-bold text-gray-800">Add New Teacher</h1>
        
        {/* Profile Photo Section */}
        <ProfilePhotoSection
          imagePreview={imagePreview}
          handleImageUpload={handleImageUpload}
          removeImage={removeImage}
          error={errors.photo}
          loading={loading}
        />

        {/* Personal Information Section - Reusing component */}
        <PersonalInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
          loading={loading}
        />

        {/* Faculty Information Section - Reusing component */}
        <FacultyInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
          loading={loading}
        />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-3 rounded-xl text-white flex items-center justify-center gap-2
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {loading ? 'Saving...' : 'Add Teacher'}
        </button>
      </div>

      {/* Toast Notification */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Loading Overlay */}
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