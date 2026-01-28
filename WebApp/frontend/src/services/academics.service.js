import API from "../utills/api"; // your axios instance with interceptors

// ========== Departments ==========
export const addDepartments = (payload) =>
  API.post("/academics/departments", payload);

export const fetchAllDepartments = () =>
  API.get("/academics/allDepartments");

// ========== Subjects ==========
export const addSubjects = (payload) =>
  API.post("/academics/subjects", payload);

// ========== Classrooms ==========
export const addClassrooms = (payload) =>
  API.post("/academics/classes", { classes: payload });