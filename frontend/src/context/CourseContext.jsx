// frontend/src/context/CourseContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import {
  Backdrop,
  CircularProgress,
  Alert,
  Snackbar,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

// Role constants for frontend consistency
const Roles = {
  STUDENT: "student",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
};

/**
 * CourseContext for managing courses in the e-learning platform
 * @type {Object}
 * @property {Array} courses - Array of course objects
 * @property {Function} fetchCourses - Fetch courses from API
 * @property {Function} addCourse - Add a new course
 * @property {Function} updateCourse - Update an existing course
 * @property {Function} deleteCourse - Delete a course
 * @property {boolean} isLoading - Whether a course operation is in progress
 * @property {string|null} error - Error message, if any
 */
export const CourseContext = createContext({
  courses: [],
  fetchCourses: async () => {},
  addCourse: async () => {},
  updateCourse: async () => {},
  deleteCourse: async () => {},
  isLoading: false,
  error: null,
});

/**
 * CourseProvider component to wrap the application and provide course context
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components
 */
export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  /**
   * Fetch courses from the API
   */
  const fetchCourses = useCallback(async () => {
    if (!user || !user.token || user.role === Roles.STUDENT) {
      console.log("No user, token, or student role, skipping courses fetch");
      setCourses([]);
      localStorage.setItem("courses", JSON.stringify([]));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/courses`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        validateStatus: (status) => status < 500,
        params: { role: user.role },
      });

      console.log("Courses response:", response.data, "Status:", response.status);
      if (response.headers["content-type"].includes("application/json")) {
        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setCourses(data);
        localStorage.setItem("courses", JSON.stringify(data));
      } else {
        throw new Error("Réponse serveur non-JSON");
      }
    } catch (err) {
      console.error("Fetch courses error:", err);
      let errorMessage;
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = "Session expirée, veuillez vous reconnecter";
            navigate("/login");
            break;
          case 403:
            errorMessage = "Accès non autorisé aux cours pour ce rôle";
            setCourses([]);
            localStorage.setItem("courses", JSON.stringify([]));
            break;
          case 404:
            errorMessage = "Service de cours non disponible";
            break;
          default:
            errorMessage =
              err.response.data?.message ||
              "Erreur lors du chargement des cours";
        }
      } else {
        errorMessage = "Impossible de se connecter au serveur";
      }
      setError(errorMessage);
      setCourses([]);
      localStorage.setItem("courses", JSON.stringify([]));
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate, API_BASE_URL]);

  // Fetch courses from localStorage or API only when user is authenticated
  useEffect(() => {
    if (!user || !user.token) {
      console.log("No user or token, skipping initial courses fetch");
      setCourses([]);
      localStorage.setItem("courses", JSON.stringify([]));
      return;
    }

    const storedCourses = localStorage.getItem("courses");
    if (storedCourses) {
      try {
        setCourses(JSON.parse(storedCourses));
      } catch (err) {
        console.error("Failed to parse stored courses:", err);
        localStorage.removeItem("courses");
      }
    }
    fetchCourses();
  }, [user, fetchCourses]);

  /**
   * Add a new course
   * @param {Object} course - Course data (e.g., title, description, instructorId)
   */
  const addCourse = useCallback(
    async (course) => {
      if (!user || !user.token || user.role !== Roles.INSTRUCTOR) {
        setError(
          "Vous devez être connecté et avoir le rôle d'instructeur pour ajouter un cours"
        );
        if (user?.role !== Roles.INSTRUCTOR) {
          navigate("/unauthorized");
        } else {
          navigate("/login");
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      const newCourse = {
        ...course,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };

      try {
        // Optimistic update
        setCourses((prev) => {
          const updatedCourses = [...prev, newCourse];
          localStorage.setItem("courses", JSON.stringify(updatedCourses));
          return updatedCourses;
        });

        const response = await axios.post(`${API_BASE_URL}/api/courses`, newCourse, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });

        const savedCourse = response.data.data || response.data;
        setCourses((prev) => {
          const updatedCourses = prev.map((c) =>
            c.id === newCourse.id ? savedCourse : c
          );
          localStorage.setItem("courses", JSON.stringify(updatedCourses));
          return updatedCourses;
        });
      } catch (err) {
        console.error("Add course error:", err);
        let errorMessage;
        if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = "Session expirée, veuillez vous reconnecter";
              navigate("/login");
              break;
            case 403:
              errorMessage = "Accès non autorisé pour ajouter un cours";
              navigate("/unauthorized");
              break;
            default:
              errorMessage =
                err.response.data?.message || "Erreur lors de l'ajout du cours";
          }
        } else {
          errorMessage = "Impossible de se connecter au serveur";
        }
        setError(errorMessage);
        setCourses((prev) => {
          const updatedCourses = prev.filter((c) => c.id !== newCourse.id);
          localStorage.setItem("courses", JSON.stringify(updatedCourses));
          return updatedCourses;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [user, navigate, API_BASE_URL]
  );

  /**
   * Update an existing course
   * @param {string} id - Course ID
   * @param {Object} updates - Course data to update (e.g., title, description)
   */
  const updateCourse = useCallback(
    async (id, updates) => {
      if (!user || !user.token || user.role !== Roles.INSTRUCTOR) {
        setError(
          "Vous devez être connecté et avoir le rôle d'instructeur pour modifier un cours"
        );
        if (user?.role !== Roles.INSTRUCTOR) {
          navigate("/unauthorized");
        } else {
          navigate("/login");
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Optimistic update
        setCourses((prev) => {
          const updatedCourses = prev.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          );
          localStorage.setItem("courses", JSON.stringify(updatedCourses));
          return updatedCourses;
        });

        const response = await axios.patch(`${API_BASE_URL}/api/courses/${id}`, updates, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });

        const updatedCourse = response.data.data || response.data;
        setCourses((prev) => {
          const updatedCourses = prev.map((c) =>
            c.id === id ? updatedCourse : c
          );
          localStorage.setItem("courses", JSON.stringify(updatedCourses));
          return updatedCourses;
        });
      } catch (err) {
        console.error("Update course error:", err);
        let errorMessage;
        if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = "Session expirée, veuillez vous reconnecter";
              navigate("/login");
              break;
            case 403:
              errorMessage = "Accès non autorisé pour modifier un cours";
              navigate("/unauthorized");
              break;
            default:
              errorMessage =
                err.response.data?.message ||
                "Erreur lors de la mise à jour du cours";
          }
        } else {
          errorMessage = "Impossible de se connecter au serveur";
        }
        setError(errorMessage);
        setCourses((prev) => {
          const updatedCourses = prev.map((c) => (c.id === id ? { ...c } : c));
          localStorage.setItem("courses", JSON.stringify(updatedCourses));
          return updatedCourses;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [user, navigate, API_BASE_URL]
  );

  /**
   * Delete a course
   * @param {string} id - Course ID
   */
  const deleteCourse = useCallback(
    async (id) => {
      if (!user || !user.token || user.role !== Roles.INSTRUCTOR) {
        setError(
          "Vous devez être connecté et avoir le rôle d'instructeur pour supprimer un cours"
        );
        if (user?.role !== Roles.INSTRUCTOR) {
          navigate("/unauthorized");
        } else {
          navigate("/login");
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Optimistic update
        setCourses((prev) => {
          const updatedCourses = prev.filter((c) => c.id !== id);
          localStorage.setItem("courses", JSON.stringify(updatedCourses));
          return updatedCourses;
        });

        const response = await axios.delete(`${API_BASE_URL}/api/courses/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (response.status !== 204 && response.status !== 200) {
          throw new Error("Erreur lors de la suppression du cours");
        }
      } catch (err) {
        console.error("Delete course error:", err);
        let errorMessage;
        if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = "Session expirée, veuillez vous reconnecter";
              navigate("/login");
              break;
            case 403:
              errorMessage = "Accès non autorisé pour supprimer un cours";
              navigate("/unauthorized");
              break;
            default:
              errorMessage =
                err.response.data?.message ||
                "Erreur lors de la suppression du cours";
          }
        } else {
          errorMessage = "Impossible de se connecter au serveur";
        }
        setError(errorMessage);
        fetchCourses();
      } finally {
        setIsLoading(false);
      }
    },
    [user, fetchCourses, navigate, API_BASE_URL]
  );

  const contextValue = {
    courses,
    fetchCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    isLoading,
    error,
  };

  return (
    <CourseContext.Provider value={contextValue}>
      {children}
      <Backdrop
        open={isLoading}
        sx={{
          zIndex: 9999,
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #010b40 0%, #1a237e 100%)",
        }}
      >
        <img
          src="/assets/images/Youth Computing.png"
          alt="Youth Computing Logo"
          style={{ width: "100px", height: "100px", marginBottom: "20px" }}
        />
        <CircularProgress
          color="inherit"
          size={40}
          thickness={5}
          sx={{ "& .MuiCircularProgress-circle": { strokeLinecap: "round" } }}
        />
        <Typography
          variant="h6"
          sx={{ mt: 2, fontFamily: "Ubuntu, sans-serif", fontWeight: 500 }}
        >
          Chargement des cours...
        </Typography>
      </Backdrop>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ width: "100%", maxWidth: "600px" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </CourseContext.Provider>
  );
};