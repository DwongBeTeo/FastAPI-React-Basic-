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

    // Tính giá sau chiết khấu hiển thị cho khách xem
    const basePrice = product.price || 0;
    const tier20Price = Math.floor(basePrice * 0.8);
    const tier30Price = Math.floor(basePrice * 0.7);

    return (
        <div className="bg-gray-50 min-h-screen pb-12 pt-6 px-4">
            <div className="max-w-5xl mx-auto">
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
                                </div>
                            </div>
                            <button 
                                onClick={handleBuyClick}
                                disabled={!product.is_active}
                                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                            >
                                <ShoppingCart size={20}/> Chọn Mua
                            </button>
                        </div>
                    </div>

                    {/* Bảng Giá Tĩnh (Static Pricing Table) */}
                    <div className="p-8 bg-gray-50/50">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Bảng Giá Dịch Vụ</h2>
                            <p className="text-gray-500 text-sm mt-1">Càng mua thời gian dài, chiết khấu càng sâu.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Gói Cơ bản */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
                                <h3 className="font-bold text-gray-800 mb-2">Mua lẻ (&lt; 1 Năm)</h3>
                                <p className="text-3xl font-extrabold text-gray-900 mb-4">${basePrice.toLocaleString('en-US')}<span className="text-base text-gray-500 font-normal">/tháng</span></p>
                                <ul className="space-y-3 text-sm text-gray-600">
                                    <li className="flex gap-2"><CheckCircle2 size={16} className="text-gray-400"/> Áp dụng từ 1 - 11 tháng</li>
                                    <li className="flex gap-2"><CheckCircle2 size={16} className="text-gray-400"/> Không áp dụng chiết khấu</li>
                                </ul>
                            </div>

                            {/* Gói Giảm 20% */}
                            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-200 shadow-sm relative transform md:-translate-y-2">
                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase">Phổ biến</div>
                                <h3 className="font-bold text-blue-900 mb-2">Mua 1 - 2 Năm</h3>
                                <div className="mb-4">
                                    <span className="text-sm text-gray-400 line-through mr-2">${basePrice}</span>
                                    <span className="text-3xl font-extrabold text-blue-600">${tier20Price.toLocaleString('en-US')}</span>
                                    <span className="text-base text-gray-500 font-normal">/tháng</span>
                                </div>
                                <ul className="space-y-3 text-sm text-gray-700">
                                    <li className="flex gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Áp dụng từ 12 - 24 tháng</li>
                                    <li className="flex gap-2"><CheckCircle2 size={16} className="text-blue-500"/> <b className="text-blue-700">Giảm giá 20%</b> toàn hóa đơn</li>
                                </ul>
                            </div>

                            {/* Gói Giảm 30% */}
                            <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg relative text-white">
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase">Tiết kiệm nhất</div>
                                <h3 className="font-bold text-gray-100 mb-2">Mua Dài Hạn (&gt; 2 Năm)</h3>
                                <div className="mb-4">
                                    <span className="text-sm text-gray-400 line-through mr-2">${basePrice}</span>
                                    <span className="text-3xl font-extrabold text-green-400">${tier30Price.toLocaleString('en-US')}</span>
                                    <span className="text-base text-gray-300 font-normal">/tháng</span>
                                </div>
                                <ul className="space-y-3 text-sm text-gray-300">
                                    <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-400"/> Áp dụng từ 25 tháng trở lên</li>
                                    <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-400"/> <b className="text-green-400">Giảm giá 30%</b> toàn hóa đơn</li>
                                </ul>
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