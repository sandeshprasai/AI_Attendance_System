import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

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
  const [touched, setTouched] = useState({});

  const capitalizeWords = (str) => {
    return (str || '').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const validateField = (name, value) => {
    value = value ?? '';
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
        } else if (parseInt(value, 10) <= 0 || isNaN(parseInt(value, 10))) {
          error = 'Roll number must be a positive number';
        }
        break;

      case 'Faculty':
        if (!value.trim()) {
          error = 'Faculty is required';
        } else if (value.trim().length < 2) {
          error = 'Faculty must be at least 2 characters';
        }
        break;

      case 'YearOfEnrollment': {
        const currentYear = new Date().getFullYear();
        if (!value) {
          error = 'Year of enrollment is required';
        } else if (isNaN(parseInt(value, 10)) || parseInt(value, 10) < 2000 || parseInt(value, 10) > currentYear + 1) {
          error = `Year must be between 2000 and ${currentYear + 1}`;
        }
        break;
      }

      case 'Email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'Phone': {
        const cleanPhone = String(value).replace(/\s/g, '');
        if (!cleanPhone) {
          error = 'Phone number is required';
        } else if (!/^\d{9,10}$/.test(cleanPhone)) {
          error = 'Phone number must be 9 or 10 digits';
        }
        break;
      }

      case 'DateOfBirth':
        if (!value) {
          error = 'Date of birth is required';
        } else {
          const dob = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
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
        // optional
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

    // Prevent invalid characters based on field type
    switch (name) {
      case 'FullName':
        value = value.replace(/[^a-zA-Z\s]/g, '');
        value = capitalizeWords(value);
        break;

      case 'RollNo':
        value = value.replace(/[^0-9]/g, '');
        break;

      case 'Faculty':
        value = value.replace(/[^a-zA-Z\s]/g, '');
        break;

      case 'YearOfEnrollment':
        value = value.replace(/[^0-9]/g, '');
        break;

      case 'Phone':
        value = value.replace(/[^0-9]/g, '');
        break;

      case 'Class':
        value = value.replace(/[^a-zA-Z\s]/g, '');
        break;

      // 'Section' and others can have any characters
      default:
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // live-validate field
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));

    // Validate on blur as well
    const error = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, ProfileImagePath: 'Please upload a valid image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, ProfileImagePath: 'Image size must be less than 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({
          ...prev,
          ProfileImagePath: reader.result
        }));
        setErrors((prev) => ({ ...prev, ProfileImagePath: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, ProfileImagePath: null }));
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, ProfileImagePath: '' }));
  };

  const validateAllFields = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key === 'Section') return; // optional
      if (key === 'ProfileImagePath') return; // handled separately
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (!formData.ProfileImagePath) {
      newErrors.ProfileImagePath = 'Profile image is required';
    }

    setErrors(newErrors);
    // mark all touched so errors show in UI
    setTouched(
      Object.keys(formData).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAllFields()) {
      alert('Please fix all validation errors before submitting');
      return;
    }

    const dataToSend = {
      FullName: formData.FullName.trim(),
      RollNo: parseInt(formData.RollNo, 10),
      Faculty: formData.Faculty.trim(),
      YearOfEnrollment: parseInt(formData.YearOfEnrollment, 10),
      Email: formData.Email.trim().toLowerCase(),
      Phone: String(formData.Phone).replace(/\s/g, ''),
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        alert('Student added successfully!');
        // full reset
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
        setTouched({});
      } else {
        const error = await response.json().catch(() => ({}));
        alert(`Error: ${error.message || 'Failed to add student'}`);
      }
    } catch (err) {
      console.error('Error:', err);
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
    setTouched({});
  };

  const shouldShowError = (fieldName) => {
    // show error only when field has been touched and there is an error
    return !!(touched[fieldName] && errors[fieldName]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-500 to-teal-500 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto pt-4 sm:pt-6 lg:pt-8">
        <div className="bg-gradient-to-br from-cyan-400/25 via-teal-400/25 to-cyan-500/25 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-white/40">
          {/* Profile Image Upload Section */}
          <div className="mb-8 sm:mb-10 flex flex-col items-center">
            <div className="relative">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-2xl"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-200 shadow-lg hover:scale-110"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <label className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 border-4 border-white shadow-2xl hover:shadow-cyan-400/50">
                  <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-600" strokeWidth={2.5} />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
            <p className="text-white text-xs sm:text-sm mt-3 drop-shadow-md text-center">Click to upload student photo</p>
            {shouldShowError('ProfileImagePath') && (
              <p className="text-red-100 text-xs sm:text-sm mt-2">{errors.ProfileImagePath}</p>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-8 sm:mb-10 drop-shadow-lg">
            Add Student
          </h2>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Full Name */}
            <div className="w-full">
              <label className="block text-white font-semibold mb-2 text-sm sm:text-base drop-shadow-md">
                Full Name <span className="text-red-200">*</span>
              </label>
              <input
                type="text"
                name="FullName"
                value={formData.FullName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200/50 transition-all duration-200 shadow-lg text-sm sm:text-base"
                placeholder="Enter full name"
              />
              {shouldShowError('FullName') && <p className="text-red-100 text-xs sm:text-sm mt-1 drop-shadow-md">{errors.FullName}</p>}
            </div>

            {/* Roll Number */}
            <div className="w-full">
              <label className="block text-white font-semibold mb-2 text-sm sm:text-base drop-shadow-md">
                Roll Number <span className="text-red-200">*</span>
              </label>
              <input
                type="text"
                name="RollNo"
                value={formData.RollNo}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200/50 transition-all duration-200 shadow-lg text-sm sm:text-base"
                placeholder="Enter roll number"
              />
              {shouldShowError('RollNo') && <p className="text-red-100 text-xs sm:text-sm mt-1 drop-shadow-md">{errors.RollNo}</p>}
            </div>

            {/* Faculty */}
            <div className="w-full">
              <label className="block text-white font-semibold mb-2 text-sm sm:text-base drop-shadow-md">
                Faculty <span className="text-red-200">*</span>
              </label>
              <input
                type="text"
                name="Faculty"
                value={formData.Faculty}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200/50 transition-all duration-200 shadow-lg text-sm sm:text-base"
                placeholder="Enter faculty"
              />
              {shouldShowError('Faculty') && <p className="text-red-100 text-xs sm:text-sm mt-1 drop-shadow-md">{errors.Faculty}</p>}
            </div>

            {/* Year of Enrollment */}
            <div className="w-full">
              <label className="block text-white font-semibold mb-2 text-sm sm:text-base drop-shadow-md">
                Year of Enrollment <span className="text-red-200">*</span>
              </label>
              <input
                type="text"
                name="YearOfEnrollment"
                value={formData.YearOfEnrollment}
                onChange={handleInputChange}
                onBlur={handleBlur}
                maxLength="4"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200/50 transition-all duration-200 shadow-lg text-sm sm:text-base"
                placeholder="e.g., 2024"
              />
              {shouldShowError('YearOfEnrollment') && <p className="text-red-100 text-xs sm:text-sm mt-1 drop-shadow-md">{errors.YearOfEnrollment}</p>}
            </div>

            {/* Email */}
            <div className="w-full">
              <label className="block text-white font-semibold mb-2 text-sm sm:text-base drop-shadow-md">
                Email <span className="text-red-200">*</span>
              </label>
              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/95 backdrop-blur-sm border-2 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200 shadow-lg text-sm sm:text-base ${
                  shouldShowError('Email') ? 'border-purple-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-200/50' : 'border-white/50 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200/50'
                }`}
                placeholder="student@example.com"
              />
              {shouldShowError('Email') && <p className="text-purple-200 text-xs sm:text-sm mt-1 font-semibold drop-shadow-md">{errors.Email}</p>}
            </div>

            {/* Phone Number */}
            <div className="w-full">
              <label className="block text-white font-semibold mb-2 text-sm sm:text-base drop-shadow-md">
                Phone Number <span className="text-red-200">*</span>
              </label>
              <input
                type="text"
                name="Phone"
                value={formData.Phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                maxLength="10"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/95 backdrop-blur-sm border-2 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200 shadow-lg text-sm sm:text-base ${
                  shouldShowError('Phone') ? 'border-purple-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-200/50' : 'border-white/50 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200/50'
                }`}
                placeholder="9812345678"
              />
              {shouldShowError('Phone') && <p className="text-purple-200 text-xs sm:text-sm mt-1 font-semibold drop-shadow-md">{errors.Phone}</p>}
            </div>

            {/* Date of Birth */}
            <div className="w-full">
              <label className="block text-white font-semibold mb-2 text-sm sm:text-base drop-shadow-md">
                Date of Birth <span className="text-red-200">*</span>
              </label>
              <input
                type="date"
                name="DateOfBirth"
                value={formData.DateOfBirth}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-lg sm:rounded-xl text-gray-800 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200/50 transition-all duration-200 shadow-lg text-sm sm:text-base"
              />
              {shouldShowError('DateOfBirth') && <p className="text-red-100 text-xs sm:text-sm mt-1 drop-shadow-md">{errors.DateOfBirth}</p>}
            </div>

            {/* Class */}
            <div className="w-full">
              <label className="block text-white font-semibold mb-2 text-sm sm:text-base drop-shadow-md">
                Class <span className="text-red-200">*</span>
              </label>
              <input
                type="text"
                name="Class"
                value={formData.Class}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200/50 transition-all duration-200 shadow-lg text-sm sm:text-base"
                placeholder="Enter class (e.g., BSCS)"
              />
              {shouldShowError('Class') && <p className="text-red-100 text-xs sm:text-sm mt-1 drop-shadow-md">{errors.Class}</p>}
            </div>

            {/* Section */}
            <div className="w-full">
              <label className="block text-white font-semibold mb-2 text-sm sm:text-base drop-shadow-md">Section</label>
              <input
                type="text"
                name="Section"
                value={formData.Section}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200/50 transition-all duration-200 shadow-lg text-sm sm:text-base"
                placeholder="Enter section (e.g., A) - Optional"
              />
            </div>

            {/* University Reg. Number */}
            <div className="w-full">
              <label className="block text-white font-semibold mb-2 text-sm sm:text-base drop-shadow-md">
                University Reg. Number <span className="text-red-200">*</span>
              </label>
              <input
                type="text"
                name="UniversityReg"
                value={formData.UniversityReg}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200/50 transition-all duration-200 shadow-lg text-sm sm:text-base"
                placeholder="UNI20230012345"
              />
              {shouldShowError('UniversityReg') && <p className="text-red-100 text-xs sm:text-sm mt-1 drop-shadow-md">{errors.UniversityReg}</p>}
            </div>

            {/* Full Address */}
            <div className="w-full md:col-span-2">
              <label className="block text-white font-semibold mb-2 text-sm sm:text-base drop-shadow-md">
                Full Address <span className="text-red-200">*</span>
              </label>
              <textarea
                name="FullAddress"
                value={formData.FullAddress}
                onChange={handleInputChange}
                onBlur={handleBlur}
                rows="3"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-lg sm:rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200/50 transition-all duration-200 resize-none shadow-lg text-sm sm:text-base"
                placeholder="Enter full address"
              />
              {shouldShowError('FullAddress') && <p className="text-red-100 text-xs sm:text-sm mt-1 drop-shadow-md">{errors.FullAddress}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10">
            <button onClick={handleSubmit} className="flex-1 bg-white text-cyan-600 font-bold text-base sm:text-lg py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl hover:bg-cyan-50 transition-all duration-200 transform hover:scale-105 shadow-2xl hover:shadow-cyan-400/50">
              Add Student
            </button>
            <button onClick={handleReset} className="w-full sm:w-auto px-8 sm:px-10 bg-white/80 backdrop-blur-sm text-gray-700 font-bold text-base sm:text-lg py-3 sm:py-4 rounded-lg sm:rounded-xl hover:bg-white transition-all duration-200 shadow-xl">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
