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

// Thêm '/auth/refresh' vào danh sách không tự động gắn token cũ
const excludeEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];

// === CÁC BIẾN QUẢN LÝ REFRESH TOKEN ===
let isRefreshing = false;
let refreshSubscribers = [];

// Đưa các request bị lỗi 401 vào hàng đợi
const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
};

// Chạy lại tất cả request trong hàng đợi sau khi có token mới
const onRefreshed = (token) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

// === REQUEST INTERCEPTOR ===
axiosConfig.interceptors.request.use(
    (config) => {
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
    (error) => Promise.reject(error)
);

// === RESPONSE INTERCEPTOR ===
axiosConfig.interceptors.response.use(
    (response) => {
        // Trả về data trực tiếp cho gọn
        return response.data; 
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response) {
            // Nếu lỗi 401 (Hết hạn token) và không phải là API login hay refresh
            if (error.response.status === 401 && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/refresh')) {
                
                // Cờ _retry để tránh bị lặp vô tận (chỉ thử lại 1 lần)
                if (!originalRequest._retry) {
                    originalRequest._retry = true;

                    if (!isRefreshing) {
                        isRefreshing = true;
                        const refreshToken = localStorage.getItem('refresh_token');

                        if (refreshToken) {
                            try {
                                // Gọi API /refresh. Lưu ý: Phải dùng axios mặc định (không dùng axiosConfig) 
                                // để không bị chạy qua interceptor này thêm lần nữa.
                                const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
                                    refresh_token: refreshToken
                                });

                                // Lưu cặp token mới vào storage
                                localStorage.setItem('token', data.access_token);
                                localStorage.setItem('refresh_token', data.refresh_token);

                                // Kích hoạt chạy lại các API đang nằm chờ với token mới
                                onRefreshed(data.access_token);
                            } catch (refreshError) {
                                // Refresh Token cũng hết hạn -> Ép văng ra màn Login
                                console.warn('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                                localStorage.removeItem('token');
                                localStorage.removeItem('refresh_token');
                                window.location.href = '/login'; 
                            } finally {
                                isRefreshing = false; // Mở khóa lại
                            }
                        } else {
                            // Không có refresh token dưới máy -> Đăng xuất luôn
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }
                    }

                    // Request hiện tại sẽ bị treo (Promise chưa resolve) chờ lấy token mới xong
                    return new Promise((resolve) => {
                        subscribeTokenRefresh((token) => {
                            originalRequest.headers['Authorization'] = `Bearer ${token}`;
                            resolve(axiosConfig(originalRequest)); // Chạy lại API ban đầu
                        });
                    });
                }
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