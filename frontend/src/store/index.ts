// Store principal utilisant Zustand pour la gestion d'état
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'instructor' | 'student';
    avatar?: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    instructor: {
        id: string;
        name: string;
        avatar?: string;
    };
    thumbnail?: string;
    category: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: number; // en minutes
    price: number;
    rating: number;
    studentsCount: number;
    isEnrolled?: boolean;
    progress?: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    metadata?: Record<string, any>;
}

// Interface du store principal
interface AppStore {
    // État d'authentification
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // État des cours
    courses: Course[];
    enrolledCourses: Course[];
    currentCourse: Course | null;

    // État des notifications
    notifications: Notification[];
    unreadNotificationsCount: number;

    // État de l'interface utilisateur
    theme: 'light' | 'dark';
    sidebarOpen: boolean;

    // Actions d'authentification
    setUser: (user: User | null) => void;
    setAuthenticated: (isAuthenticated: boolean) => void;
    setLoading: (isLoading: boolean) => void;
    logout: () => void;

    // Actions des cours
    setCourses: (courses: Course[]) => void;
    setEnrolledCourses: (courses: Course[]) => void;
    setCurrentCourse: (course: Course | null) => void;
    addCourse: (course: Course) => void;
    updateCourse: (courseId: string, updates: Partial<Course>) => void;
    removeCourse: (courseId: string) => void;
    enrollInCourse: (courseId: string) => void;
    unenrollFromCourse: (courseId: string) => void;

    // Actions des notifications
    setNotifications: (notifications: Notification[]) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
    markNotificationAsRead: (notificationId: string) => void;
    markAllNotificationsAsRead: () => void;
    removeNotification: (notificationId: string) => void;

    // Actions de l'interface utilisateur
    setTheme: (theme: 'light' | 'dark') => void;
    toggleTheme: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;

    // Actions utilitaires
    reset: () => void;
}

// État initial
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    courses: [],
    enrolledCourses: [],
    currentCourse: null,
    notifications: [],
    unreadNotificationsCount: 0,
    theme: 'light' as const,
    sidebarOpen: true,
};

