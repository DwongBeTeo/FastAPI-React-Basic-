// src/utils/axiosConfig.js
import axios from 'axios';
import { BASE_URL } from './apiEndPoint';

const axiosConfig = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// List of endpoints that do not require the Authorization header
const excludeEndpoints = ['/auth/login', '/auth/register', '/pets/'];

// === REQUEST INTERCEPTOR ===
axiosConfig.interceptors.request.use(
    (config) => {
        // Check if the current endpoint is in the list of endpoints that don't require authorization
        const shouldSkipToken = excludeEndpoints.some((endpoint) => 
            config.url?.includes(endpoint)
        );

        if (!shouldSkipToken) {
            const accessToken = localStorage.getItem('token');
            if (accessToken) {
                config.headers['Authorization'] = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// === RESPONSE INTERCEPTOR ===
axiosConfig.interceptors.response.use(
    (response) => {
        // return the response data directly for successful responses
        return response.data; 
    },
    (error) => {
        if (error.response) {
            // handle specific status codes
            if (error.response.status === 401) {
                console.warn('Token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
                localStorage.removeItem('token');
                window.location.href = '/login';
            } 
            else if (error.response.status === 403) {
                console.warn('Bạn không có quyền truy cập chức năng này!');
            }
            else if (error.response.status === 500) {
                console.error('Lỗi máy chủ (Server Error).');
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error('Không nhận được phản hồi từ máy chủ (Timeout).');
        }
        
        return Promise.reject(error);
    }
);

export default axiosConfig;