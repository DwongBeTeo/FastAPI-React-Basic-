// src/pages/Login.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 

import AuthContext from '../context/AuthContext';
import axiosConfig from '../utils/axiosConfig.jsx';
import { API_ENDPOINTS } from '../utils/apiEndPoint';
import { LoaderCircle, Lock} from "lucide-react";
import useCountdown from '../hook/useCountDown.jsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useContext(AuthContext); 

    // --- SỬ DỤNG HOOK ĐẾM NGƯỢC ---
    // Key 'login_lockout_time' sẽ được lưu trong trình duyệt
    const { isLocked, formattedTime, startCountdown } = useCountdown('login_lockout_time');

    const handleLogin = async (e) => {
        e.preventDefault(); 
        if (isLocked) return; // Nếu đang bị khóa thì không cho submit

        setErrorMsg('');
        setIsLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            // Call API
            const response = await axiosConfig.post(
                API_ENDPOINTS.LOGIN, 
                formData,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            login(response);
            
            const token = response.access_token;
            const decoded = jwtDecode(token);

            if (decoded.role === 'ADMIN') {
                navigate('/admin/products', { replace: true });
            } else {
                navigate('/', { replace: true }); 
            }

        } catch (error) {
            // --- XỬ LÝ LỖI TỪ BACKEND ---
            if (error.response) {
                if (error.response.status === 401) {
                    setErrorMsg('Password or email is incorrect!');
                } 
                else if (error.response.status === 429) {
                    // Backend trả về mã 429: Bị khóa do sai quá 10 lần
                    // Lấy số giây thực tế từ backend, nếu không có thì dự phòng 300s
                    const remainingSeconds = error.response.data?.detail?.remaining_seconds || 300;
                    
                    startCountdown(remainingSeconds); // Truyền số giây thực tế vào
                    setErrorMsg('Too many failed attempts. Your account is temporarily locked.');
                }
                else {
                    // Backend trả về detail message nếu có (ví dụ lỗi 500)
                    setErrorMsg(error.response.data?.detail || 'Server error. Please try again.');
                }
            } else {
                setErrorMsg('Can not connect to server. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen text-slate-300">
            <div className="w-full max-w-md p-8 space-y-6 bg-[#111827] rounded-2xl shadow-xl shadow-black/50 border border-slate-800">
                <h2 className="text-2xl font-bold text-center text-white">Log in</h2>
                
                {/* HIỂN THỊ CẢNH BÁO */}
                {isLocked ? (
                     <div className="p-4 text-sm text-orange-200 bg-orange-900/30 rounded-lg border border-orange-800 text-center flex flex-col items-center gap-2">
                        <Lock className="w-6 h-6 text-orange-400" />
                        <p className="font-semibold">Account Temporarily Locked</p>
                        <p>Too many failed attempts. Please try again in:</p>
                        <span className="text-2xl font-mono font-bold text-orange-400">{formattedTime()}</span>
                    </div>
                ) : (
                    errorMsg && (
                        <div className="p-3 text-sm text-red-400 bg-red-900/30 rounded-lg border border-red-800 text-center font-medium">
                            {errorMsg}
                        </div>
                    )
                )}

                <form className="space-y-5" onSubmit={handleLogin}>
                    <div>
                        <label className="block mb-1.5 text-sm font-bold text-slate-400">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            disabled={isLocked || isLoading} // Khóa ô nhập liệu nếu bị block
                            className={`w-full px-4 py-2.5 bg-[#0B1121] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-[#4ade80] text-sm text-white transition-colors placeholder-slate-600 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-1.5 text-sm font-bold text-slate-400">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            disabled={isLocked || isLoading} // Khóa ô nhập liệu nếu bị block
                            className={`w-full px-4 py-2.5 bg-[#0B1121] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-[#4ade80] text-sm text-white transition-colors placeholder-slate-600 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLocked || isLoading} // Khóa nút bấm
                        className={`w-full flex justify-center items-center gap-2 px-4 py-2.5 text-slate-900 font-bold bg-[#4ade80] rounded-lg shadow-lg shadow-green-900/20 transition-colors 
                        ${isLocked ? 'bg-slate-700 text-slate-400 shadow-none cursor-not-allowed' : 'hover:bg-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:ring-offset-2 focus:ring-offset-[#111827]'} 
                        ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                                <>
                                    <LoaderCircle className="animate-spin w-5 h-5 text-slate-900"/>
                                    Logging in...
                                </>
                            ): (
                                isLocked ? "Locked" : "Login"
                            )}
                    </button>
                </form>

                {/* Regis redirect link */}
                <div className="text-center text-sm pt-2 border-t border-slate-800">
                    <span className="text-slate-500">Don't have an account? </span>
                    <Link to="/register" className={`font-semibold text-[#4ade80] hover:text-[#22c55e] transition-colors ${isLocked ? 'pointer-events-none opacity-50' : ''}`}>
                        Register here
                    </Link>
                </div>
                <div className="text-center text-sm pt-2 border-t border-slate-800">
                    <Link to="/" className="font-semibold text-[#4ade80] hover:text-[#22c55e] transition-colors">
                        Back to HomePage
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;