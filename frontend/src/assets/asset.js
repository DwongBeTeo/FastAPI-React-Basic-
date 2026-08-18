import { LayoutDashboard, PawPrint, Home, User, Fish, PrinterCheck, TrendingUp, BookAudioIcon } from "lucide-react";

export const SIDE_BAR_ADMIN = [
    { path: '/admin/products', label: 'Products', icon: PawPrint },
    { path: '/admin/requests', label: 'Requests', icon: LayoutDashboard },
    { path: '/admin/product-data', label: 'Product Data', icon: Fish },
    { path: '/admin/promotions', label: 'Promotion', icon: TrendingUp },
    { path: '/admin/audit_logs', label: 'Audit Log', icon: BookAudioIcon },


];

export const SIDE_BAR_USER = [
    { path: '/', label: 'Trang chủ', icon: Home },
];