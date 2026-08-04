// src/utils/apiEndpoints.js

export const BASE_URL = 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
    // === AUTH ===
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GET_USER_INFO: '/auth/me',

    // === ADMIN ===
    ADMIN: {
        GET_ALL_PETS: '/admin/pets/',
        ADD_PET: '/admin/pets/',
        UPDATE_PET: (id) => `/admin/pets/${id}`,
        DELETE_PET: (id) => `/admin/pets/${id}`,
    },

    // === USER (PUBLIC) ===
    USER: {
        GET_AVAILABLE_PETS: '/pets/',
        GET_PET_DETAIL: (id) => `/pets/${id}`,
    }
};