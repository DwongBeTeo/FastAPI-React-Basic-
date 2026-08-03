import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
    // Tạm thời gán cứng (hardcode) role là ADMIN để bạn test.
    const userRole = 'ADMIN'; 
    const isAuthenticated = true;

    // Nếu chưa đăng nhập -> Đẩy về trang Login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Nếu Role không nằm trong danh sách cho phép -> Đẩy về Trang chủ
    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
    }

    // Nếu hợp lệ -> Cho phép load nội dung trang con
    return <Outlet />;
}