// src/pages/user/product/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShoppingCart, LoaderCircle, Tag } from 'lucide-react';
import axiosConfig from '../../../utils/axiosConfig';
import { Modal } from '../../../components/Modal';
import RequestWizard from '../../../components/user/request/RequestWizard';
import { API_ENDPOINTS } from '../../../utils/apiEndPoint';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
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

    if (loading) return <div className="min-h-screen flex justify-center pt-20"><LoaderCircle className="animate-spin w-8 h-8 text-[#4ade80]" /></div>;
    if (!product) return <div className="text-center pt-20">Product not found.</div>;

    const handleBuyClick = () => {
        if (!localStorage.getItem('token')) {
            alert("Vui lòng đăng nhập để mua dữ liệu!");
            return navigate('/login');
        }
        setIsWizardOpen(true);
    };

    const basePrice = product.price || 0;
    const tier20Price = Math.floor(basePrice * 0.8);
    const tier30Price = Math.floor(basePrice * 0.7);

    return (
        <div className="min-h-screen pb-12 pt-8 px-4">
            <div className="max-w-5xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:text-[#4ade80] mb-6 font-medium text-sm transition-colors">
                    <ArrowLeft size={16} /> Quay lại danh mục
                </button>
                <div className="bg-[#111827] rounded-2xl shadow-lg border border-slate-800 overflow-hidden">
                    
                    {/* Header Sản phẩm */}
                    <div className="p-8 border-b border-slate-800">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <p className="text-sm font-mono mb-2">{product.code}</p>
                                <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
                                
                                <span className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider ${product.is_active ? 'bg-[#064e3b]/60 text-[#4ade80]' : 'bg-red-900/30 text-red-400'}`}>
                                    {product.is_active ? 'Đang mở bán' : 'Ngừng kinh doanh'}
                                </span>
                            </div>
                            
                            <button 
                                onClick={handleBuyClick}
                                disabled={!product.is_active}
                                className="flex items-center gap-2 px-8 py-3 bg-[#4ade80] text-slate-900 font-bold rounded-lg hover:bg-[#22c55e] disabled:opacity-50 transition-colors shadow-lg shadow-green-900/20 w-full md:w-auto justify-center"
                            >
                                <ShoppingCart size={20}/> Chọn Mua Ngay
                            </button>
                        </div>
                    </div>

                    {/* Bảng Giá Tĩnh */}
                    <div className="p-8 bg-[#0B1121]/30">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold">Thông tin dịch vụ</h2>
                            <p className="text-sm mt-1">Lựa chọn dữ liệu theo khoảng thời gian bạn mong muốn.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Cột 1: Thông tin giá */}
                            <div className="bg-[#111827] p-6 rounded-xl border border-slate-800 shadow-sm relative hover:border-slate-600 transition-colors">
                                <h3 className="font-bold mb-2">Giá niêm yết (Base Price)</h3>
                                <p className="text-4xl font-extrabold text-[#4ade80] mb-4">
                                    ${basePrice.toLocaleString('en-US')}<span className="text-base font-normal opacity-70">/tháng</span>
                                </p>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#4ade80]"/> Tính linh hoạt theo số tháng đã chọn.</li>
                                    <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#4ade80]"/> Thanh toán trọn gói 1 lần khi duyệt đơn.</li>
                                </ul>
                            </div>

                            {/* Cột 2: Promo Highlight */}
                            <div className="bg-[#0f172a] p-6 rounded-xl border border-blue-900/30 shadow-sm flex flex-col justify-center relative overflow-hidden">
                                {/* Ánh sáng mờ ảo trang trí */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
                                
                                <div className="flex items-center gap-2 text-blue-400 font-bold mb-3 text-lg relative z-10">
                                    <Tag className="text-blue-500" /> Ưu đãi đặc biệt
                                </div>
                                <p className="text-sm mb-4 leading-relaxed relative z-10">
                                    Bạn có mã giảm giá từ sự kiện hoặc đối tác? Đừng quên nhập mã khuyến mãi ở bước xác nhận cuối cùng (Confirm & Send) để hệ thống tự động giảm giá trực tiếp vào hóa đơn của bạn.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} title="Yêu cầu truy cập dữ liệu" fitContent={true}>
                {isWizardOpen && (
                    <RequestWizard 
                        initialProduct={product}
                        onSuccess={() => { setIsWizardOpen(false); navigate('/my-dashboard'); }} 
                        onCancel={() => setIsWizardOpen(false)} 
                    />
                )}
            </Modal>
        </div>
    );
};

export default ProductDetailPage;