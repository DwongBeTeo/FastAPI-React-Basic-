import { LayoutDashboard, PawPrint, Home, User } from "lucide-react";

export const SIDE_BAR_ADMIN = [
    { path: '/admin/pets', label: 'Quản lý Thú cưng', icon: PawPrint },
    { path: '/admin/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
];

export const SIDE_BAR_USER = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/profile', label: 'Hồ sơ của tôi', icon: User },
];