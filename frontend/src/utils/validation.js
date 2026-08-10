// src/utils/validation.js

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Please enter a valid email address.";
    }
    return null;
};

export const validatePassword = (password, confirmPassword) => {
    if (password !== confirmPassword) {
        return "Passwords do not match.";
    }
    if (password.length < 6) {
        return "Password must be at least 6 characters long.";
    }
    return null;
};

export const validateRegisterForm = (formData) => {
    // 1. Kiểm tra rỗng
    if (!formData.username || !formData.email || !formData.password) {
        return "Please fill in all fields.";
    }

    // 2. Kiểm tra email
    const emailError = validateEmail(formData.email);
    if (emailError) return emailError;

    // 3. Kiểm tra mật khẩu
    const passwordError = validatePassword(formData.password, formData.confirmPassword);
    if (passwordError) return passwordError;

    // Trả về null nếu không có lỗi nào
    return null; 
};