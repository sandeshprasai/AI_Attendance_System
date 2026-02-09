import { BrowserRouter, Routes, Route } from "react-router-dom";

// pages
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Unauthorized from "./pages/Unauthorized";
import UsersPage from "./pages/UsersPage";
import ContactUs from "./pages/ContactUs";
import ForgetPassword from "./pages/ForgetPassword";

// components
import CreateClassroom from "./components/CreateClassroom";
import AddStudent from "./pages/AddStudent";
import AddTeacher from "./pages/AddTeacher";
import AddAcademics from "./pages/AddAcademics";
import EnrollFace from "./pages/EnrollFace"; // 🆕 Face enrollment page

// Academic Class pages
import CreateAcademicClass from "./pages/CreateAcademicClass";
import AcademicClassList from "./pages/AcademicClassList";

// route protection
import RoleProtectedRoute from "./routes/RoleProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* Forgot Password */}
        <Route path="/forget-password" element={<ForgetPassword />} />

        {/* ADMIN ONLY */}
        <Route
          path="/admin-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/add-student"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AddStudent />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/add-teacher"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AddTeacher />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/add-academics"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AddAcademics />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/enroll-face"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <EnrollFace />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/create-classroom"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <CreateClassroom />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <UsersPage />
            </RoleProtectedRoute>
          }
        />

        {/* 🆕 Academic Class Routes */}
        <Route
          path="/admin/create-academic-class"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <CreateAcademicClass />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/academic-classes"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AcademicClassList />
            </RoleProtectedRoute>
          }
        />

        {/* TEACHER ONLY */}
        <Route
          path="/teacher-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* STUDENT ONLY */}
        <Route
          path="/student-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* UNAUTHORIZED */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
}
