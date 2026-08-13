// src/pages/user/product/ProductListPage.jsx
import React, { useState, useEffect } from 'react';
import { LoaderCircle, Search, PackageX } from 'lucide-react';
import axiosConfig from '../../../utils/axiosConfig';
import ProductCard from '../../../components/user/product/ProductCard'
import { API_ENDPOINTS } from '../../../utils/apiEndPoint';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../components/Modal';
import RequestWizard from '../../../components/user/request/RequestWizard';
import Pagination from '../../../components/common/Pagination';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- State Phân Trang ---
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 7; // 

    const [filters, setFilters] = useState({
        search: '',
        maxPrice: ''
    });

    const navigate = useNavigate();
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Cập nhật hàm fetch để hỗ trợ pagination
    const fetchProducts = async (page) => {
        try {
            setLoading(true);
            const skip = (page - 1) * limit;
            
            // Xây dựng URL kèm tham số phân trang
            let url = `${API_ENDPOINTS.USER.GET_AVAILABLE_PRODUCTS}?skip=${skip}&limit=${limit}`;
            
            const response = await axiosConfig.get(url);
            
            // Lấy data và total từ chuẩn API mới
            let fetchedProducts = response.data || [];
            
            // Sort theo ID giảm dần
            fetchedProducts.sort((a, b) => b.id - a.id);
            
            setProducts(fetchedProducts);
            setTotalItems(response.total || 0); // Lưu tổng số lượng

        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi lại API khi currentPage thay đổi
    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage]);

    // Tính tổng số trang
    const totalPages = Math.ceil(totalItems / limit);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleBuyClick = (product) => {
        if (!localStorage.getItem('token')) {
            alert("You need to log in to send a request!");
            navigate('/login');
            return;
        }
        setSelectedProduct(product);
        setIsWizardOpen(true);
    };

    const handleWizardSuccess = () => {
        setIsWizardOpen(false);
        navigate('/my-dashboard'); 
    };

    // Client-side Filter Logic (Lưu ý: Nếu có phân trang Server, lý tưởng nhất là 
    // đẩy cả Search và MaxPrice xuống Backend xử lý. Nhưng tạm thời bạn vẫn có thể để ở FE)
    const filteredProducts = products.filter(product => {
        const matchSearch = product.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                            product.code.toLowerCase().includes(filters.search.toLowerCase());
        
        const isActive = product.is_active === true;
        const matchPrice = filters.maxPrice === '' || (product.price <= Number(filters.maxPrice));
    
        return matchSearch && isActive && matchPrice;
    });

    return (
        <div className="bg-[#0B1121] min-h-screen pb-12 pt-8">
            <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-20 flex flex-col md:flex-row gap-8">
                
                {/* --- Left column: Filter (SIDEBAR) --- */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-[#111827] rounded-xl shadow-lg border border-slate-800 p-5 sticky top-24">
                        <h2 className="text-xl font-bold text-white mb-6">Filters</h2>

                        {/* Search */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                <input 
                                    type="text" 
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Enter name or code..." 
                                    className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-[#4ade80] focus:border-[#4ade80] outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Max Price */}
                        <div className="mb-5 border-t border-slate-800 pt-5">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Maximum Price</label>
                            <select 
                                name="maxPrice"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:ring-1 focus:ring-[#4ade80] focus:border-[#4ade80] transition-colors appearance-none"
                            >
                                <option value="">All prices</option>
                                <option value="100">Under $100</option>
                                <option value="200">Under $200</option>
                                <option value="300">Under $300</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- Right column: Product List --- */}
                <div className="flex-1">
                    <div className="mb-8 border-b border-slate-800 pb-4">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Product List</h1>
                        <p className="text-slate-400 mt-2">Found <b className="text-[#4ade80]">{filteredProducts.length}</b> matching results in this page</p>
                    </div>

                    {loading ? (
                        <div className="py-20 flex justify-center text-slate-500">
                            <LoaderCircle className="w-10 h-10 animate-spin text-[#4ade80]" />
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="flex flex-col gap-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} onBuyClick={handleBuyClick} />
                                ))}
                            </div>
                            
                            {/* --- COMPONENT PHÂN TRANG CHO USER --- */}
                            {totalPages > 1 && (
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => setCurrentPage(page)}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="py-24 flex flex-col items-center justify-center bg-[#111827] rounded-xl border border-slate-800 border-dashed text-slate-500">
                            <PackageX className="w-12 h-12 mb-3 text-slate-600" />
                            <p className="text-lg">No products found.</p>
                            <p className="text-sm mt-1">Try adjusting your filters to find what you're looking for.</p>
                        </div>
                    )}
                </div>

            </div>

            <Modal 
                isOpen={isWizardOpen} 
                onClose={() => setIsWizardOpen(false)} 
                title="Data Access Request"
                fitContent={true}
            >
                {isWizardOpen && (
                    <RequestWizard 
                        initialProduct={selectedProduct}
                        onSuccess={handleWizardSuccess} 
                        onCancel={() => setIsWizardOpen(false)} 
                    />
                )}
            </Modal>
        </div>
    );
};

export default ProductListPage;