// Création du store avec middleware
export const useAppStore = create<AppStore>()(
    devtools(
        persist(
            subscribeWithSelector(
                immer((set, get) => ({
                    ...initialState,

                    // Actions d'authentification
                    setUser: (user) =>
                        set((state) => {
                            state.user = user;
                            state.isAuthenticated = !!user;
                        }),

                    setAuthenticated: (isAuthenticated) =>
                        set((state) => {
                            state.isAuthenticated = isAuthenticated;
                        }),

                    setLoading: (isLoading) =>
                        set((state) => {
                            state.isLoading = isLoading;
                        }),

                    logout: () =>
                        set((state) => {
                            state.user = null;
                            state.isAuthenticated = false;
                            state.enrolledCourses = [];
                            state.currentCourse = null;
                            state.notifications = [];
                            state.unreadNotificationsCount = 0;
                        }),

                    // Actions des cours
                    setCourses: (courses) =>
                        set((state) => {
                            state.courses = courses;
                        }),

                    setEnrolledCourses: (courses) =>
                        set((state) => {
                            state.enrolledCourses = courses;
                        }),

                    setCurrentCourse: (course) =>
                        set((state) => {
                            state.currentCourse = course;
                        }),

                    addCourse: (course) =>
                        set((state) => {
                            state.courses.push(course);
                        }),

                    updateCourse: (courseId, updates) =>
                        set((state) => {
                            const courseIndex = state.courses.findIndex((c) => c.id === courseId);
                            if (courseIndex !== -1) {
                                Object.assign(state.courses[courseIndex], updates);
                            }

                            const enrolledIndex = state.enrolledCourses.findIndex((c) => c.id === courseId);
                            if (enrolledIndex !== -1) {
                                Object.assign(state.enrolledCourses[enrolledIndex], updates);
                            }

                            if (state.currentCourse?.id === courseId) {
                                Object.assign(state.currentCourse, updates);
                            }
                        }),

                    removeCourse: (courseId) =>
                        set((state) => {
                            state.courses = state.courses.filter((c) => c.id !== courseId);
                            state.enrolledCourses = state.enrolledCourses.filter((c) => c.id !== courseId);
                            if (state.currentCourse?.id === courseId) {
                                state.currentCourse = null;
                            }
                        }),

                    enrollInCourse: (courseId) =>
                        set((state) => {
                            const course = state.courses.find((c) => c.id === courseId);
                            if (course && !state.enrolledCourses.find((c) => c.id === courseId)) {
                                state.enrolledCourses.push({ ...course, isEnrolled: true, progress: 0 });
                                // Mettre à jour le cours dans la liste principale
                                const courseIndex = state.courses.findIndex((c) => c.id === courseId);
                                if (courseIndex !== -1) {
                                    state.courses[courseIndex].isEnrolled = true;
                                    state.courses[courseIndex].studentsCount += 1;
                                }
                            }
                        }),

                    unenrollFromCourse: (courseId) =>
                        set((state) => {
                            state.enrolledCourses = state.enrolledCourses.filter((c) => c.id !== courseId);
                            // Mettre à jour le cours dans la liste principale
                            const courseIndex = state.courses.findIndex((c) => c.id === courseId);
                            if (courseIndex !== -1) {
                                state.courses[courseIndex].isEnrolled = false;
                                state.courses[courseIndex].studentsCount = Math.max(0, state.courses[courseIndex].studentsCount - 1);
                            }
                        }),

                    // Actions des notifications
                    setNotifications: (notifications) =>
                        set((state) => {
                            state.notifications = notifications;
                            state.unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
                        }),

                    addNotification: (notification) =>
                        set((state) => {
                            const newNotification: Notification = {
                                ...notification,
                                id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                createdAt: new Date().toISOString(),
                                isRead: false,
                            };
                            state.notifications.unshift(newNotification);
                            state.unreadNotificationsCount += 1;
                        }),

                    markNotificationAsRead: (notificationId) =>
                        set((state) => {
                            const notification = state.notifications.find((n) => n.id === notificationId);
                            if (notification && !notification.isRead) {
                                notification.isRead = true;
                                state.unreadNotificationsCount = Math.max(0, state.unreadNotificationsCount - 1);
                            }
                        }),

                    markAllNotificationsAsRead: () =>
                        set((state) => {
                            state.notifications.forEach((notification) => {
                                notification.isRead = true;
                            });
                            state.unreadNotificationsCount = 0;
                        }),

                    removeNotification: (notificationId) =>
                        set((state) => {
                            const notificationIndex = state.notifications.findIndex((n) => n.id === notificationId);
                            if (notificationIndex !== -1) {
                                const notification = state.notifications[notificationIndex];
                                if (!notification.isRead) {
                                    state.unreadNotificationsCount = Math.max(0, state.unreadNotificationsCount - 1);
                                }
                                state.notifications.splice(notificationIndex, 1);
                            }
                        }),

                    // Actions de l'interface utilisateur
                    setTheme: (theme) =>
                        set((state) => {
                            state.theme = theme;
                        }),

                    toggleTheme: () =>
                        set((state) => {
                            state.theme = state.theme === 'light' ? 'dark' : 'light';
                        }),

                    setSidebarOpen: (open) =>
                        set((state) => {
                            state.sidebarOpen = open;
                        }),

                    toggleSidebar: () =>
                        set((state) => {
                            state.sidebarOpen = !state.sidebarOpen;
                        }),

                    // Action de réinitialisation
                    reset: () =>
                        set((state) => {
                            Object.assign(state, initialState);
                        }),
                }))
            ),
            {
                name: 'elearning-app-store',
                partialize: (state) => ({
                    user: state.user,
                    isAuthenticated: state.isAuthenticated,
                    theme: state.theme,
                    sidebarOpen: state.sidebarOpen,
                }),
            }
        ),
        {
            name: 'elearning-app-store',
        }
    )
);

// Sélecteurs pour optimiser les re-rendus
export const useAuth = () => useAppStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    setUser: state.setUser,
    setAuthenticated: state.setAuthenticated,
    setLoading: state.setLoading,
    logout: state.logout,
}));

export const useCourses = () => useAppStore((state) => ({
    courses: state.courses,
    enrolledCourses: state.enrolledCourses,
    currentCourse: state.currentCourse,
    setCourses: state.setCourses,
    setEnrolledCourses: state.setEnrolledCourses,
    setCurrentCourse: state.setCurrentCourse,
    addCourse: state.addCourse,
    updateCourse: state.updateCourse,
    removeCourse: state.removeCourse,
    enrollInCourse: state.enrollInCourse,
    unenrollFromCourse: state.unenrollFromCourse,
}));

export const useNotifications = () => useAppStore((state) => ({
    notifications: state.notifications,
    unreadNotificationsCount: state.unreadNotificationsCount,
    setNotifications: state.setNotifications,
    addNotification: state.addNotification,
    markNotificationAsRead: state.markNotificationAsRead,
    markAllNotificationsAsRead: state.markAllNotificationsAsRead,
    removeNotification: state.removeNotification,
}));

export const useUI = () => useAppStore((state) => ({
    theme: state.theme,
    sidebarOpen: state.sidebarOpen,
    setTheme: state.setTheme,
    toggleTheme: state.toggleTheme,
    setSidebarOpen: state.setSidebarOpen,
    toggleSidebar: state.toggleSidebar,
}));

// Hook pour surveiller les changements d'authentification
export const useAuthSubscription = (callback: (isAuthenticated: boolean) => void) => {
    return useAppStore.subscribe(
        (state) => state.isAuthenticated,
        callback
    );
};

// Hook pour surveiller les nouvelles notifications
export const useNotificationSubscription = (callback: (count: number) => void) => {
    return useAppStore.subscribe(
        (state) => state.unreadNotificationsCount,
        callback
    );
};

export default useAppStore;
