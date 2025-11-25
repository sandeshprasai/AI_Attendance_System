import { useState, useEffect } from 'react';
import { Upload, X, User, Calendar, Mail, Phone, MapPin, Building2, GraduationCap, Hash, CheckCircle, AlertTriangle } from 'lucide-react';

// Tailwind CSS Customization for the Dashboard Look - Includes all detected colors
const tailwindConfig = `
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            // Core Dashboard Colors
            'cyan-brand': '#06b6d4',      // Primary (used in gradient, accents)
            'emerald-brand': '#10b981',   // Secondary (used in gradient, accents)
            'danger-brand': '#f43f5e',    // Rose/Red (Error)
            'warning-brand': '#f59e0b',   // Amber/Yellow (New accent)
            'purple-brand': '#8b5cf6',    // Violet/Purple (New accent)
           
            // Utility Colors
            'background': '#f9fafb',
            'foreground': '#1f2937',
            'muted-foreground': '#6b7280',
            'border': '#e5e7eb',
            'accent-bg': 'rgba(16, 185, 129, 0.05)', // emerald-brand/5 - Subtle background for content area
          },
          animation: {
            'slideIn': 'slideIn 0.3s ease-out forwards',
          },
          keyframes: {
            slideIn: {
              '0%': { transform: 'translateY(100%)', opacity: '0' },
              '100%': { transform: 'translateY(0)', opacity: '1' },
            }
          }
        }
      }
    }
  </script>
`;

// Helper component for cleaner input groups
const InputGroup = ({ label, name, type, value, onChange, placeholder, Icon, required, accent = 'emerald' }) => {
  // Map accent prop to dynamic Tailwind classes
  const colorMap = {
    emerald: {
      base: 'emerald-brand',
      ring: 'emerald-brand/20',
    },
    cyan: {
      base: 'cyan-brand',
      ring: 'cyan-brand/20',
    },
    purple: {
      base: 'purple-brand',
      ring: 'purple-brand/20',
    },
    warning: {
      base: 'warning-brand',
      ring: 'warning-brand/20',
    }
  };

  const colors = colorMap[accent] || colorMap['emerald']; // Default to emerald
 
  const iconClass = `w-4 h-4 text-${colors.base}`;
 
  // Focus and Border classes for interactive styling
  const focusClass = `focus:border-${colors.base} focus:ring-4 focus:ring-${colors.ring}`;
  // Base border uses low saturation accent color
  const baseBorderClass = `border-${colors.base}/50`;

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-foreground flex items-center gap-2">
        {/* Dynamic Icon Color */}
        <Icon className={iconClass} />
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        // Input Class: White background, Soft-colored base border, Stronger focus border/ring
        className={`w-full h-12 px-4 border-2 ${baseBorderClass} rounded-xl transition-all focus:outline-none ${focusClass} bg-white`}
      />
    </div>
  );
};

