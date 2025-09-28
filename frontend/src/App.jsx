import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import { NotificationProvider } from "./context/NotificationContext";

// Layout Components
import Layout from "./components/common/Layout";
import LoadingScreen from "./components/common/Loading";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/auth/Profile";

// Public Pages
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Catalog from "./pages/public/Catalog";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import MyCourses from "./pages/student/MyCourses";
import CourseView from "./pages/student/CourseView";
import Progress from "./pages/student/Progress";
import Certificates from "./pages/student/Certificates";
import Settings from "./pages/student/Settings";

// Instructor Pages
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import CreateCourse from "./pages/instructor/CreateCourse";
import EditCourse from "./pages/instructor/EditCourse";
import StudentAnalytics from "./pages/instructor/StudentAnalytics";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Courses from "./pages/admin/Courses";
import Reports from "./pages/admin/Reports";
import SystemConfig from "./pages/admin/SystemConfig";

// Error Pages
import NotFound from "./pages/error/NotFound";
import Unauthorized from "./pages/error/Unauthorized";
import ServerError from "./pages/error/ServerError";

// Protected Route Component
import ProtectedRoute from "./components/common/ProtectedRoute";

// Youth Computing Theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#010b40",
      light: "#1a237e",
      dark: "#000051",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f13544",
      light: "#ff6b74",
      dark: "#ba000d",
      contrastText: "#ffffff",
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    text: {
      primary: "#010b40",
      secondary: "#808080",
    },
    grey: { 500: "#808080" },
    error: { main: "#f13544" },
    success: { main: "#4caf50" },
    warning: { main: "#ff9800" },
    info: { main: "#2196f3" },
  },
  typography: {
    fontFamily:
      'Ubuntu, "Century Gothic", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: "Ubuntu, sans-serif",
      fontWeight: 700,
      fontSize: "2.5rem",
      color: "#010b40",
    },
    h2: {
      fontFamily: "Ubuntu, sans-serif",
      fontWeight: 600,
      fontSize: "2rem",
      color: "#010b40",
    },
    h3: {
      fontFamily: "Ubuntu, sans-serif",
      fontWeight: 600,
      fontSize: "1.75rem",
      color: "#010b40",
    },
    h4: {
      fontFamily: "Ubuntu, sans-serif",
      fontWeight: 500,
      fontSize: "1.5rem",
      color: "#010b40",
    },
    h5: {
      fontFamily: "Ubuntu, sans-serif",
      fontWeight: 500,
      fontSize: "1.25rem",
      color: "#010b40",
    },
    h6: {
      fontFamily: "Ubuntu, sans-serif",
      fontWeight: 500,
      fontSize: "1rem",
      color: "#010b40",
    },
    body1: {
      fontFamily: '"Century Gothic", sans-serif',
      fontSize: "1rem",
      lineHeight: 1.6,
      color: "#010b40",
    },
    body2: {
      fontFamily: '"Century Gothic", sans-serif',
      fontSize: "0.875rem",
      lineHeight: 1.6,
      color: "#808080",
    },
    button: {
      fontFamily: "Ubuntu, sans-serif",
      fontWeight: 600,
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": { boxShadow: "0 4px 8px rgba(1, 11, 64, 0.2)" },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #010b40 0%, #1a237e 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #000051 0%, #010b40 100%)",
          },
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #f13544 0%, #ba000d 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #ba000d 0%, #f13544 100%)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(1, 11, 64, 0.1)",
          border: "1px solid rgba(1, 11, 64, 0.05)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#010b40",
          boxShadow: "0 2px 10px rgba(1, 11, 64, 0.2)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          borderRight: "1px solid rgba(1, 11, 64, 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "&:hover fieldset": { borderColor: "#010b40" },
            "&.Mui-focused fieldset": { borderColor: "#010b40" },
          },
          "& .MuiInputLabel-root.Mui-focused": { color: "#010b40" },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 20, fontWeight: 500 },
        colorPrimary: { backgroundColor: "#010b40", color: "#ffffff" },
        colorSecondary: { backgroundColor: "#f13544", color: "#ffffff" },
      },
    },
  },
  shape: { borderRadius: 8 },
  shadows: [
    "none",
    "0 2px 4px rgba(1, 11, 64, 0.1)",
    "0 4px 8px rgba(1, 11, 64, 0.1)",
    "0 6px 12px rgba(1, 11, 64, 0.1)",
    "0 8px 16px rgba(1, 11, 64, 0.1)",
    "0 10px 20px rgba(1, 11, 64, 0.15)",
    "0 12px 24px rgba(1, 11, 64, 0.15)",
    "0 14px 28px rgba(1, 11, 64, 0.15)",
    "0 16px 32px rgba(1, 11, 64, 0.2)",
    "0 18px 36px rgba(1, 11, 64, 0.2)",
    "0 20px 40px rgba(1, 11, 64, 0.2)",
    "0 22px 44px rgba(1, 11, 64, 0.25)",
    "0 24px 48px rgba(1, 11, 64, 0.25)",
    "0 26px 52px rgba(1, 11, 64, 0.25)",
    "0 28px 56px rgba(1, 11, 64, 0.3)",
    "0 30px 60px rgba(1, 11, 64, 0.3)",
    "0 32px 64px rgba(1, 11, 64, 0.3)",
    "0 34px 68px rgba(1, 11, 64, 0.35)",
    "0 36px 72px rgba(1, 11, 64, 0.35)",
    "0 38px 76px rgba(1, 11, 64, 0.35)",
    "0 40px 80px rgba(1, 11, 64, 0.4)",
    "0 42px 84px rgba(1, 11, 64, 0.4)",
    "0 44px 88px rgba(1, 11, 64, 0.4)",
    "0 46px 92px rgba(1, 11, 64, 0.45)",
    "0 48px 96px rgba(1, 11, 64, 0.45)",
  ],
});

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CourseProvider>
            <NotificationProvider>
              <CssBaseline />
              <div className="App">
                <Routes>
                  {/* Routes publiques */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/catalog" element={<Catalog />} />

                  {/* Routes d'authentification */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Routes protégées - Étudiant */}
                  <Route
                    path="/student"
                    element={
                      <ProtectedRoute requiredRole="student">
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route
                      index
                      element={<Navigate to="/student/dashboard" />}
                    />
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="courses" element={<MyCourses />} />
                    <Route path="course/:id" element={<CourseView />} />
                    <Route path="progress" element={<Progress />} />
                    <Route path="certificates" element={<Certificates />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="profile" element={<Profile />} />
                  </Route>

                  {/* Routes protégées - Instructeur */}
                  <Route
                    path="/instructor"
                    element={
                      <ProtectedRoute requiredRole="instructor">
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route
                      index
                      element={<Navigate to="/instructor/dashboard" />}
                    />
                    <Route path="dashboard" element={<InstructorDashboard />} />
                    <Route path="courses/create" element={<CreateCourse />} />
                    <Route path="courses/edit/:id" element={<EditCourse />} />
                    <Route path="analytics" element={<StudentAnalytics />} />
                    <Route path="profile" element={<Profile />} />
                  </Route>

                  {/* Routes protégées - Admin */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/admin/dashboard" />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<Users />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="config" element={<SystemConfig />} />
                    <Route path="profile" element={<Profile />} />
                  </Route>

                  {/* Routes d'erreur */}
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/server-error" element={<ServerError />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </NotificationProvider>
          </CourseProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
