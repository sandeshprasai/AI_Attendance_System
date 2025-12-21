import { useState } from 'react';
import { User, GraduationCap, Upload, X } from 'lucide-react';

// ImageUploader Component
function ImageUploader({ imagePreview, onUpload, onRemove }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert('File size should be less than 1MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex justify-center">
      {imagePreview ? (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-32 h-32 rounded-full object-cover border-4 border-cyan-100"
          />
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="cursor-pointer">
          <div className="w-32 h-32 rounded-full border-2 border-dashed border-cyan-400 flex flex-col items-center justify-center hover:border-cyan-600 transition bg-cyan-50">
            <Upload className="w-8 h-8 text-cyan-600 mb-2" />
            <span className="text-xs text-cyan-600 font-medium">Upload</span>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}

// ProfilePhotoSection Component
function ProfilePhotoSection({ imagePreview, handleImageUpload, removeImage, error }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
          <User className="w-4 h-4 text-cyan-600" />
        </div>
        Profile Photo
      </h3>

      <ImageUploader
        imagePreview={imagePreview}
        onUpload={handleImageUpload}
        onRemove={removeImage}
      />

      {error && (
        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
          <span className="font-bold">⚠</span> {error}
        </p>
      )}
    </div>
  );
}

export default function AddTeacherPage() {
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    dob: '',
    address: '',
    phone: '',
    email: '',
    faculty: '',
    subjects: '',
    joinedYear: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleImageUpload = (preview) => {
    setImagePreview(preview);
    setErrors({ ...errors, photo: '' });
  };

  const removeImage = () => {
    setImagePreview(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let newErrors = { ...errors };

    switch (name) {
      case 'employeeId':
        if (!value.trim()) {
          newErrors.employeeId = 'Employee ID is required';
        } else {
          delete newErrors.employeeId;
        }
        break;
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = 'Full Name is required';
        } else if (value.trim().length < 3) {
          newErrors.fullName = 'Name must be at least 3 characters';
        } else {
          delete newErrors.fullName;
        }
        break;
      case 'dob':
        if (!value) {
          newErrors.dob = 'Date of Birth is required';
        } else {
          const age = new Date().getFullYear() - new Date(value).getFullYear();
          if (age < 22 || age > 70) {
            newErrors.dob = 'Age must be between 22 and 70';
          } else {
            delete newErrors.dob;
          }
        }
        break;
      case 'address':
        if (!value.trim()) {
          newErrors.address = 'Address is required';
        } else {
          delete newErrors.address;
        }
        break;
      case 'phone':
        const phoneRegex = /^[0-9]{10}$/;
        if (!value.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(value)) {
          newErrors.phone = 'Phone number must be 10 digits';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Invalid email format';
        } else {
          delete newErrors.email;
        }
        break;
      case 'faculty':
        if (!value) {
          newErrors.faculty = 'Faculty is required';
        } else {
          delete newErrors.faculty;
        }
        break;
      case 'subjects':
        if (!value.trim()) {
          newErrors.subjects = 'Subjects are required';
        } else {
          delete newErrors.subjects;
        }
        break;
      case 'joinedYear':
        const currentYear = new Date().getFullYear();
        if (!value.trim()) {
          newErrors.joinedYear = 'Joined Year is required';
        } else if (value < 1990 || value > currentYear) {
          newErrors.joinedYear = `Year must be between 1990 and ${currentYear}`;
        } else {
          delete newErrors.joinedYear;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    let newErrors = {};

    if (!imagePreview) {
      newErrors.photo = 'Profile photo is required';
    }

    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
    });

    newErrors = { ...newErrors, ...errors };
    setErrors(newErrors);
    setTouched({
      employeeId: true,
      fullName: true,
      dob: true,
      address: true,
      phone: true,
      email: true,
      faculty: true,
      subjects: true,
      joinedYear: true
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form submitted:', { ...formData, photo: imagePreview });
      alert('Teacher added successfully!');
      // Reset form
      setFormData({
        employeeId: '',
        fullName: '',
        dob: '',
        address: '',
        phone: '',
        email: '',
        faculty: '',
        subjects: '',
        joinedYear: ''
      });
      setImagePreview(null);
      setErrors({});
      setTouched({});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Teacher</h1>
        
        <div className="space-y-6">
          {/* Profile Photo Section */}
          <ProfilePhotoSection
            imagePreview={imagePreview}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
            error={errors.photo}
          />

          {/* Personal Information Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                <User className="w-4 h-4 text-cyan-600" />
              </div>
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  🆔 Employee ID
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 border ${
                    errors.employeeId && touched.employeeId
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-cyan-500'
                  } rounded-lg focus:outline-none focus:ring-2 transition`}
                  placeholder="Enter employee ID"
                />
                {errors.employeeId && touched.employeeId && (
                  <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  👤 Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 border ${
                    errors.fullName && touched.fullName
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-cyan-500'
                  } rounded-lg focus:outline-none focus:ring-2 transition`}
                  placeholder="Enter full name"
                />
                {errors.fullName && touched.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  📅 Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 border ${
                    errors.dob && touched.dob
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-cyan-500'
                  } rounded-lg focus:outline-none focus:ring-2 transition`}
                />
                {errors.dob && touched.dob && (
                  <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  📧 Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 border ${
                    errors.email && touched.email
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-cyan-500'
                  } rounded-lg focus:outline-none focus:ring-2 transition`}
                  placeholder="Enter email address"
                />
                {errors.email && touched.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  📞 Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 border ${
                    errors.phone && touched.phone
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-cyan-500'
                  } rounded-lg focus:outline-none focus:ring-2 transition`}
                  placeholder="Enter phone number"
                />
                {errors.phone && touched.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Address - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  🏠 Full Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows="3"
                  className={`w-full px-4 py-2.5 border ${
                    errors.address && touched.address
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-cyan-500'
                  } rounded-lg focus:outline-none focus:ring-2 transition resize-none`}
                  placeholder="Enter full address"
                />
                {errors.address && touched.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-cyan-600" />
              </div>
              Academic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Faculty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  🏫 Faculty
                </label>
                <select
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 border ${
                    errors.faculty && touched.faculty
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-cyan-500'
                  } rounded-lg focus:outline-none focus:ring-2 transition bg-white`}
                >
                  <option value="">Select Faculty</option>
                  <option value="Science">Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Management">Management</option>
                </select>
                {errors.faculty && touched.faculty && (
                  <p className="text-red-500 text-xs mt-1">{errors.faculty}</p>
                )}
              </div>

              {/* Joined Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  📆 Joined Year
                </label>
                <input
                  type="number"
                  name="joinedYear"
                  value={formData.joinedYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 border ${
                    errors.joinedYear && touched.joinedYear
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-cyan-500'
                  } rounded-lg focus:outline-none focus:ring-2 transition`}
                  placeholder="Enter joined year"
                  min="1990"
                  max={new Date().getFullYear()}
                />
                {errors.joinedYear && touched.joinedYear && (
                  <p className="text-red-500 text-xs mt-1">{errors.joinedYear}</p>
                )}
              </div>

              {/* Subjects - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  📚 Subjects
                </label>
                <input
                  type="text"
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 border ${
                    errors.subjects && touched.subjects
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-cyan-500'
                  } rounded-lg focus:outline-none focus:ring-2 transition`}
                  placeholder="Enter subjects (e.g., Mathematics, Physics)"
                />
                {errors.subjects && touched.subjects && (
                  <p className="text-red-500 text-xs mt-1">{errors.subjects}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full md:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}