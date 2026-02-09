import API from "../utills/api";

// ========== Academic Class Services ==========

// Get available classrooms
export const fetchClassrooms = (minCapacity) => {
  const params = minCapacity ? { minCapacity } : {};
  return API.get("/academic-class/classrooms", { params });
};

// Get subjects by department
export const fetchSubjectsByDepartment = (departmentId, semester) => {
  const params = { departmentId };
  if (semester) params.semester = semester;
  return API.get("/academic-class/subjects", { params });
};

// Get teachers by department
export const fetchTeachersByDepartment = (departmentId, subjectId) => {
  const params = { departmentId };
  if (subjectId) params.subjectId = subjectId;
  return API.get("/academic-class/teachers", { params });
};

// Get students by department
export const fetchStudentsByDepartment = (departmentId, filters = {}) => {
  const params = { departmentId, ...filters };
  return API.get("/academic-class/students", { params });
};

// Create academic class
export const createAcademicClass = (payload) =>
  API.post("/academic-class/", payload);

// Get all academic classes
export const fetchAllAcademicClasses = (filters = {}) =>
  API.get("/academic-class/", { params: filters });

// Get academic class by ID
export const fetchAcademicClassById = (id) =>
  API.get(`/academic-class/${id}`);

// Update academic class status
export const updateAcademicClassStatus = (id, status) =>
  API.patch(`/academic-class/${id}/status`, { status });
