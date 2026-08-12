import { LayoutDashboard, PawPrint, Home, User, Fish, PrinterCheck } from "lucide-react";

export const SIDE_BAR_ADMIN = [
    { path: '/admin/products', label: 'Products', icon: PawPrint },
    { path: '/admin/requests', label: 'Requests', icon: LayoutDashboard },
    { path: '/admin/product-data', label: 'Product Data', icon: Fish },
    // { path: '/admin/price-tiers', label: 'Price Tier', icon: PrinterCheck },


];

export const SIDE_BAR_USER = [
    { path: '/', label: 'Trang chủ', icon: Home },
];