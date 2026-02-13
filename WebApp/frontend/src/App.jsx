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
import TeacherMyClasses from "./pages/TeacherMyClasses";
import AllStudents from "./pages/AllStudents";
import AllTeachers from "./pages/AllTeachers";
import ActiveClasses from "./pages/ActiveClasses";
import RecentlyAddedStudents from "./pages/RecentlyAddedStudents";
import RecentlyAddedTeachers from "./pages/RecentlyAddedTeachers";
import ActiveTeachersList from "./pages/ActiveTeachersList";
import PendingVerificationStudents from "./pages/PendingVerificationStudents";
import StudentDetails from "./pages/StudentDetails";
import TeacherDetails from "./pages/TeacherDetails";

// components
import CreateClassroom from "./components/CreateClassroom";
import AddStudent from "./pages/AddStudent";
import AddTeacher from "./pages/AddTeacher";
import AddAcademics from "./pages/AddAcademics";
import EnrollFace from "./pages/EnrollFace"; // 🆕 Face enrollment page

// Academic Class pages
import CreateAcademicClass from "./pages/CreateAcademicClass";
import AcademicClassList from "./pages/AcademicClassList";
import AcademicClassDetails from "./pages/AcademicClassDetails";
import TakeAttendance from "./pages/TakeAttendance";
import AttendanceDetails from "./pages/AttendanceDetails";

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

        <Route
          path="/all-students"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AllStudents />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/all-teachers"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AllTeachers />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/active-classes"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <ActiveClasses />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/students-recently-added"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <RecentlyAddedStudents />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/students-pending-verification"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <PendingVerificationStudents />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/teachers-recently-added"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <RecentlyAddedTeachers />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/teachers-active-list"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <ActiveTeachersList />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/student/:id"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <StudentDetails />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/teacher/:id"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <TeacherDetails />
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

        <Route
          path="/admin/academic-class/:id"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AcademicClassDetails />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/take-attendance/:id"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <TakeAttendance />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/attendance/:sessionId"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AttendanceDetails />
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

        <Route
          path="/teacher/my-classes"
          element={
            <RoleProtectedRoute allowedRoles={["teacher"]}>
              <TeacherMyClasses />
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
