// src/pages/user/product/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShoppingCart, LoaderCircle } from 'lucide-react';
import axiosConfig from '../../../utils/axiosConfig';
import { Modal } from '../../../components/Modal';
import RequestWizard from '../../../components/user/request/RequestWizard';
import { API_ENDPOINTS } from '../../../utils/apiEndPoint';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Wizard State
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await axiosConfig.get(API_ENDPOINTS.USER.GET_PRODUCT_DETAIL(id));
                setProduct(res);
            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div className="min-h-screen flex justify-center pt-20"><LoaderCircle className="animate-spin w-8 h-8 text-blue-600" /></div>;
    if (!product) return <div className="text-center pt-20">Không tìm thấy sản phẩm.</div>;

    const handleBuyClick = () => {
        if (!localStorage.getItem('token')) {
            alert("Vui lòng đăng nhập để mua dữ liệu!");
            return navigate('/login');
        }
        setIsWizardOpen(true);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12 pt-6 px-4">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-medium text-sm transition-colors">
                    <ArrowLeft size={16} /> Quay lại danh mục
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header Sản phẩm */}
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-mono text-gray-400 mb-2">{product.code}</p>
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                                
                                <div className="flex items-center gap-4 text-sm">
                                    <span className={`px-3 py-1 rounded-full font-bold ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.is_active ? 'Đang mở bán' : 'Ngừng kinh doanh'}
                                    </span>
                                    <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        Trạng thái Data: {product.is_ongoing ? 'Live (Cập nhật liên tục)' : 'Archive (Đã chốt sổ)'}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={handleBuyClick}
                                disabled={!product.is_active}
                                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                            >
                                <ShoppingCart size={20}/> Mua Quyền Truy Cập
                            </button>
                        </div>
                    </div>

                    {/* Bảng Giá (Pricing Table) */}
                    <div className="p-8 bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Bảng Giá (Pricing Tiers)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Khối hiển thị nếu chưa thiết lập Tier -> Lấy giá base */}
                            {(!product.price_tiers || product.price_tiers.length === 0) && (
                                <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
                                    <h3 className="font-bold text-lg mb-2">Giá Cơ Bản</h3>
                                    <p className="text-3xl font-extrabold text-blue-600 mb-4">${product.price.toLocaleString('en-US')}<span className="text-base text-gray-500 font-normal">/tháng</span></p>
                                    <ul className="space-y-3 text-sm text-gray-600">
                                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500"/> Mua bao nhiêu tháng tính tiền bấy nhiêu</li>
                                    </ul>
                                </div>
                            )}

                            {/* Render các gói Tier */}
                            {product.price_tiers?.map((tier) => (
                                <div key={tier.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative hover:border-blue-300 transition-colors">
                                    <h3 className="font-bold text-lg mb-2 text-gray-800">
                                        Gói {tier.min_months} {tier.max_months ? `- ${tier.max_months}` : 'trở lên (∞)'} tháng
                                    </h3>
                                    
                                    {tier.fixed_package_price !== null ? (
                                        <p className="text-3xl font-extrabold text-green-600 mb-4">
                                            ${tier.fixed_package_price.toLocaleString('en-US')} <span className="text-base text-gray-500 font-normal">/ trọn gói</span>
                                        </p>
                                    ) : (
                                        <p className="text-3xl font-extrabold text-blue-600 mb-4">
                                            ${tier.price_per_month.toLocaleString('en-US')} <span className="text-base text-gray-500 font-normal">/ tháng</span>
                                        </p>
                                    )}

                                    <ul className="space-y-3 text-sm text-gray-600 mt-4">
                                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500"/> Áp dụng khi chọn từ {tier.min_months} tháng</li>
                                        {tier.fixed_package_price && <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500"/> Tiết kiệm tối đa chi phí</li>}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL WIZARD */}
            <Modal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} title="Yêu cầu truy cập dữ liệu" fitContent={true}>
                {isWizardOpen && (
                    <RequestWizard 
                        initialProduct={product} // Truyền thẳng product đã có sẵn price_tiers vào đây
                        onSuccess={() => { setIsWizardOpen(false); navigate('/my-dashboard'); }} 
                        onCancel={() => setIsWizardOpen(false)} 
                    />
                )}
            </Modal>
        </div>
    );
};

export default ProductDetailPage;