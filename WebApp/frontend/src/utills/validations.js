// utils/validations.js

// -----------------------------
// Basic Field Validations
// -----------------------------

export const isRequired = (value) => {
  if (!value || value.toString().trim() === "") {
    return "This field is required.";
  }
  return "";
};

export const validateName = (name) => {
  if (!name) return "Full name is required.";
  if (name.length < 3) return "Name must be at least 3 characters.";
  if (!/^[a-zA-Z\s]+$/.test(name)) return "Name can only contain letters.";
  return "";
};

export const validateEmail = (email) => {
  if (!email) return "Email is required.";

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return "Enter a valid email.";
  return "";
};

export const validatePhone = (phone) => {
  if (!phone) return "Phone number required.";
  const regex = /^[0-9]{10}$/; // 10-digit number
  if (!regex.test(phone)) return "Phone must be 10 digits.";
  return "";
};

export const validateAddress = (address) => {
  if (!address) return "Address is required.";
  if (address.length < 5) return "Address must be at least 5 characters.";
  return "";
};

export const validateDOB = (dob) => {
  if (!dob) return "Date of birth is required.";
  const chosen = new Date(dob);
  const today = new Date();
  if (chosen >= today) return "DOB must be in the past.";
  return "";
};

// -----------------------------
// Academic Fields
// -----------------------------

export const validateRollNo = (rollNo) => {
  if (!rollNo) return "Roll No is required.";
  if (isNaN(rollNo) || rollNo <= 0) return "Roll No must be a positive number.";
  return "";
};

export const validateFaculty = (faculty, options) => {
  if (!faculty) return "Faculty is required.";
  if (options && !options.includes(faculty)) return "Select a valid faculty.";
  return "";
};

export const validateYearOfEnrollment = (year) => {
  if (!year) return "Enrollment year is required.";
  if (isNaN(year)) return "Year must be a number.";
  const currentYear = new Date().getFullYear();
  if (year < 2000 || year > currentYear) return `Year must be between 2000 and ${currentYear}.`;
  return "";
};


// Faculty Section validations
export const validateJoinYear=(year)=>{
  if (!year) return "Joined Year is required.";
  if(isNaN(year)) return "Year must be a number.";
  const currentYear=new Date().getFullYear();
  if(year<2010 || year>currentYear) return `Year must be between 2010 and ${currentYear}.`;
  return "";

};
export const validateEmployeeID=(empID)=>{
  if (!empID) return "Employee ID is required.";
  if (isNaN(empID)) return "Employee ID must be a number.";
  if (empID.length < 5) return "Employee ID must be at least 5 characters.";
  return "";
};


export const validateClass = (cls) => {
  if (!cls) return "Class is required.";
  return "";
};

export const validateSection = (section) => {
  if (!section) return "Section is required.";
  if (section.length > 2) return "Section can be max 2 characters.";
  return "";
};

export const validateUniversityReg = (reg) => {
  if (!reg) return "University registration number is required.";
  return "";
};

// -----------------------------
// File Upload
// -----------------------------

export const validateProfileImage = (file) => {
  if (!file) return "Profile image is required.";
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedTypes.includes(file.type)) return "Only JPG or PNG allowed.";
  if (file.size > 1 * 1024 * 1024) return "File must be under 1MB.";
  return "";
};

// -----------------------------
// Form-wide Utility
// -----------------------------

/**
 * fields: { fieldName: { value: "", validator: fn } }
 * returns: { fieldName: "error message" }
 */
export const validateForm = (fields) => {
  const errors = {};
  for (const key in fields) {
    const { value, validator } = fields[key];
    errors[key] = validator ? validator(value) : "";
  }
  return errors;
};