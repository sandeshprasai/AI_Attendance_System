// ============================================================================
// STANDALONE ADD STUDENT COMPONENT - Pure React + Tailwind CSS
// ============================================================================

import { useState } from 'react';
import { 
  Upload, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  GraduationCap, 
  Hash 
} from 'lucide-react';

export default function AddStudent() {
  const [formData, setFormData] = useState({
    fullName: '',
    rollNo: '',
    faculty: '',
    yearOfEnrollment: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    class: '',
    section: '',
    fullAddress: '',
    universityReg: '',
    profileImagePath: null
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [touched, setTouched] = useState({});

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Full name is required';
        else if (value.trim().length < 3) error = 'Name must be at least 3 characters';
        else if (!/^[a-zA-Z\s]+$/.test(value)) error = 'Name can only contain letters and spaces';
        break;
      case 'rollNo':
        if (!value) error = 'Roll number is required';
        else if (parseInt(value, 10) <= 0 || isNaN(parseInt(value, 10))) error = 'Roll number must be a positive number';
        break;
      case 'faculty':
        if (!value.trim()) error = 'Faculty is required';
        else if (value.trim().length < 2) error = 'Faculty must be at least 2 characters';
        break;
      case 'yearOfEnrollment': {
        const currentYear = new Date().getFullYear();
        if (!value) error = 'Year of enrollment is required';
        else if (isNaN(parseInt(value, 10)) || parseInt(value, 10) < 2000 || parseInt(value, 10) > currentYear + 1)
          error = `Year must be between 2000 and ${currentYear + 1}`;
        break;
      }
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toLowerCase())) error = 'Please enter a valid email address';
        break;
      case 'phone': {
        const cleanPhone = value.replace(/\s/g, '');
        if (!cleanPhone) error = 'Phone number is required';
        else if (!/^\d{10}$/.test(cleanPhone)) error = 'Phone number must be exactly 10 digits';
        break;
      }
      case 'dateOfBirth':
        if (!value) {
          error = 'Date of birth is required';
        } else {
          const dob = new Date(value);
          const today = new Date();
          if (dob > today) {
            error = 'Date of birth cannot be in the future';
            break;
          }
          let age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
          if (age < 10 || age > 100) error = 'Age must be between 10 and 100 years';
        }
        break;
      case 'class':
        if (!value.trim()) error = 'Class is required';
        else if (value.trim().length < 1) error = 'Class must be at least 1 character';
        break;
      case 'section':
        if (value && value.trim().length > 10) error = 'Section must be at most 10 characters';
        break;
      case 'fullAddress':
        if (!value.trim()) error = 'Address is required';
        else if (value.trim().length < 10) error = 'Address must be at least 10 characters';
        break;
      case 'universityReg':
        if (!value.trim()) error = 'University registration number is required';
        else if (value.trim().length < 5) error = 'Registration number must be at least 5 characters';
        break;
    }
    return error;
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    // Format input based on field
    switch (name) {
      case 'fullName':
        value = capitalizeWords(value.replace(/[^a-zA-Z\s]/g, ''));
        break;
      case 'rollNo':
        value = value.replace(/[^0-9]/g, '');
        break;
      case 'faculty':
        value = value.replace(/[^a-zA-Z\s.&-]/g, '');
        break;
      case 'yearOfEnrollment':
        value = value.replace(/[^0-9]/g, '').slice(0, 4);
        break;
      case 'phone':
        value = value.replace(/[^0-9]/g, '').slice(0, 10);
        break;
      case 'class':
        value = value.replace(/[^a-zA-Z0-9\s]/g, '');
        break;
      case 'section':
        value = value.slice(0, 10);
        break;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name]) }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, profileImagePath: 'Please upload a valid image file' }));
      setTouched(prev => ({ ...prev, profileImagePath: true }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, profileImagePath: 'Image size must be less than 5MB' }));
      setTouched(prev => ({ ...prev, profileImagePath: true }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData(prev => ({ ...prev, profileImagePath: reader.result }));
      setErrors(prev => ({ ...prev, profileImagePath: '' }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profileImagePath: null }));
    setImagePreview(null);
    setErrors(prev => ({ ...prev, profileImagePath: '' }));
  };

  const validateAllFields = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key === 'section' || key === 'profileImagePath') return;
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (!formData.profileImagePath) newErrors.profileImagePath = 'Profile image is required';

    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAllFields()) {
      alert('Please fix all errors before submitting');
      return;
    }

    console.log('Form submitted:', formData);
    alert('Student added successfully!');
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      fullName: '', rollNo: '', faculty: '', yearOfEnrollment: '',
      email: '', phone: '', dateOfBirth: '', class: '', section: '',
      fullAddress: '', universityReg: '', profileImagePath: null
    });
    setImagePreview(null);
    setErrors({});
    setTouched({});
  };

  const shouldShowError = (field) => !!(touched[field] && errors[field]);
  const isFieldValid = (field) => !!(touched[field] && !errors[field] && formData[field]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 p-4 sm:p-6 lg:p-8 saturate-[0.9]">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-xl shadow-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30 shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">SmartAttendanceSystem</h1>
              <p className="text-white/90 text-sm">Student Management Portal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Add Student</h2>
              <p className="text-gray-600 text-sm">Fill in the student information below</p>
            </div>
          </div>
        </div>

        {/* Profile Image Upload */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Profile Photo
          </h3>
          <div className="flex flex-col items-center">
            {imagePreview ? (
              <div className="relative group mb-4">
                <img src={imagePreview} alt="Student preview" className="w-40 h-40 rounded-full object-cover border-4 border-purple-500 shadow-2xl" />
                <button type="button" onClick={removeImage}
                  className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 border-4 border-dashed border-blue-300 hover:border-purple-500 flex items-center justify-center cursor-pointer transition-all shadow-lg hover:shadow-xl mb-4 group">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-12 h-12 text-blue-400 group-hover:text-purple-500 transition-colors" />
                  <span className="text-xs text-blue-500 group-hover:text-purple-600 font-semibold">Upload Photo</span>
                </div>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
            <p className="text-sm text-gray-600">Click to upload student photo</p>
            <p className="text-xs text-gray-500 mt-1">Maximum file size: 5MB (JPG, PNG)</p>
            {shouldShowError('profileImagePath') && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-3 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.profileImagePath}</span>
              </div>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2 pb-3 border-b border-gray-200">
            <User className="w-5 h-5 text-purple-600" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type="text" name="fullName" value={formData.fullName}
                  onChange={handleInputChange} onBlur={handleBlur} placeholder="Enter full name"
                  className={`w-full h-12 px-4 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                    shouldShowError('fullName') ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200' :
                    isFieldValid('fullName') ? 'border-green-400 bg-green-50/50 focus:border-green-500 focus:ring-green-200' :
                    'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                />
                {isFieldValid('fullName') && <CheckCircle2 className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />}
              </div>
              {shouldShowError('fullName') && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 px-3 py-1.5 rounded-md border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.fullName}</span>
                </div>
              )}
            </div>

            {/* Roll Number */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                Roll Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type="text" name="rollNo" value={formData.rollNo}
                  onChange={handleInputChange} onBlur={handleBlur} placeholder="Enter roll number"
                  className={`w-full h-12 px-4 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                    shouldShowError('rollNo') ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200' :
                    isFieldValid('rollNo') ? 'border-green-400 bg-green-50/50 focus:border-green-500 focus:ring-green-200' :
                    'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                />
                {isFieldValid('rollNo') && <CheckCircle2 className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />}
              </div>
              {shouldShowError('rollNo') && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 px-3 py-1.5 rounded-md border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.rollNo}</span>
                </div>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth}
                onChange={handleInputChange} onBlur={handleBlur} max={getTodayDate()}
                className={`w-full h-12 px-4 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                  shouldShowError('dateOfBirth') ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200' :
                  isFieldValid('dateOfBirth') ? 'border-green-400 bg-green-50/50 focus:border-green-500 focus:ring-green-200' :
                  'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                }`}
              />
              {shouldShowError('dateOfBirth') && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 px-3 py-1.5 rounded-md border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.dateOfBirth}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type="email" name="email" value={formData.email}
                  onChange={handleInputChange} onBlur={handleBlur} placeholder="student@example.com"
                  className={`w-full h-12 px-4 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                    shouldShowError('email') ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200' :
                    isFieldValid('email') ? 'border-green-400 bg-green-50/50 focus:border-green-500 focus:ring-green-200' :
                    'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                />
                {isFieldValid('email') && <CheckCircle2 className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />}
              </div>
              {shouldShowError('email') && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 px-3 py-1.5 rounded-md border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type="tel" name="phone" value={formData.phone}
                  onChange={handleInputChange} onBlur={handleBlur} placeholder="9812345678" maxLength={10}
                  className={`w-full h-12 px-4 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                    shouldShowError('phone') ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200' :
                    isFieldValid('phone') ? 'border-green-400 bg-green-50/50 focus:border-green-500 focus:ring-green-200' :
                    'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                />
                {isFieldValid('phone') && <CheckCircle2 className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />}
              </div>
              {shouldShowError('phone') && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 px-3 py-1.5 rounded-md border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.phone}</span>
                </div>
              )}
            </div>

            {/* Full Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                Full Address <span className="text-red-500">*</span>
              </label>
              <textarea name="fullAddress" value={formData.fullAddress}
                onChange={handleInputChange} onBlur={handleBlur} rows={3} placeholder="Enter complete address"
                className={`w-full px-4 py-3 border-2 rounded-lg resize-none transition-all focus:outline-none focus:ring-2 ${
                  shouldShowError('fullAddress') ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200' :
                  isFieldValid('fullAddress') ? 'border-green-400 bg-green-50/50 focus:border-green-500 focus:ring-green-200' :
                  'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                }`}
              />
              {shouldShowError('fullAddress') && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 px-3 py-1.5 rounded-md border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.fullAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2 pb-3 border-b border-gray-200">
            <Building2 className="w-5 h-5 text-purple-600" />
            Academic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Faculty */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                Faculty <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type="text" name="faculty" value={formData.faculty}
                  onChange={handleInputChange} onBlur={handleBlur} placeholder="e.g., Science & Technology"
                  className={`w-full h-12 px-4 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                    shouldShowError('faculty') ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200' :
                    isFieldValid('faculty') ? 'border-green-400 bg-green-50/50 focus:border-green-500 focus:ring-green-200' :
                    'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                />
                {isFieldValid('faculty') && <CheckCircle2 className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />}
              </div>
              {shouldShowError('faculty') && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 px-3 py-1.5 rounded-md border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.faculty}</span>
                </div>
              )}
            </div>

            {/* Year of Enrollment */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Year of Enrollment <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type="text" name="yearOfEnrollment" value={formData.yearOfEnrollment}
                  onChange={handleInputChange} onBlur={handleBlur} placeholder="e.g., 2024" maxLength={4}
                  className={`w-full h-12 px-4 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                    shouldShowError('yearOfEnrollment') ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200' :
                    isFieldValid('yearOfEnrollment') ? 'border-green-400 bg-green-50/50 focus:border-green-500 focus:ring-green-200' :
                    'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                />
                {isFieldValid('yearOfEnrollment') && <CheckCircle2 className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />}
              </div>
              {shouldShowError('yearOfEnrollment') && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 px-3 py-1.5 rounded-md border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.yearOfEnrollment}</span>
                </div>
              )}
            </div>

            {/* Class */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gray-500" />
                Class <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type="text" name="class" value={formData.class}
                  onChange={handleInputChange} onBlur={handleBlur} placeholder="e.g., BCA 1st Year"
                  className={`w-full h-12 px-4 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                    shouldShowError('class') ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200' :
                    isFieldValid('class') ? 'border-green-400 bg-green-50/50 focus:border-green-500 focus:ring-green-200' :
                    'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                />
                {isFieldValid('class') && <CheckCircle2 className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />}
              </div>
              {shouldShowError('class') && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 px-3 py-1.5 rounded-md border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.class}</span>
                </div>
              )}
            </div>

            {/* Section */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                Section
              </label>
              <input type="text" name="section" value={formData.section}
                onChange={handleInputChange} onBlur={handleBlur} placeholder="e.g., A (Optional)"
                className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20"
              />
              {shouldShowError('section') && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 px-3 py-1.5 rounded-md border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.section}</span>
                </div>
              )}
            </div>

            {/* University Reg */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                University Registration Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type="text" name="universityReg" value={formData.universityReg}
                  onChange={handleInputChange} onBlur={handleBlur} placeholder="UNI20230012345"
                  className={`w-full h-12 px-4 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                    shouldShowError('universityReg') ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200' :
                    isFieldValid('universityReg') ? 'border-green-400 bg-green-50/50 focus:border-green-500 focus:ring-green-200' :
                    'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                />
                {isFieldValid('universityReg') && <CheckCircle2 className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />}
              </div>
              {shouldShowError('universityReg') && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 px-3 py-1.5 rounded-md border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.universityReg}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button type="button" onClick={handleReset}
              className="h-12 px-8 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 font-semibold text-gray-700 transition-all">
              Reset Form
            </button>
            <button type="button" onClick={handleSubmit}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all">
              Add Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}