import React, { Suspense, lazy, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { NotificationProvider } from './context/NotificationContext';


const Layout = lazy(() => import('./components/common/Layout'));
const DashboardLayout = lazy(() => import('./components/common/Layout')); 
const LoadingScreen = lazy(() => import('./components/common/Loading'));

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Profile = lazy(() => import('./pages/auth/Profile'));

const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Catalog = lazy(() => import('./pages/public/Catalog'));


const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const MyCourses = lazy(() => import('./pages/student/MyCourses'));
const CourseView = lazy(() => import('./pages/student/CourseView'));
const CoursePlayer = lazy(() => import('./components/course/CoursePlayer'));
const Progress = lazy(() => import('./pages/student/Progress'));
const Certificates = lazy(() => import('./pages/student/Certificates'));
const Settings = lazy(() => import('./pages/student/Settings'));


const InstructorDashboard = lazy(() => import('./pages/instructor/InstructorDashboard'));
const CreateCourse = lazy(() => import('./pages/instructor/CreateCourse'));
const EditCourse = lazy(() => import('./pages/instructor/EditCourse'));
const StudentAnalytics = lazy(() => import('./pages/instructor/StudentAnalytics'));
const ManageCourses = lazy(() => import('./pages/instructor/ManageCourses')); // Corrigé


const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Users = lazy(() => import('./pages/admin/Users'));
const Courses = lazy(() => import('./pages/admin/Courses'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const SystemConfig = lazy(() => import('./pages/admin/SystemConfig'));


const NotFound = lazy(() => import('./pages/error/NotFound'));
const Unauthorized = lazy(() => import('./pages/error/Unauthorized'));
const ServerError = lazy(() => import('./pages/error/ServerError'));


const ProtectedRoute = lazy(() => import('./components/common/ProtectedRoute'));


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
    // ... (le reste de la configuration du thème reste inchangé)
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
                  <main role='main' aria-label="Contenu principal de la plateforme d'apprentissage">
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
                        <Route
                          path='learn/:courseId/contenu/:contenuId'
                          element={<CoursePlayer />}
                        />
                        <Route path='progress' element={<Progress />} />
                        <Route path='progress/:id' element={<Progress />} />
                        <Route path='certificates' element={<Certificates />} />
                        <Route path='settings' element={<Settings />} />
                        <Route path='profil' element={<Profile role='etudiant' />} />
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
                        <Route path='manageCourses' element={<ManageCourses />} />
                        <Route path='courses/create' element={<CreateCourse />} />
                        <Route path='courses/edit/:id' element={<EditCourse />} />
                        <Route path='analytics' element={<StudentAnalytics />} />
                        <Route path='profil' element={<Profile role='enseignant' />} />
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
                        <Route path='profil' element={<Profile role='admin' />} />
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