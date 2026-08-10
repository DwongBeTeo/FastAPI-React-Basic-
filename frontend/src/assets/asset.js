import { LayoutDashboard, PawPrint, Home, User, Fish } from "lucide-react";

export const SIDE_BAR_ADMIN = [
    { path: '/admin/products', label: 'Products', icon: PawPrint },
    { path: '/admin/requests', label: 'Requests', icon: LayoutDashboard },
    { path: '/admin/product-data', label: 'Product Data', icon: Fish },

];

export const SIDE_BAR_USER = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/profile', label: 'Hồ sơ của tôi', icon: User },
];