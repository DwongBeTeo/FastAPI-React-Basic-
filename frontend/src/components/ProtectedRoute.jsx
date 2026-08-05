// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LoaderCircle } from 'lucide-react';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
                <LoaderCircle className="animate-spin w-10 h-10 text-purple-600"/>
        </div>; 
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.warn("Bạn không có quyền truy cập trang này!");
        return <Navigate to="/login" replace />; 
    }

    return <Outlet />;
};

export default ProtectedRoute;