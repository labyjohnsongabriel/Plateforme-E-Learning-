import React, { Suspense, lazy, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { NotificationProvider } from './context/NotificationContext';

// Lazy-loaded components
const Layout = lazy(() => import('./components/common/Layout'));
const DashboardLayout = lazy(() =>
  import('./components/common/Layout').then((module) => ({ default: module.DashboardLayout }))
);
const LoadingScreen = lazy(() => import('./components/common/Loading'));

// Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Profile = lazy(() => import('./pages/auth/Profile'));

// Public Pages
const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Catalog = lazy(() => import('./pages/public/Catalog'));

// Student Pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const MyCourses = lazy(() => import('./pages/student/MyCourses'));
const CourseView = lazy(() => import('./pages/student/CourseView'));
const CoursePlayer = lazy(() => import('./components/course/CoursePlayer'));
const Progress = lazy(() => import('./pages/student/Progress'));
const Certificates = lazy(() => import('./pages/student/Certificates'));
const Settings = lazy(() => import('./pages/student/Settings'));

// Instructor Pages
const InstructorDashboard = lazy(() => import('./pages/instructor/InstructorDashboard'));
const CreateCourse = lazy(() => import('./pages/instructor/CreateCourse'));
const EditCourse = lazy(() => import('./pages/instructor/EditCourse'));
const StudentAnalytics = lazy(() => import('./pages/instructor/StudentAnalytics'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Users = lazy(() => import('./pages/admin/Users'));
const Courses = lazy(() => import('./pages/admin/Courses'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const SystemConfig = lazy(() => import('./pages/admin/SystemConfig'));

// Error Pages
const NotFound = lazy(() => import('./pages/error/NotFound'));
const Unauthorized = lazy(() => import('./pages/error/Unauthorized'));
const ServerError = lazy(() => import('./pages/error/ServerError'));

// Protected Route Component
const ProtectedRoute = lazy(() => import('./components/common/ProtectedRoute'));

// Theme Context for dark/light mode
const ThemeContext = React.createContext();

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#010b40' : '#1a2d7a',
        light: mode === 'light' ? '#2d3f8f' : '#3d52b8',
        dark: mode === 'light' ? '#000428' : '#0a1554',
        contrastText: '#ffffff',
      },
      secondary: {
        main: mode === 'light' ? '#f13544' : '#ff4757',
        light: mode === 'light' ? '#ff6b74' : '#ff6b7a',
        dark: mode === 'light' ? '#c41e2e' : '#e8374a',
        contrastText: '#ffffff',
      },
      tertiary: {
        main: mode === 'light' ? '#4a90e2' : '#5da5ff',
        light: mode === 'light' ? '#6fa9f5' : '#7db8ff',
        dark: mode === 'light' ? '#2869c7' : '#3d7edb',
      },
      accent: {
        main: mode === 'light' ? '#ff9f43' : '#ffa952',
        light: mode === 'light' ? '#ffb76b' : '#ffbe7a',
        dark: mode === 'light' ? '#ff8615' : '#ff9533',
      },
      background: {
        default: mode === 'light' ? '#f5f7fa' : '#0a0e1a',
        paper: mode === 'light' ? '#ffffff' : '#151b2d',
        elevated: mode === 'light' ? '#ffffff' : '#1e2538',
        gradient: mode === 'light' 
          ? 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf3 100%)'
          : 'linear-gradient(135deg, #0a0e1a 0%, #151b2d 100%)',
      },
      text: {
        primary: mode === 'light' ? '#1a202c' : '#f7fafc',
        secondary: mode === 'light' ? '#4a5568' : '#cbd5e0',
        disabled: mode === 'light' ? '#a0aec0' : '#4a5568',
        hint: mode === 'light' ? '#718096' : '#718096',
      },
      divider: mode === 'light' ? 'rgba(1, 11, 64, 0.08)' : 'rgba(255, 255, 255, 0.08)',
      grey: {
        50: mode === 'light' ? '#f7fafc' : '#1a202c',
        100: mode === 'light' ? '#edf2f7' : '#2d3748',
        200: mode === 'light' ? '#e2e8f0' : '#4a5568',
        300: mode === 'light' ? '#cbd5e0' : '#718096',
        400: mode === 'light' ? '#a0aec0' : '#a0aec0',
        500: mode === 'light' ? '#718096' : '#cbd5e0',
        600: mode === 'light' ? '#4a5568' : '#e2e8f0',
        700: mode === 'light' ? '#2d3748' : '#edf2f7',
        800: mode === 'light' ? '#1a202c' : '#f7fafc',
        900: mode === 'light' ? '#171923' : '#ffffff',
      },
      error: {
        main: mode === 'light' ? '#f13544' : '#ff4757',
        light: mode === 'light' ? '#ff6b74' : '#ff6b7a',
        dark: mode === 'light' ? '#c41e2e' : '#e8374a',
      },
      warning: {
        main: mode === 'light' ? '#ff9f43' : '#ffa952',
        light: mode === 'light' ? '#ffb76b' : '#ffbe7a',
        dark: mode === 'light' ? '#ff8615' : '#ff9533',
      },
      info: {
        main: mode === 'light' ? '#4a90e2' : '#5da5ff',
        light: mode === 'light' ? '#6fa9f5' : '#7db8ff',
        dark: mode === 'light' ? '#2869c7' : '#3d7edb',
      },
      success: {
        main: mode === 'light' ? '#10b981' : '#34d399',
        light: mode === 'light' ? '#6ee7b7' : '#6ee7b7',
        dark: mode === 'light' ? '#059669' : '#10b981',
      },
    },
    typography: {
      fontFamily: '"Inter", "Ubuntu", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
      h1: {
        fontFamily: '"Inter", "Ubuntu", sans-serif',
        fontWeight: 800,
        fontSize: '3rem',
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      },
      h2: {
        fontFamily: '"Inter", "Ubuntu", sans-serif',
        fontWeight: 700,
        fontSize: '2.5rem',
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
      },
      h3: {
        fontFamily: '"Inter", "Ubuntu", sans-serif',
        fontWeight: 700,
        fontSize: '2rem',
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
      },
      h4: {
        fontFamily: '"Inter", "Ubuntu", sans-serif',
        fontWeight: 600,
        fontSize: '1.5rem',
        letterSpacing: '0em',
        lineHeight: 1.4,
      },
      h5: {
        fontFamily: '"Inter", "Ubuntu", sans-serif',
        fontWeight: 600,
        fontSize: '1.25rem',
        letterSpacing: '0em',
        lineHeight: 1.4,
      },
      h6: {
        fontFamily: '"Inter", "Ubuntu", sans-serif',
        fontWeight: 600,
        fontSize: '1.125rem',
        letterSpacing: '0em',
        lineHeight: 1.4,
      },
      body1: {
        fontFamily: '"Inter", "Century Gothic", sans-serif',
        fontSize: '1rem',
        lineHeight: 1.7,
        letterSpacing: '0.00938em',
      },
      body2: {
        fontFamily: '"Inter", "Century Gothic", sans-serif',
        fontSize: '0.875rem',
        lineHeight: 1.7,
        letterSpacing: '0.01071em',
      },
      button: {
        fontFamily: '"Inter", "Ubuntu", sans-serif',
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '0.02857em',
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.66,
        letterSpacing: '0.03333em',
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 600,
        lineHeight: 2.66,
        letterSpacing: '0.08333em',
        textTransform: 'uppercase',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: mode === 'light' ? '#cbd5e0 #f5f7fa' : '#4a5568 #0a0e1a',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 10,
              height: 10,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: mode === 'light' ? '#cbd5e0' : '#4a5568',
              minHeight: 24,
              '&:hover': {
                backgroundColor: mode === 'light' ? '#a0aec0' : '#718096',
              },
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              backgroundColor: mode === 'light' ? '#f5f7fa' : '#0a0e1a',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
            padding: '10px 28px',
            boxShadow: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: mode === 'light'
                ? '0 12px 24px rgba(1, 11, 64, 0.15)'
                : '0 12px 24px rgba(93, 165, 255, 0.2)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          containedPrimary: {
            background: mode === 'light'
              ? 'linear-gradient(135deg, #010b40 0%, #2d3f8f 100%)'
              : 'linear-gradient(135deg, #1a2d7a 0%, #3d52b8 100%)',
            '&:hover': {
              background: mode === 'light'
                ? 'linear-gradient(135deg, #000428 0%, #010b40 100%)'
                : 'linear-gradient(135deg, #0a1554 0%, #1a2d7a 100%)',
            },
          },
          containedSecondary: {
            background: mode === 'light'
              ? 'linear-gradient(135deg, #f13544 0%, #ff6b74 100%)'
              : 'linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%)',
            '&:hover': {
              background: mode === 'light'
                ? 'linear-gradient(135deg, #c41e2e 0%, #f13544 100%)'
                : 'linear-gradient(135deg, #e8374a 0%, #ff4757 100%)',
            },
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
              backgroundColor: mode === 'light' ? 'rgba(1, 11, 64, 0.04)' : 'rgba(93, 165, 255, 0.08)',
            },
          },
          text: {
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(1, 11, 64, 0.04)' : 'rgba(93, 165, 255, 0.08)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: mode === 'light'
              ? '0 4px 24px rgba(1, 11, 64, 0.08)'
              : '0 4px 24px rgba(0, 0, 0, 0.4)',
            border: mode === 'light' ? '1px solid rgba(1, 11, 64, 0.06)' : '1px solid rgba(255, 255, 255, 0.06)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(10px)',
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(21, 27, 45, 0.8)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: mode === 'light'
                ? '0 12px 36px rgba(1, 11, 64, 0.12)'
                : '0 12px 36px rgba(93, 165, 255, 0.15)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? 'rgba(1, 11, 64, 0.95)' : 'rgba(10, 14, 26, 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: mode === 'light'
              ? '0 4px 24px rgba(1, 11, 64, 0.12)'
              : '0 4px 24px rgba(0, 0, 0, 0.3)',
            borderBottom: mode === 'light'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(255, 255, 255, 0.05)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(21, 27, 45, 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderRight: mode === 'light'
              ? '1px solid rgba(1, 11, 64, 0.08)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: mode === 'light'
              ? '4px 0 24px rgba(1, 11, 64, 0.08)'
              : '4px 0 24px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 37, 56, 0.6)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: mode === 'light' ? '#ffffff' : 'rgba(30, 37, 56, 0.8)',
                '& fieldset': {
                  borderColor: mode === 'light' ? '#2d3f8f' : '#5da5ff',
                  borderWidth: 2,
                },
              },
              '&.Mui-focused': {
                backgroundColor: mode === 'light' ? '#ffffff' : 'rgba(30, 37, 56, 0.9)',
                boxShadow: mode === 'light'
                  ? '0 4px 16px rgba(1, 11, 64, 0.1)'
                  : '0 4px 16px rgba(93, 165, 255, 0.15)',
                '& fieldset': {
                  borderColor: mode === 'light' ? '#010b40' : '#5da5ff',
                  borderWidth: 2,
                },
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: mode === 'light' ? '#010b40' : '#5da5ff',
              fontWeight: 600,
            },
            '& .MuiInputBase-input': {
              color: mode === 'light' ? '#1a202c' : '#f7fafc',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            fontWeight: 600,
            fontSize: '0.8125rem',
            height: 32,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          },
          colorPrimary: {
            background: mode === 'light'
              ? 'linear-gradient(135deg, #010b40 0%, #2d3f8f 100%)'
              : 'linear-gradient(135deg, #1a2d7a 0%, #3d52b8 100%)',
            color: '#ffffff',
            boxShadow: mode === 'light'
              ? '0 2px 8px rgba(1, 11, 64, 0.2)'
              : '0 2px 8px rgba(93, 165, 255, 0.3)',
          },
          colorSecondary: {
            background: mode === 'light'
              ? 'linear-gradient(135deg, #f13544 0%, #ff6b74 100%)'
              : 'linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%)',
            color: '#ffffff',
            boxShadow: mode === 'light'
              ? '0 2px 8px rgba(241, 53, 68, 0.3)'
              : '0 2px 8px rgba(255, 71, 87, 0.3)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: mode === 'light'
              ? '0 2px 8px rgba(1, 11, 64, 0.06)'
              : '0 2px 8px rgba(0, 0, 0, 0.3)',
          },
          elevation2: {
            boxShadow: mode === 'light'
              ? '0 4px 16px rgba(1, 11, 64, 0.08)'
              : '0 4px 16px rgba(0, 0, 0, 0.35)',
          },
          elevation4: {
            boxShadow: mode === 'light'
              ? '0 8px 24px rgba(1, 11, 64, 0.1)'
              : '0 8px 24px rgba(0, 0, 0, 0.4)',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            height: 8,
            borderRadius: 8,
            backgroundColor: mode === 'light' ? '#e2e8f0' : '#2d3748',
          },
          bar: {
            borderRadius: 8,
            background: mode === 'light'
              ? 'linear-gradient(90deg, #010b40 0%, #4a90e2 100%)'
              : 'linear-gradient(90deg, #1a2d7a 0%, #5da5ff 100%)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'light' ? 'rgba(1, 11, 64, 0.95)' : 'rgba(93, 165, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 8,
            fontSize: '0.8125rem',
            padding: '8px 12px',
            boxShadow: mode === 'light'
              ? '0 4px 16px rgba(1, 11, 64, 0.2)'
              : '0 4px 16px rgba(93, 165, 255, 0.3)',
          },
          arrow: {
            color: mode === 'light' ? 'rgba(1, 11, 64, 0.95)' : 'rgba(93, 165, 255, 0.95)',
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 52,
            height: 32,
            padding: 0,
          },
          switchBase: {
            padding: 4,
            '&.Mui-checked': {
              transform: 'translateX(20px)',
              '& + .MuiSwitch-track': {
                backgroundColor: mode === 'light' ? '#010b40' : '#5da5ff',
                opacity: 1,
              },
            },
          },
          thumb: {
            width: 24,
            height: 24,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          },
          track: {
            borderRadius: 16,
            backgroundColor: mode === 'light' ? '#cbd5e0' : '#4a5568',
            opacity: 1,
          },
        },
      },
    },
    shape: { borderRadius: 12 },
    shadows: [
      'none',
      mode === 'light' ? '0 2px 4px rgba(1, 11, 64, 0.05)' : '0 2px 4px rgba(0, 0, 0, 0.3)',
      mode === 'light' ? '0 4px 8px rgba(1, 11, 64, 0.06)' : '0 4px 8px rgba(0, 0, 0, 0.35)',
      mode === 'light' ? '0 6px 12px rgba(1, 11, 64, 0.07)' : '0 6px 12px rgba(0, 0, 0, 0.4)',
      mode === 'light' ? '0 8px 16px rgba(1, 11, 64, 0.08)' : '0 8px 16px rgba(0, 0, 0, 0.45)',
      mode === 'light' ? '0 10px 20px rgba(1, 11, 64, 0.09)' : '0 10px 20px rgba(0, 0, 0, 0.5)',
      mode === 'light' ? '0 12px 24px rgba(1, 11, 64, 0.1)' : '0 12px 24px rgba(0, 0, 0, 0.55)',
      mode === 'light' ? '0 14px 28px rgba(1, 11, 64, 0.11)' : '0 14px 28px rgba(0, 0, 0, 0.6)',
      mode === 'light' ? '0 16px 32px rgba(1, 11, 64, 0.12)' : '0 16px 32px rgba(0, 0, 0, 0.65)',
      mode === 'light' ? '0 18px 36px rgba(1, 11, 64, 0.13)' : '0 18px 36px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0 20px 40px rgba(1, 11, 64, 0.14)' : '0 20px 40px rgba(0, 0, 0, 0.75)',
      mode === 'light' ? '0 22px 44px rgba(1, 11, 64, 0.15)' : '0 22px 44px rgba(0, 0, 0, 0.8)',
      mode === 'light' ? '0 24px 48px rgba(1, 11, 64, 0.16)' : '0 24px 48px rgba(0, 0, 0, 0.85)',
      mode === 'light' ? '0 26px 52px rgba(1, 11, 64, 0.17)' : '0 26px 52px rgba(0, 0, 0, 0.9)',
      mode === 'light' ? '0 28px 56px rgba(1, 11, 64, 0.18)' : '0 28px 56px rgba(0, 0, 0, 0.95)',
      mode === 'light' ? '0 30px 60px rgba(1, 11, 64, 0.19)' : '0 30px 60px rgba(0, 0, 0, 1)',
      mode === 'light' ? '0 32px 64px rgba(1, 11, 64, 0.2)' : '0 32px 64px rgba(0, 0, 0, 1)',
      mode === 'light' ? '0 34px 68px rgba(1, 11, 64, 0.21)' : '0 34px 68px rgba(0, 0, 0, 1)',
      mode === 'light' ? '0 36px 72px rgba(1, 11, 64, 0.22)' : '0 36px 72px rgba(0, 0, 0, 1)',
      mode === 'light' ? '0 38px 76px rgba(1, 11, 64, 0.23)' : '0 38px 76px rgba(0, 0, 0, 1)',
      mode === 'light' ? '0 40px 80px rgba(1, 11, 64, 0.24)' : '0 40px 80px rgba(0, 0, 0, 1)',
      mode === 'light' ? '0 42px 84px rgba(1, 11, 64, 0.25)' : '0 42px 84px rgba(0, 0, 0, 1)',
      mode === 'light' ? '0 44px 88px rgba(1, 11, 64, 0.26)' : '0 44px 88px rgba(0, 0, 0, 1)',
      mode === 'light' ? '0 46px 92px rgba(1, 11, 64, 0.27)' : '0 46px 92px rgba(0, 0, 0, 1)',
      mode === 'light' ? '0 48px 96px rgba(1, 11, 64, 0.28)' : '0 48px 96px rgba(0, 0, 0, 1)',
    ],
  });

