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
                // Chỉ cần decode ra để lấy email/role hiển thị lên giao diện
                // Việc token hết hạn sẽ được Axios Interceptor tự lo
                const decoded = jwtDecode(token);
                setUser({
                    email: decoded.sub,
                    role: decoded.role
                });
            } catch (error) {
                console.error("Token không hợp lệ:", error);
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    // Hàm gọi khi nhấn Login thành công
    const login = (responseData) => {
        // responseData là toàn bộ JSON backend trả về: { access_token, refresh_token, token_type }
        localStorage.setItem('token', responseData.access_token);
        localStorage.setItem('refresh_token', responseData.refresh_token); 

        const decoded = jwtDecode(responseData.access_token);
        setUser({
            email: decoded.sub,
            role: decoded.role
        });
    };

    // Hàm gọi khi nhấn Logout
    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                // Gọi API để Backend thu hồi Token này trong Database
                await axiosConfig.post('/auth/logout', { 
                    refresh_token: refreshToken 
                });
            }
        } catch (error) {
            console.error("Lỗi khi logout server:", error);
        } finally {
            // Bắt buộc phải xóa token dưới Frontend dù gọi API có bị lỗi mạng hay không
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            navigate('/', { replace: true });
            
            setTimeout(() => {
                setUser(null);
                setLoading(false);
            }, 10);
        }
    };

    const contextValue = {
        user,
        setUser,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;