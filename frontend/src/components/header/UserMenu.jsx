// src/components/header/UserMenu.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import AuthContext from '../../context/AuthContext';

const UserMenu = () => {
    const { user, logout } = useContext(AuthContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropDownRef = useRef(null);

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
    };

    // Xử lý click outside để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    return (
        <div className="relative" ref={dropDownRef}>
            {/* LUÔN HIỂN THỊ ICON HÌNH TRÒN */}
            <button 
                onClick={() => setShowDropdown(!showDropdown)} 
                className="flex items-center justify-center size-10 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 border border-gray-200 shadow-sm"
            >
                <span className="material-symbols-outlined">account_circle</span>
            </button>

            {/* NỘI DUNG DROPDOWN */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden transition-all">
                    {user ? (
                        /* --- TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP --- */
                        <>
                            {/* Thông tin user vắn tắt */}
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 mb-1">
                                <p className="text-sm font-semibold text-gray-900 truncate">Hello, {user.username}</p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">Role: {user.role}</p>
                            </div>

                            {/* Menu cá nhân */}
                            <div className="py-1 border-b border-gray-100">
                                <NavLink 
                                    to="/my-profile" 
                                    onClick={() => setShowDropdown(false)}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    <span>User Info</span>
                                </NavLink>
                            </div>

                            {/* Requests Accepted, History requests */}
                            <div className="py-1 border-b border-gray-100">
                                <NavLink 
                                    to="/my-dashboard" 
                                    onClick={() => setShowDropdown(false)}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Requests access & Accepted</span>
                                </NavLink>
                            </div>

                            {/* Đăng xuất */}
                            <div className="py-1 mt-1">
                                <button 
                                    onClick={handleLogout} 
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        /* --- TRƯỜNG HỢP CHƯA ĐĂNG NHẬP --- */
                        <div className="p-4 flex flex-col gap-4">
                            <div className="text-center">
                                <p className="font-semibold text-gray-900">You account</p>
                                <p className="text-xs text-gray-500 mt-1">Log in to experience the full range of features.</p>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <NavLink 
                                    to="/login" 
                                    onClick={() => setShowDropdown(false)}
                                    className="flex items-center justify-center w-full py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Login
                                </NavLink>
                                
                                <div className="text-xs text-center text-gray-500 mt-2">
                                    Dont have an account{' '}
                                    <NavLink 
                                        to="/register" 
                                        onClick={() => setShowDropdown(false)}
                                        className="text-blue-600 font-semibold hover:underline"
                                    >
                                        Register
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserMenu;