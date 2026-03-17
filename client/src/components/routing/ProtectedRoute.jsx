import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isAuthenticated } = useAuth();

    // Not logged in at all
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Checking roles if required
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // Logged in but doesn't have the right role - redirect to their respective dashboard
        if (user?.role === 'admin') {
            return <Navigate to="/admin" replace />;
        } else if (user?.role === 'seller') {
            return <Navigate to="/seller/dashboard" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // Authorized
    return children;
};

export default ProtectedRoute;