function App() {
  const [mode, setMode] = useState('dark');
  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <Router>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <CourseProvider>
              <NotificationProvider>
                <CssBaseline />
                <Suspense fallback={<LoadingScreen />}>
                  <main role='main' aria-label="Contenu principal de l'application">
                    <Routes>
                      {/* Routes publiques */}
                      <Route
                        path='/'
                        element={
                          <Layout>
                            <Home />
                          </Layout>
                        }
                      />
                      <Route
                        path='/about'
                        element={
                          <Layout>
                            <About />
                          </Layout>
                        }
                      />
                      <Route
                        path='/contact'
                        element={
                          <Layout>
                            <Contact />
                          </Layout>
                        }
                      />
                      <Route
                        path='/catalog'
                        element={
                          <Layout>
                            <Catalog />
                          </Layout>
                        }
                      />

                      {/* Routes d'authentification */}
                      <Route
                        path='/login'
                        element={
                          <Layout>
                            <Login />
                          </Layout>
                        }
                      />
                      <Route
                        path='/register'
                        element={
                          <Layout>
                            <Register />
                          </Layout>
                        }
                      />
                      <Route
                        path='/forgot-password'
                        element={
                          <Layout>
                            <ForgotPassword />
                          </Layout>
                        }
                      />

                      {/* Routes protégées - Étudiant */}
                      <Route
                        path='/student'
                        element={
                          <ProtectedRoute requiredRole='etudiant'>
                            <DashboardLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<Navigate to='/student/dashboard' replace />} />
                        <Route path='dashboard' element={<StudentDashboard />} />
                        <Route path='courses' element={<MyCourses />} />
                        <Route path='course/:id' element={<CourseView />} />
                        <Route path='learn/:courseId' element={<CourseView />} />
                        {/* CORRECTION : Ajout de la route pour les modules */}
                        <Route path='learn/:courseId/module/:moduleId' element={<CoursePlayer />} />
                        <Route path='progress' element={<Progress />} />
                        <Route path='progress/:id' element={<Progress />} />
                        <Route path='certificates' element={<Certificates />} />
                        <Route path='settings' element={<Settings />} />
                        <Route path='profil' element={<Profile />} />
                      </Route>

                      {/* Routes protégées - Instructeur */}
                      <Route
                        path='/instructor'
                        element={
                          <ProtectedRoute requiredRole='enseignant'>
                            <DashboardLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<Navigate to='/instructor/dashboard' replace />} />
                        <Route path='dashboard' element={<InstructorDashboard />} />
                        <Route path='courses/create' element={<CreateCourse />} />
                        <Route path='courses/edit/:id' element={<EditCourse />} />
                        <Route path='analytics' element={<StudentAnalytics />} />
                        <Route path='profil' element={<Profile />} />
                      </Route>

                      {/* Routes protégées - Admin */}
                      <Route
                        path='/admin'
                        element={
                          <ProtectedRoute requiredRole='admin'>
                            <DashboardLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<Navigate to='/admin/dashboard' replace />} />
                        <Route path='dashboard' element={<AdminDashboard />} />
                        <Route path='users' element={<Users />} />
                        <Route path='courses' element={<Courses />} />
                        <Route path='reports' element={<Reports />} />
                        <Route path='config' element={<SystemConfig />} />
                        <Route path='profil' element={<Profile />} />
                      </Route>

                      {/* Routes d'erreur */}
                      <Route
                        path='/unauthorized'
                        element={
                          <Layout>
                            <Unauthorized />
                          </Layout>
                        }
                      />
                      <Route
                        path='/server-error'
                        element={
                          <Layout>
                            <ServerError />
                          </Layout>
                        }
                      />
                      <Route
                        path='*'
                        element={
                          <Layout>
                            <NotFound />
                          </Layout>
                        }
                      />
                    </Routes>
                  </main>
                </Suspense>
              </NotificationProvider>
            </CourseProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ThemeContext.Provider>
  );
}

export { ThemeContext };
export default App;