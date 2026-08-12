// src/pages/NotFound.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                <div className="bg-red-50 p-6 rounded-full inline-flex mb-8 border border-red-100 shadow-sm">
                    <ShieldAlert className="h-16 w-16 text-red-500" />
                </div>
                
                <h1 className="text-7xl font-extrabold text-gray-900 tracking-tight mb-2">404</h1>
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Access Denied</h2>
                
                <p className="mt-4 text-gray-500 text-sm sm:text-base">
                    Sorry, the page you are looking for does not exist or you <b>do not have permission</b> to access this area.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    {/* <button
                        onClick={() => navigate(-1)} // Go back to the previous page
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={18} /> Go back
                    </button> */}
                    
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Home size={18} /> Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;