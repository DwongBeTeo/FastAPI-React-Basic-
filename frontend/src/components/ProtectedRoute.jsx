// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
                <LoaderCircle className="animate-spin w-10 h-10 text-purple-600"/>
        </div>; 
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.warn("Bạn không có quyền truy cập trang này!");
        return <Navigate to="/" replace />; 
    }

    return <Outlet />;
};

export default ProtectedRoute;