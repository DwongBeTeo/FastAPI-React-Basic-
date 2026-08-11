// src/pages/user/product/ProductListPage.jsx
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import axiosConfig from '../../../utils/axiosConfig';
import ProductCard from '../../../components/user/product/ProductCard'
import { API_ENDPOINTS } from '../../../utils/apiEndPoint';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../components/Modal';
import RequestWizard from '../../../components/user/request/RequestWizard';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        search: '',
        maxPrice: ''
    });

    const navigate = useNavigate();
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // ?skip=0&limit=100
                const response = await axiosConfig.get(`${API_ENDPOINTS.USER.GET_AVAILABLE_PRODUCTS}?skip=0&limit=100`);
                setProducts(response || []);
            } catch (error) {
                console.error("Error loading products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleBuyClick = (product) => {
        // Check login (UX Protection)
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

    // Client-side Filter Logic
    const filteredProducts = products.filter(product => {
        const matchSearch = product.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                            product.code.toLowerCase().includes(filters.search.toLowerCase());
        
        const isActive = product.is_active === true;
        const matchPrice = filters.maxPrice === '' || (product.price <= Number(filters.maxPrice));
    
        return matchSearch && isActive && matchPrice;
    });

    return (
        <div className="bg-gray-50 min-h-screen pb-12 pt-6">
            <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-20 flex flex-col md:flex-row gap-8">
                
                {/* --- Left column: Filter (SIDEBAR) --- */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>

                        {/* Search */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Enter name or product code..." 
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Max Price */}
                        <div className="mb-5 border-t border-gray-100 pt-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Price</label>
                            <select 
                                name="maxPrice"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-white"
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
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Product List</h1>
                        <p className="text-gray-500 mt-1">Found {filteredProducts.length} matching results</p>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center text-gray-500">Loading...</div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} onBuyClick={handleBuyClick} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-white rounded-xl border border-gray-100 shadow-sm text-gray-500">
                            No products found.
                        </div>
                    )}
                </div>

            </div>

            {/* --- MODAL WIZARD --- */}
            <Modal 
                isOpen={isWizardOpen} 
                onClose={() => setIsWizardOpen(false)} 
                title="Data Access Request"
                fitContent={true}
            >
                {/* Use the && operator to force the Wizard to re-render from scratch every time the Modal opens */}
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