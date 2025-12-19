import { BrowserRouter, Routes, Route } from "react-router-dom";

// pages
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AddTeacher from "./components/AddTeacher";
import CreateClassroom from "./components/CreateClassroom";
import Unauthorized from "./pages/Unauthorized";  
import UsersPage from "./pages/UsersPage";

   // ✅ Correct import

// components
import AddStudent from "./pages/AddStudent";
import ContactPage from "./pages/ContactUs";
// route protection
import RoleProtectedRoute from "./routes/RoleProtectedRoute";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        

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

        {/* UNAUTHORIZED PAGE */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        

      </Routes>
    </BrowserRouter>
  );
}