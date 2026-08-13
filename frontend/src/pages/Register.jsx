// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, LoaderCircle, ArrowRight } from 'lucide-react';
import axiosConfig from '../utils/axiosConfig';
import { API_ENDPOINTS } from '../utils/apiEndPoint';
// Import hàm validation vừa tạo
import { validateRegisterForm } from '../utils/validation'; 

const Register = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // --- SỬ DỤNG HÀM VALIDATION Ở ĐÂY ---
        const validationError = validateRegisterForm(formData);
        if (validationError) {
            return setError(validationError); // Dừng lại và báo lỗi nếu validation thất bại
        }

        setIsLoading(true);
        setError('');
        
        try {
            const payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password
            };

            await axiosConfig.post(API_ENDPOINTS.REGISTER, payload);
            
            setSuccessMsg("Registration successful! Redirecting to login page...");
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            console.error("Registration error:", err);
            
            const errorDetail = err.response?.data?.detail;
            
            // Xử lý lỗi 422 từ FastAPI (mảng object) hoặc lỗi 400 (chuỗi string)
            if (Array.isArray(errorDetail)) {
                setError(errorDetail[0].msg || "Invalid input format.");
            } else if (typeof errorDetail === 'string') {
                setError(errorDetail);
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-300">
            <div className="max-w-md w-full space-y-8 bg-[#111827] p-8 rounded-2xl shadow-xl shadow-black/50 border border-slate-800">
                
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">Create Account</h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Join now to experience our data services
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-900/30 text-red-400 rounded-lg text-sm border border-red-800 text-center font-medium">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="p-3 bg-[#064e3b]/30 text-[#4ade80] rounded-lg text-sm border border-[#064e3b] text-center font-medium">
                        {successMsg}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-1.5">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="pl-10 block w-full px-3 py-2.5 bg-[#0B1121] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-[#4ade80] text-sm text-white transition-colors placeholder-slate-600"
                                    placeholder="johndoe123"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-1.5">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-10 block w-full px-3 py-2.5 bg-[#0B1121] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-[#4ade80] text-sm text-white transition-colors placeholder-slate-600"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-1.5">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="pl-10 block w-full px-3 py-2.5 bg-[#0B1121] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-[#4ade80] text-sm text-white transition-colors placeholder-slate-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="pl-10 block w-full px-3 py-2.5 bg-[#0B1121] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-[#4ade80] text-sm text-white transition-colors placeholder-slate-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || successMsg !== ''}
                        className="w-full flex justify-center items-center gap-2 py-2.5 px-4 text-sm font-bold rounded-lg text-slate-900 bg-[#4ade80] hover:bg-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:ring-offset-2 focus:ring-offset-[#111827] shadow-lg shadow-green-900/20 transition-colors disabled:opacity-70"
                    >
                        {isLoading ? (
                            <LoaderCircle className="w-5 h-5 animate-spin text-slate-900" />
                        ) : (
                            <>
                                Register <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center text-sm pt-4 border-t border-slate-800">
                    <span className="text-slate-500">Already have an account? </span>
                    <Link to="/login" className="font-semibold text-[#4ade80] hover:text-[#22c55e] transition-colors">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;