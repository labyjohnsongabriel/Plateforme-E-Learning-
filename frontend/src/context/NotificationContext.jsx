// src/context/NotificationContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";

/**
 * NotificationContext for managing user notifications
 * @type {Object}
 * @property {Array} notifications - Array of notification objects
 * @property {Function} fetchNotifications - Fetch notifications from API
 * @property {Function} addNotification - Add a new notification
 * @property {Function} markAsRead - Mark a notification as read
 * @property {Function} markAllAsRead - Mark all notifications as read
 * @property {Function} clearNotifications - Clear all notifications
 * @property {number} unreadCount - Number of unread notifications
 * @property {boolean} isLoading - Whether a notification operation is in progress
 * @property {string|null} error - Error message, if any
 */
export const NotificationContext = createContext({
  notifications: [],
  fetchNotifications: async () => {},
  addNotification: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearNotifications: async () => {},
  unreadCount: 0,
  isLoading: false,
  error: null,
});

/**
 * NotificationProvider component to wrap the application and provide notification context
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate unread notifications count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Fetch notifications from localStorage or API on mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch (err) {
        console.error("Failed to parse stored notifications:", err);
        localStorage.removeItem("notifications");
      }
    }
    fetchNotifications();
  }, []);

  /**
   * Fetch notifications from the API
   */
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des notifications");
      }

      const data = await response.json();
      setNotifications(data);
      localStorage.setItem("notifications", JSON.stringify(data));
    } catch (err) {
      setError(err.message || "Erreur serveur");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add a new notification
   * @param {Object} notification - Notification data without id or createdAt
   */
  const addNotification = useCallback(async (notification) => {
    setIsLoading(true);
    setError(null);
    try {
      const newNotification = {
        ...notification,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      setNotifications((prev) => {
        const updatedNotifications = [...prev, newNotification];
        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
        return updatedNotifications;
      });

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotification),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de la notification");
      }

      const savedNotification = await response.json();
      setNotifications((prev) => {
        const updatedNotifications = prev.map((n) =>
          n.id === newNotification.id ? savedNotification : n
        );
        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
        return updatedNotifications;
      });
    } catch (err) {
      setError(err.message || "Erreur serveur");
      setNotifications((prev) => {
        const updatedNotifications = prev.filter(
          (n) => n.id !== newNotification.id
        );
        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
        return updatedNotifications;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Mark a notification as read
   * @param {string} id - Notification ID
   */
  const markAsRead = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      setNotifications((prev) => {
        const updatedNotifications = prev.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
        return updatedNotifications;
      });

      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la notification");
      }
    } catch (err) {
      setError(err.message || "Erreur serveur");
      setNotifications((prev) => {
        const updatedNotifications = prev.map((n) =>
          n.id === id ? { ...n, isRead: false } : n
        );
        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
        return updatedNotifications;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setNotifications((prev) => {
        const updatedNotifications = prev.map((n) => ({ ...n, isRead: true }));
        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
        return updatedNotifications;
      });

      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour des notifications");
      }
    } catch (err) {
      setError(err.message || "Erreur serveur");
      setNotifications((prev) => {
        const updatedNotifications = prev.map((n) => ({
          ...n,
          isRead: n.isRead,
        }));
        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
        return updatedNotifications;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setNotifications([]);
      localStorage.removeItem("notifications");

      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression des notifications");
      }
    } catch (err) {
      setError(err.message || "Erreur serveur");
      fetchNotifications();
    } finally {
      setIsLoading(false);
    }
  }, [fetchNotifications]);

  const contextValue = {
    notifications,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount,
    isLoading,
    error,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-primary-main/90 z-[9999] flex items-center justify-center">
          <div className="text-center">
            <svg
              className="animate-spin h-10 w-10 text-secondary-main mb-4"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="#f13544"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="#f13544"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <h3 className="text-white text-xl font-ubuntu">
              Chargement des notifications...
            </h3>
          </div>
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 right-4 bg-error-main text-white p-4 rounded-lg shadow-lg">
          <p>{error}</p>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
