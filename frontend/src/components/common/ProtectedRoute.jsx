// frontend/src/components/common/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Roles = {
  STUDENT: "student",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated || !user) {
    console.log("ProtectedRoute: No user or not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (!requiredRole) {
    return children ? children : <Outlet />;
  }

  const userRole = user.role?.toLowerCase();
  const requiredRoleNormalized = requiredRole.toLowerCase();
  const hasRequiredRole = userRole === requiredRoleNormalized;

  if (!hasRequiredRole) {
    console.log(
      `ProtectedRoute: User role ${userRole} does not match required role ${requiredRoleNormalized}`
    );
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;