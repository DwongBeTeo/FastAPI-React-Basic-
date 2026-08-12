import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Zap, BarChart2, LoaderCircle } from 'lucide-react';
import axiosConfig from '../utils/axiosConfig';
import { API_ENDPOINTS } from '../utils/apiEndPoint';

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                // Gọi API lấy danh sách sản phẩm, giới hạn 3 sản phẩm đầu tiên
                const res = await axiosConfig.get(`${API_ENDPOINTS.USER.GET_AVAILABLE_PRODUCTS}?skip=0&limit=3`);
                
                // Lọc lấy các sản phẩm đang active
                const activeProducts = (res || []).filter(p => p.is_active === true);
                
                // Cắt lấy tối đa 3 sản phẩm
                setFeaturedProducts(activeProducts.slice(0, 3));
            } catch (error) {
                console.error("Lỗi tải sản phẩm nổi bật:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTopProducts();
    }, []);
    // Mảng icon ngẫu nhiên để trang trí thẻ card giống thiết kế
    const cardIcons = [TrendingUp, Zap, BarChart2];
    return (
        <div className="bg-[#031427] min-h-screen font-sans flex flex-col">
            
            {/* --- HERO SECTION --- */}
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#d3e4fe] tracking-tight mb-6 leading-tight font-['Geist']">
                        High-Quality Stock Data for Your <br className="hidden sm:block" />
                        Analysis
                    </h1>
                    
                    <p className="text-lg text-[#c6c6cd] max-w-3xl mx-auto mb-10 leading-relaxed font-['Inter']">
                        Empower your trading algorithms and financial models with our ultra-low 
                        latency, institutional-grade market data feeds covering primary Vietnamese 
                        exchanges.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link 
                            to="/products"
                            className="w-full sm:w-auto px-8 py-3.5 bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-bold rounded-lg transition-colors shadow-lg shadow-[#00a572]/20"
                        >
                            Explore API Docs
                        </Link>
                        <button className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-[#45464d] hover:border-[#909097] text-[#d3e4fe] font-bold rounded-lg transition-colors">
                            Contact Sales
                        </button>
                    </div>
                </div>
                {/* --- PRODUCTS SECTION --- */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h2 className="text-3xl font-bold text-[#d3e4fe] mb-8 font-['Geist']">Stock Data Products</h2>
                    
                    {loading ? (
                        <div className="py-20 flex justify-center text-[#c6c6cd]">
                            <LoaderCircle className="animate-spin w-10 h-10" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredProducts.map((product, index) => {
                                // Lấy icon ngẫu nhiên hoặc theo thứ tự index
                                const IconComponent = cardIcons[index % cardIcons.length];
                                
                                return (
                                    <div 
                                        key={product.id} 
                                        className="bg-[#102034] border border-[#26364a] hover:border-[#45464d] rounded-xl p-6 flex flex-col transition-all duration-300 group"
                                    >
                                        <div className="flex justify-between items-start mb-5">
                                            <span className="bg-[#00a572]/20 text-[#4edea3] text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                                                {product.code}
                                            </span>
                                            <IconComponent className="text-[#909097] group-hover:text-[#d3e4fe] transition-colors" size={22} />
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-[#d3e4fe] mb-3 leading-snug font-['Geist']">
                                            {product.name}
                                        </h3>
                                        
                                        {/* Mô tả giả định, nếu database của bạn có trường description thì thay bằng product.description */}
                                        <p className="text-sm text-[#c6c6cd] mb-8 flex-1 leading-relaxed font-['Inter']">
                                            Real-time tick data, order book depth (Level 2), and historical datasets tailored for high-frequency trading applications.
                                        </p>
                                        
                                        <div className="border-t border-[#26364a] pt-5 flex justify-between items-center mt-auto">
                                            <div className="text-[#d3e4fe] font-bold text-xl">
                                                ${product.price?.toLocaleString('en-US')} 
                                                <span className="text-sm font-normal text-[#909097] ml-1">/ mo</span>
                                            </div>
                                            <Link 
                                                to={`/products/${product.id}`}
                                                className="bg-[#1b2b3f] hover:bg-[#26364a] text-[#d3e4fe] text-sm px-5 py-2.5 rounded-lg font-medium transition-colors border border-[#26364a]"
                                            >
                                                Select
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {/* Fallback nếu không có sản phẩm nào */}
                    {!loading && featuredProducts.length === 0 && (
                        <div className="text-center py-12 text-[#909097] border border-[#26364a] rounded-xl border-dashed">
                            No active products available at the moment.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}