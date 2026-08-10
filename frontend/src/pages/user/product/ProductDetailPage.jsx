// src/pages/user/product/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, ShoppingCart } from 'lucide-react';
import axiosConfig from '../../../utils/axiosConfig';

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                setLoading(true);
                const response = await axiosConfig.get(`/api/v1/products/${id}`);
                setProduct(response);
            } catch (err) {
                console.error("Lỗi tải chi tiết:", err);
                setError('Không tìm thấy thông tin sản phẩm.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProductDetail();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>;
    
    if (error || !product) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <p className="text-red-500">{error}</p>
            <Link to="/products" className="text-blue-600 hover:underline">Quay lại danh sách</Link>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-3xl mx-auto px-5 md:px-10">
                
                <Link to="/products" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 transition-colors">
                    <ArrowLeft size={16} /> Quay lại danh sách
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-8 md:p-12">
                    
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                        <div className="p-4 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                            <Package size={40} />
                        </div>
                        <div>
                            <span className="text-sm font-mono text-gray-500">{product.code}</span>
                            <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 mb-10">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Giá bán niêm yết</p>
                            <p className="text-4xl font-bold text-blue-600">{product.price.toLocaleString('vi-VN')} VNĐ</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-2">Tình trạng</p>
                            <span className={`px-4 py-2 text-sm font-bold rounded-lg inline-block ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {product.is_active ? 'Sẵn sàng phục vụ' : 'Đang tạm ngưng'}
                            </span>
                        </div>
                    </div>

                    <button 
                        disabled={!product.is_active}
                        className="w-full md:w-auto md:px-12 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                    >
                        <ShoppingCart size={20} /> Thêm vào giỏ hàng
                    </button>

                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;