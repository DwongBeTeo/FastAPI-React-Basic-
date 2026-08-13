// src/utils/apiEndpoints.js
export const BASE_URL = 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
    // === AUTH ===
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GET_USER_INFO: '/auth/me',

    // === ADMIN ===
    ADMIN: {
        GET_ALL_PRODUCTS: '/admin/products/',
        ADD_PRODUCT: '/admin/products/',
        UPDATE_PRODUCT: (id) => `/admin/products/${id}`,
        DELETE_PRODUCT: (id) => `/admin/products/${id}`,
        PROMOTIONS: {
            LIST: '/admin/promotions/',
            CREATE: '/admin/promotions/',
            UPDATE: (id) => `/admin/promotions/${id}`,
            DELETE: (id) => `/admin/promotions/${id}`
        },
    },
    // === ADMIN: REQUEST MANAGEMENT ===
    ADMIN_REQUEST: {
        GET_ALL: '/admin/requests/',           
        APPROVE: (id) => `/admin/requests/${id}/approve`, 
        REJECT: (id) => `/admin/requests/${id}/reject`,   
    },

    // === ADMIN: PRODUCT DATA (DỮ LIỆU THỰC TẾ) ===
    ADMIN_PRODUCT_DATA: {
        GET_ALL: '/admin/product-data/', 
        CREATE: '/admin/product-data/',
        UPDATE: (id) => `/admin/product-data/${id}`,
        DELETE: (id) => `/admin/product-data/${id}`,
    },

    // === USER (PUBLIC) ===
    USER: {
        GET_AVAILABLE_PRODUCTS: '/products/',
        GET_PRODUCT_DETAIL: (id) => `/products/${id}`,
    },
    // === USER: DATA REQUEST ===
    USER_REQUEST: {
        CREATE: '/requests/',                  
        GET_MINE: '/requests/me',              
    },

    // === USER: DATA ACCESS ===
    USER_ACCESS: {
        GET_MINE: '/access/me',                
        GET_ACTUAL_DATA: (productId) => `/access/${productId}/data`, 
    },
};