// Toast Notification Component (Replaces alert())
const Toast = ({ message, type, onClose }) => {
  const isSuccess = type === 'success';
  // Using exact hex color codes from tailwindConfig
  const bgColor = isSuccess ? '#10b981' : '#f43f5e'; // emerald-brand or danger-brand
  const Icon = isSuccess ? CheckCircle : AlertTriangle;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div 
        style={{ backgroundColor: bgColor }}
        className="flex items-center text-white text-sm font-bold px-5 py-4 rounded-xl shadow-2xl transform transition-all duration-300 ease-out animate-slideIn"
      >
        <Icon className="w-5 h-5 mr-3" />
        <p className="mr-3 text-base">{message}</p>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const AddStudent = () => {
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

  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);

  // UPDATED: Helper for email validation using a basic regex pattern AND strict '@gmail.com' check
  const isValidEmail = (email) => {
    // Regex for basic email structure AND must end with @gmail.com
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  };

  // Helper for year range validation
  const isValidYear = (yearStr) => {
    const year = parseInt(yearStr, 10);
    // Check if it's a valid number and within the specified range
    return !isNaN(year) && year >= 1990 && year <= 2027;
  };

  // UPDATED: Input filtering logic for real-time control and formatting
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // 1. Full Name, Faculty, Class (Letters and Spaces only)
    if (name === 'fullName' || name === 'faculty' || name === 'class') {
      // Block numbers for these fields
      filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
     
      // Additional rule for Full Name: Capitalize the first letter of every word
      if (name === 'fullName' && filteredValue.length > 0) {
        // Split by spaces, capitalize the first letter of each word, and rejoin.
        // Also ensure the rest of the letters are lowercase for a cleaner look.
        filteredValue = filteredValue.split(/\s+/)
          .map(word => {
            if (word.length === 0) return '';
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          })
          .join(' ');
      }
    }
    // 2. Roll Number, Year of Enrollment, Phone Number (Numbers only)
    else if (name === 'rollNo' || name === 'yearOfEnrollment' || name === 'phone') {
      // Allow only digits (0-9)
      filteredValue = value.replace(/[^0-9]/g, '');
    }
    // 3. Section, Email, Date of Birth, Address, University Reg (No specific filtering)
    // All other fields are handled by default: filteredValue = value
   
    setFormData(prev => ({ ...prev, [name]: filteredValue }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData(prev => ({ ...prev, profileImagePath: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profileImagePath: null }));
    setImagePreview(null);
  };

  // UPDATED: Validation logic
  const handleSubmit = () => {
    // 1. Initial check for missing required fields
    const requiredFields = ['fullName', 'rollNo', 'email', 'phone', 'dateOfBirth', 'faculty', 'class', 'yearOfEnrollment', 'fullAddress', 'universityReg'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setToast({ message: 'Please fill out all required fields.', type: 'error' });
      return;
    }

    // 2. Full Name capitalization check (already enforced in real-time but good practice to double-check)
    // We check that every word in the split array starts with a capital letter
    const words = formData.fullName.trim().split(/\s+/);
    const isNameCapitalized = words.every(word => word.length > 0 && word.charAt(0) === word.charAt(0).toUpperCase());

    if (!isNameCapitalized) {
      // This is unlikely if real-time filtering worked, but serves as a final check.
      setToast({ message: 'Full Name (first and last name) must start with a capital letter.', type: 'error' });
      return;
    }
   
    // 3. Phone Number length check (9 or 10 digits)
    if (formData.phone.length !== 9 && formData.phone.length !== 10) {
      setToast({ message: 'Phone Number must be exactly 9 or 10 digits.', type: 'error' });
      return;
    }
   
    // 4. Email format check (must be strictly @gmail.com)
    if (!isValidEmail(formData.email)) {
      setToast({ message: 'Email must be in a proper format and strictly a @gmail.com address.', type: 'error' });
      return;
    }
   
    // 5. Year of Enrollment range check
    if (!isValidYear(formData.yearOfEnrollment)) {
      setToast({ message: 'Year of Enrollment must be between 1990 and 2027.', type: 'error' });
      return;
    }
   
    // If all checks pass
    console.log('Form submitted:', formData);
    // Success toast uses the saturated emerald color (bg-emerald-brand)
    setToast({ message: 'Student successfully registered! (Check console for data)', type: 'success' });
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      fullName: '', rollNo: '', faculty: '', yearOfEnrollment: '',
      email: '', phone: '', dateOfBirth: '', class: '', section: '',
      fullAddress: '', universityReg: '', profileImagePath: null
    });
    setImagePreview(null);
  };

  // Inject the custom Tailwind configuration
  if (typeof window !== 'undefined' && document.head.innerHTML.indexOf('tailwind.config') === -1) {
    document.head.insertAdjacentHTML('beforeend', tailwindConfig);
  }

  return (
    <div className="min-h-screen bg-background font-['Inter']">
      <style>
        {`
          /* Gradient uses both core brand colors */
          .dashboard-gradient {
            background-image: linear-gradient(to right, #06b6d4, #10b981); /* Cyan to Emerald gradient */
          }
          .dashboard-text-gradient {
            background-image: linear-gradient(to right, #06b6d4, #10b981);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        `}
      </style>

      {/* Header - Matches dashboard primary color scheme */}
      <div className="max-w-6xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
        <div className="dashboard-gradient rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/40 shadow-lg">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">SmartAttendanceSystem</h1>
              <p className="text-white/95 text-sm font-medium">Student Management Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-t-4 border-t-emerald-brand">
         
          {/* Card Header (Now uses a subtle Emerald background) */}
          <div className="bg-emerald-brand/10 border-b-2 border-emerald-brand/30 p-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-brand rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold dashboard-text-gradient">
                  Add New Student
                </h2>
                <p className="text-muted-foreground">Complete all student information below</p>
              </div>
            </div>
          </div>

          {/* Card Content with subtle background accent for sections */}
          <div className="p-8 space-y-8 bg-accent-bg">
           
            {/* Profile Image Upload - CYAN THEME APPLIED */}
            <div className="flex flex-col items-center space-y-4 pb-8 border-b-2 border-cyan-brand/20">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-brand" />
                Profile Photo
              </h3>
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Student preview"
                    className="w-40 h-40 rounded-full object-cover border-4 border-cyan-brand shadow-2xl ring-4 ring-cyan-brand/20"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-10 h-10 bg-danger-brand text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:scale-110 hover:bg-danger-brand/90"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="w-40 h-40 rounded-full bg-cyan-brand/10 border-4 border-dashed border-cyan-brand/40 hover:border-cyan-brand hover:bg-cyan-brand/20 flex items-center justify-center cursor-pointer transition-all shadow-lg hover:shadow-xl group">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-12 h-12 text-cyan-brand group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-cyan-brand font-bold">Upload Photo</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
              <p className="text-sm text-muted-foreground">Maximum file size: 5MB (JPG, PNG)</p>
            </div>

            {/* Personal Information - EMERALD THEME APPLIED TO BORDER, DIVIDER, and TITLE TEXT */}
            <div className="space-y-6 bg-white p-6 rounded-xl shadow-md border-2 border-emerald-brand/30">
              <h3 className="text-xl font-bold text-emerald-brand flex items-center gap-2 pb-2 border-b-2 border-emerald-brand/30">
                <User className="w-6 h-6 text-emerald-brand" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
                <InputGroup label="Full Name" name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} placeholder="Enter full name (First and Last name capitalized)" Icon={User} required accent="emerald" />
                <InputGroup label="Roll Number" name="rollNo" type="text" value={formData.rollNo} onChange={handleInputChange} placeholder="Enter roll number" Icon={Hash} required accent="cyan" />
                <InputGroup label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} Icon={Calendar} required accent="emerald" />
               
                {/* Contact Information - Purple Theme (Inputs) */}
                <InputGroup label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="student@gmail.com (Strictly Gmail)" Icon={Mail} required accent="purple" />
                <InputGroup label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="e.g., 9812345678 (9 or 10 digits)" Icon={Phone} required accent="purple" />

                {/* Full Address - Manual application of white background and colored border (Emerald accent) */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-brand" />
                    Full Address
                  </label>
                  <textarea
                    name="fullAddress"
                    value={formData.fullAddress}
                    onChange={handleInputChange}
                    rows={3}
                    // Placeholder removed the example address
                    placeholder="Enter complete address details"
                    // White background, soft emerald border, strong focus
                    className="w-full px-4 py-3 border-2 border-emerald-brand/50 rounded-xl resize-none transition-all focus:outline-none focus:border-emerald-brand focus:ring-4 focus:ring-emerald-brand/20 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information - CYAN THEME APPLIED TO BORDER, DIVIDER, and TITLE TEXT/ICON */}
            <div className="space-y-6 bg-white p-6 rounded-xl shadow-md border-2 border-cyan-brand/30">
              <h3 className="text-xl font-bold text-cyan-brand flex items-center gap-2 pb-2 border-b-2 border-cyan-brand/30">
                {/* Icon now matches the Cyan section theme */}
                <Building2 className="w-6 h-6 text-cyan-brand" />
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
                <InputGroup label="Faculty" name="faculty" type="text" value={formData.faculty} onChange={handleInputChange} placeholder="e.g., Science & Technology" Icon={Building2} required accent="emerald" />
                {/* Enrollment Year - Warning/Amber Theme */}
                <InputGroup label="Year of Enrollment" name="yearOfEnrollment" type="text" value={formData.yearOfEnrollment} onChange={handleInputChange} placeholder="e.g., 2024 (1990 - 2027)" Icon={Calendar} required accent="warning" />
               
                <InputGroup label="Class" name="class" type="text" value={formData.class} onChange={handleInputChange} placeholder="e.g., BCA 1st Year" Icon={GraduationCap} required accent="emerald" />
                <InputGroup label="Section" name="section" type="text" value={formData.section} onChange={handleInputChange} placeholder="e.g., A (Optional)" Icon={Hash} accent="cyan" />

                {/* University Reg - Cyan Theme */}
                <div className="space-y-2 md:col-span-2">
                  <InputGroup
                    label="University Registration Number"
                    name="universityReg"
                    type="text"
                    value={formData.universityReg}
                    onChange={handleInputChange}
                    placeholder="UNI20230012345"
                    Icon={Hash}
                    required
                    accent="cyan"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t-2 border-emerald-brand/30">
              <button
                type="button"
                onClick={handleReset}
                // Reset button uses the Emerald/Teal outline
                className="h-12 px-8 border-2 border-emerald-brand rounded-xl hover:bg-emerald-brand/5 font-bold text-emerald-brand transition-all shadow-md hover:shadow-lg"
              >
                Reset Form
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                // Submit button uses the full gradient
                className="h-12 px-8 dashboard-gradient hover:shadow-2xl text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02]"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification for feedback */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AddStudent;