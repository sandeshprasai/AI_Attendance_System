import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';

export default function AddStudent() {
  const [formData, setFormData] = useState({
    FullName: '',
    RollNo: '',
    Faculty: '',
    YearOfEnrollment: '',
    Email: '',
    Phone: '',
    DateOfBirth: '',
    Class: '',
    Section: '',
    FullAddress: '',
    UniversityReg: '',
    ProfileImagePath: null
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Capitalize first letter of each word
  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'FullName':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (value.trim().length < 3) {
          error = 'Name must be at least 3 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Name can only contain letters and spaces';
        }
        break;

      case 'RollNo':
        if (!value) {
          error = 'Roll number is required';
        } else if (parseInt(value) <= 0) {
          error = 'Roll number must be positive';
        }
        break;

      case 'Faculty':
        if (!value.trim()) {
          error = 'Faculty is required';
        } else if (value.trim().length < 2) {
          error = 'Faculty must be at least 2 characters';
        }
        break;

      case 'YearOfEnrollment':
        const currentYear = new Date().getFullYear();
        if (!value) {
          error = 'Year of enrollment is required';
        } else if (parseInt(value) < 2000 || parseInt(value) > currentYear + 1) {
          error = `Year must be between 2000 and ${currentYear + 1}`;
        }
        break;

      case 'Email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'Phone':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!/^\d{10}$/.test(value.replace(/\s/g, ''))) {
          error = 'Phone number must be 10 digits';
        }
        break;

      case 'DateOfBirth':
        if (!value) {
          error = 'Date of birth is required';
        } else {
          const dob = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          if (age < 10 || age > 100) {
            error = 'Age must be between 10 and 100 years';
          }
        }
        break;

      case 'Class':
        if (!value.trim()) {
          error = 'Class is required';
        } else if (value.trim().length < 1) {
          error = 'Class must be at least 1 character';
        }
        break;

      case 'Section':
        // Section is optional, no validation needed
        break;

      case 'FullAddress':
        if (!value.trim()) {
          error = 'Address is required';
        } else if (value.trim().length < 10) {
          error = 'Address must be at least 10 characters';
        }
        break;

      case 'UniversityReg':
        if (!value.trim()) {
          error = 'University registration number is required';
        } else if (value.trim().length < 5) {
          error = 'Registration number must be at least 5 characters';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    // Auto-capitalize names
    if (name === 'FullName') {
      value = capitalizeWords(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate on change
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, ProfileImagePath: 'Please upload a valid image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, ProfileImagePath: 'Image size must be less than 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ 
          ...prev, 
          ProfileImagePath: reader.result
        }));
        setErrors(prev => ({ ...prev, ProfileImagePath: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, ProfileImagePath: null }));
    setImagePreview(null);
    setErrors(prev => ({ ...prev, ProfileImagePath: '' }));
  };

  const validateAllFields = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'ProfileImagePath' && key !== 'Section') {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    if (!formData.ProfileImagePath) {
      newErrors.ProfileImagePath = 'Profile image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAllFields()) {
      alert('Please fix all validation errors before submitting');
      return;
    }

    const dataToSend = {
      FullName: formData.FullName.trim(),
      RollNo: parseInt(formData.RollNo),
      Faculty: formData.Faculty.trim(),
      YearOfEnrollment: parseInt(formData.YearOfEnrollment),
      Email: formData.Email.trim().toLowerCase(),
      Phone: formData.Phone.replace(/\s/g, ''),
      DateOfBirth: formData.DateOfBirth,
      Class: formData.Class.trim(),
      Section: formData.Section.trim() || '',
      FullAddress: formData.FullAddress.trim(),
      UniversityReg: formData.UniversityReg.trim(),
      ProfileImagePath: formData.ProfileImagePath
    };

    console.log('Sending data to API:', dataToSend);

    try {
      const response = await fetch('http://localhost:5000/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        alert('Student added successfully!');
        handleReset();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to add student'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to server');
    }
  };

  const handleReset = () => {
    setFormData({
      FullName: '',
      RollNo: '',
      Faculty: '',
      YearOfEnrollment: '',
      Email: '',
      Phone: '',
      DateOfBirth: '',
      Class: '',
      Section: '',
      FullAddress: '',
      UniversityReg: '',
      ProfileImagePath: null
    });
    setImagePreview(null);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-blue-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Icon */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-3xl mb-6 shadow-2xl">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
            SmartAttendance
          </h1>
          <p className="text-2xl font-semibold text-white mb-2">Add New Student</p>
          <p className="text-cyan-300 text-lg">Enter student details for <span className="text-cyan-400 font-semibold">real-time face recognition</span> enrollment</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-10 shadow-2xl">
          {/* Profile Image Upload */}
          <div className="mb-10 flex flex-col items-center">
            <label className="block text-gray-700 font-bold text-lg mb-4 text-center">Profile Image *</label>
            <div className="relative">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-36 h-36 rounded-full object-cover border-4 border-cyan-400 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="w-36 h-36 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform border-4 border-cyan-400 shadow-xl">
                  <Upload className="w-10 h-10 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-3">Click to upload student photo</p>
            {errors.ProfileImagePath && <p className="text-red-500 text-sm mt-1">{errors.ProfileImagePath}</p>}
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
              <input
                type="text"
                name="FullName"
                value={formData.FullName}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition ${
                  errors.FullName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200'
                }`}
                placeholder="Enter full name"
              />
              {errors.FullName && <p className="text-red-500 text-sm mt-1">{errors.FullName}</p>}
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Roll Number *</label>
              <input
                type="number"
                name="RollNo"
                value={formData.RollNo}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition ${
                  errors.RollNo ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200'
                }`}
                placeholder="Enter roll number"
              />
              {errors.RollNo && <p className="text-red-500 text-sm mt-1">{errors.RollNo}</p>}
            </div>

            {/* Faculty */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Faculty *</label>
              <input
                type="text"
                name="Faculty"
                value={formData.Faculty}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition ${
                  errors.Faculty ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200'
                }`}
                placeholder="Enter faculty"
              />
              {errors.Faculty && <p className="text-red-500 text-sm mt-1">{errors.Faculty}</p>}
            </div>

            {/* Year of Enrollment */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Year of Enrollment *</label>
              <input
                type="number"
                name="YearOfEnrollment"
                value={formData.YearOfEnrollment}
                onChange={handleInputChange}
                required
                min="2000"
                max="2030"
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition ${
                  errors.YearOfEnrollment ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200'
                }`}
                placeholder="e.g., 2024"
              />
              {errors.YearOfEnrollment && <p className="text-red-500 text-sm mt-1">{errors.YearOfEnrollment}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email *</label>
              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition ${
                  errors.Email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200'
                }`}
                placeholder="student@example.com"
              />
              {errors.Email && <p className="text-red-500 text-sm mt-1">{errors.Email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Phone Number *</label>
              <input
                type="tel"
                name="Phone"
                value={formData.Phone}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition ${
                  errors.Phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200'
                }`}
                placeholder="9812345678"
              />
              {errors.Phone && <p className="text-red-500 text-sm mt-1">{errors.Phone}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Date of Birth *</label>
              <input
                type="date"
                name="DateOfBirth"
                value={formData.DateOfBirth}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 focus:outline-none transition ${
                  errors.DateOfBirth ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200'
                }`}
              />
              {errors.DateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.DateOfBirth}</p>}
            </div>

            {/* Class */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Class *</label>
              <input
                type="text"
                name="Class"
                value={formData.Class}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition ${
                  errors.Class ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200'
                }`}
                placeholder="Enter class (e.g., BSCS)"
              />
              {errors.Class && <p className="text-red-500 text-sm mt-1">{errors.Class}</p>}
            </div>

            {/* Section */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Section</label>
              <input
                type="text"
                name="Section"
                value={formData.Section}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 transition"
                placeholder="Enter section (e.g., A) - Optional"
              />
            </div>

            {/* University Registration Number */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">University Reg. Number *</label>
              <input
                type="text"
                name="UniversityReg"
                value={formData.UniversityReg}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition ${
                  errors.UniversityReg ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200'
                }`}
                placeholder="UNI20230012345"
              />
              {errors.UniversityReg && <p className="text-red-500 text-sm mt-1">{errors.UniversityReg}</p>}
            </div>

            {/* Full Address - Spans 2 columns */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">Full Address *</label>
              <textarea
                name="FullAddress"
                value={formData.FullAddress}
                onChange={handleInputChange}
                required
                rows="3"
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition resize-none ${
                  errors.FullAddress ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200'
                }`}
                placeholder="123 Main Street, City, State 12345"
              />
              {errors.FullAddress && <p className="text-red-500 text-sm mt-1">{errors.FullAddress}</p>}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 mt-10">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg py-4 px-8 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
            >
              Add Student
            </button>
            <button
              onClick={handleReset}
              className="px-10 bg-gray-200 text-gray-700 font-bold text-lg py-4 rounded-xl hover:bg-gray-300 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}