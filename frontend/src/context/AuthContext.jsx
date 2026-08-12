// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// Khởi tạo Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                
                // Kiểm tra hạn sử dụng của Token
                if (decoded.exp < currentTime) {
                    console.warn("Token hết hạn. Đang đăng xuất...");
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    // Set lại user từ cục payload đã được mã hóa ở auth_service.py
                    setUser({
                        email: decoded.sub,
                        role: decoded.role
                    });
                }
            } catch (error) {
                console.error("Token không hợp lệ:", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    // Hàm gọi khi nhấn Login thành công
    const login = (token) => {
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        setUser({
            email: decoded.sub,
            role: decoded.role
        });
    };

    // Hàm gọi khi nhấn Logout
    const logout = () => {
        localStorage.removeItem('token');
        navigate('/', {replace : true});
        setTimeout(() => {
            setUser(null);
            setLoading(false);
        }, 10);
    };

    const contextValue={
        user,
        setUser,
        login,
        logout,
        loading
    }
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
};
export default AuthContext;