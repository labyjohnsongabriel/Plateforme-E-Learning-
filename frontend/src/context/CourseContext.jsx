// src/context/CourseContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import {
  Backdrop,
  CircularProgress,
  Alert,
  Snackbar,
  Typography,
} from "@mui/material";

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

  // Fetch courses from localStorage or API on mount
  useEffect(() => {
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
  }, []);

  /**
   * Fetch courses from the API
   */
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/courses", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors du chargement des cours"
        );
      }

      const data = await response.json();
      setCourses(data);
      localStorage.setItem("courses", JSON.stringify(data));
    } catch (err) {
      setError(err.message || "Erreur serveur");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add a new course
   * @param {Object} course - Course data (e.g., title, description, instructorId)
   */
  const addCourse = useCallback(async (course) => {
    setIsLoading(true);
    setError(null);
    try {
      const newCourse = {
        ...course,
        id: crypto.randomUUID(), // Generate ID client-side for optimistic update
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      setCourses((prev) => {
        const updatedCourses = [...prev, newCourse];
        localStorage.setItem("courses", JSON.stringify(updatedCourses));
        return updatedCourses;
      });

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout du cours");
      }

      const savedCourse = await response.json();
      setCourses((prev) => {
        const updatedCourses = prev.map((c) =>
          c.id === newCourse.id ? savedCourse : c
        );
        localStorage.setItem("courses", JSON.stringify(updatedCourses));
        return updatedCourses;
      });
    } catch (err) {
      setError(err.message || "Erreur serveur");
      setCourses((prev) => {
        const updatedCourses = prev.filter((c) => c.id !== newCourse.id);
        localStorage.setItem("courses", JSON.stringify(updatedCourses));
        return updatedCourses;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update an existing course
   * @param {string} id - Course ID
   * @param {Object} updates - Course data to update (e.g., title, description)
   */
  const updateCourse = useCallback(async (id, updates) => {
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

      const response = await fetch(`/api/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la mise à jour du cours"
        );
      }

      const updatedCourse = await response.json();
      setCourses((prev) => {
        const updatedCourses = prev.map((c) =>
          c.id === id ? updatedCourse : c
        );
        localStorage.setItem("courses", JSON.stringify(updatedCourses));
        return updatedCourses;
      });
    } catch (err) {
      setError(err.message || "Erreur serveur");
      // Rollback optimistic update
      setCourses((prev) => {
        const updatedCourses = prev.map((c) => (c.id === id ? { ...c } : c));
        localStorage.setItem("courses", JSON.stringify(updatedCourses));
        return updatedCourses;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a course
   * @param {string} id - Course ID
   */
  const deleteCourse = useCallback(
    async (id) => {
      setIsLoading(true);
      setError(null);
      try {
        // Optimistic update
        setCourses((prev) => {
          const updatedCourses = prev.filter((c) => c.id !== id);
          localStorage.setItem("courses", JSON.stringify(updatedCourses));
          return updatedCourses;
        });

        const response = await fetch(`/api/courses/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Erreur lors de la suppression du cours"
          );
        }
      } catch (err) {
        setError(err.message || "Erreur serveur");
        // Rollback by refetching courses
        fetchCourses();
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCourses]
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
        }}
      >
        <CircularProgress color="inherit" size={40} />
        <Typography
          variant="h6"
          sx={{ mt: 2, fontFamily: "Ubuntu, sans-serif" }}
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
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </CourseContext.Provider>
  );
};
