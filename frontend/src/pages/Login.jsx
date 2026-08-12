// src/pages/Login.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 

import AuthContext from '../context/AuthContext';
import axiosConfig from '../utils/axiosConfig.jsx';
import { API_ENDPOINTS } from '../utils/apiEndPoint';
import { LoaderCircle } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useContext(AuthContext); 

    const handleLogin = async (e) => {
        e.preventDefault(); 
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

            const token = response.access_token;
            
            login(token);

            const decoded = jwtDecode(token);
            if (decoded.role === 'ADMIN') {
                navigate('/admin/products', { replace: true });
            } else {
                navigate('/', { replace: true }); 
            }

        } catch (error) {
            if (error.response && error.response.status === 401) {
                setErrorMsg('Password or email is incorrect!');
            } else {
                setErrorMsg('Can not connect to server. Please  try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Log in</h2>
                
                {errorMsg && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 rounded">
                        {errorMsg}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            Email (Email)
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                                <>
                                    <LoaderCircle className="animate-spin w-5 h-5"/>
                                    Still login...
                                </>
                            ): (
                                "Login"
                            )}
                    </button>
                </form>

                {/* Regis redirect link */}
                <div className="text-center text-sm">
                    <span className="text-gray-600">Don't have an account? </span>
                    <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;