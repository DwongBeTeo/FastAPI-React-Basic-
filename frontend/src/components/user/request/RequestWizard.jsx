// src/components/user/request/RequestWizard.jsx
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Calendar, CheckCircle, ArrowRight, ArrowLeft, LoaderCircle } from 'lucide-react';
import axiosConfig from '../../../utils/axiosConfig';
import Step1SelectProduct from './steps/Step1SelectProduct';
import Step2SelectMonth from './steps/Step2SelectMonth';
import Step3Confirm from './steps/Step3Confirm';
import { API_ENDPOINTS } from '../../../utils/apiEndPoint';

const RequestWizard = ({ onSuccess, onCancel, initialProduct = null }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [products, setProducts] = useState([]);
    const [pendingProductIds, setPendingProductIds] = useState(new Set());
    const [activeAccessMap, setActiveAccessMap] = useState(new Map());
    
    const [cartItems, setCartItems] = useState([]);
    const [notes, setNotes] = useState('');
    const [promotionCode, setPromotionCode] = useState('');

    useEffect(() => {
        const fetchWizardData = async () => {
            setIsLoading(true);
            try {
                const [prodRes, reqRes, accRes] = await Promise.all([
                    axiosConfig.get(`${API_ENDPOINTS.USER.GET_AVAILABLE_PRODUCTS}?skip=0&limit=100`),
                    axiosConfig.get(API_ENDPOINTS.USER_REQUEST.GET_MINE),
                    axiosConfig.get(API_ENDPOINTS.USER_ACCESS.GET_MINE)
                ]);

                const activeProductsOnly = (prodRes || []).filter(p => p.is_active === true);
                setProducts(activeProductsOnly);

                const pIds = new Set();
                (reqRes || []).forEach(req => {
                    if (req.status === 'PENDING') {
                        req.items?.forEach(item => pIds.add(item.product_id));
                    }
                });
                setPendingProductIds(pIds);

                const aMap = new Map();
                (accRes || []).forEach(acc => {
                    if (acc.is_active) {
                        aMap.set(acc.product_id, {
                            granted_at: acc.granted_at,
                            expires_at: acc.expires_at
                        });
                    }
                });
                setActiveAccessMap(aMap);

                if (initialProduct && !pIds.has(initialProduct.id)) {
                    const fullProduct = activeProductsOnly.find(p => p.id === initialProduct.id) || initialProduct;
                    handleAddToCart(fullProduct, true);
                    setStep(2);
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu Wizard:", err);
                setError("Cannot load data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchWizardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialProduct]);

    const calculateMonths = (startDate, endDate) => {
        if (!startDate || !endDate) return 0; 
        const start = new Date(`${startDate}-01`);
        const end = new Date(`${endDate}-01`);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
        return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    };

    // TÍNH TOÁN GIÁ RIÊNG BIỆT CHO 2 GÓI
    const getSubItemPrice = (item, type) => {
        const basePrice = item.base_price ? Number(item.base_price) : 0;
        
        if (type === 'HISTORICAL' && item.historical_selected) {
            const months = calculateMonths(item.historical_from, item.historical_to);
            if (months <= 0) return 0;
            return basePrice * months;
        } 
        
        if (type === 'ONGOING' && item.ongoing_selected) {
            // ĐÃ SỬA: Nếu có chọn End Date thì tính theo số tháng, nếu để trống thì thu 1 tháng
            if (item.ongoing_to) {
                const months = calculateMonths(item.ongoing_from, item.ongoing_to);
                return basePrice * (months > 0 ? months : 1);
            }
            return basePrice; 
        }
        
        return 0;
    };

    const handleAddToCart = (product, isInitial = false) => {
        if (!isInitial && cartItems.some(i => i.product_id === product.id)) return;
        const basePrice = product.price || 0;

        // Cấu trúc State mới hỗ trợ cả 2 loại Data
        const newItem = {
            product_id: product.id,
            product_name: product.name,
            product_code: product.code,
            available_from: product.available_from,
            available_to: product.available_to,
            base_price: basePrice,
            access_type: 'READ',
            
            historical_selected: true,
            historical_from: '',
            historical_to: '',
            
            ongoing_selected: false,
            ongoing_from: '',
            ongoin_to: '',
        };

        if (isInitial) {
            setCartItems([newItem]);
        } else {
            setCartItems([...cartItems, newItem]);
        }
    };

    const handleRemoveFromCart = (productId) => {
        setCartItems(cartItems.filter(item => item.product_id !== productId));
    };

    const handleUpdateConfig = (index, field, value) => {
        const newCart = [...cartItems];
        newCart[index][field] = value;
        setCartItems(newCart);
    };

    // VALIDATE BƯỚC 2
    const isStep2Valid = cartItems.length > 0 && cartItems.every(item => {
        if (!item.historical_selected && !item.ongoing_selected) return false;

        const availFromStr = item.available_from ? item.available_from.substring(0, 7) : null;
        const availToStr = item.available_to ? item.available_to.substring(0, 7) : null;
        
        // --- THÊM LOGIC LẤY THÁNG TIẾP THEO THEO ĐỊNH DẠNG YYYY-MM ---
        const today = new Date();
        const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;

        if (item.historical_selected) {
            if (!item.historical_from || !item.historical_to) return false;
            if (item.historical_from > item.historical_to) return false;
            if (availFromStr && item.historical_from < availFromStr) return false;
            if (availToStr && item.historical_to > availToStr) return false;
        }

        if (item.ongoing_selected) {
            if (!item.ongoing_from) return false;
            if (availFromStr && item.ongoing_from < availFromStr) return false;
            if (availToStr && item.ongoing_from > availToStr) return false;
            
            // --- THÊM CHẶN: ONGOING PHẢI TỪ THÁNG TIẾP THEO ---
            if (item.ongoing_from < nextMonthStr) return false;

            if (item.ongoing_to) {
                if (item.ongoing_to < item.ongoing_from) return false;
                if (availToStr && item.ongoing_to > availToStr) return false;
            }
        }
        return true;
    });

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');
        
        try {
            // Tách 1 item giỏ hàng thành 1 hoặc 2 request_items gửi lên Backend
            const flatItems = [];
            cartItems.forEach(item => {
                if (item.historical_selected) {
                    flatItems.push({
                        product_id: item.product_id,
                        access_type: item.access_type,
                        subscription_type: "HISTORICAL",
                        from_date: `${item.historical_from}-01`,
                        to_date: `${item.historical_to}-01`
                    });
                }
                if (item.ongoing_selected) {
                    flatItems.push({
                        product_id: item.product_id,
                        access_type: item.access_type,
                        subscription_type: "ONGOING",
                        from_date: `${item.ongoing_from}-01`,
                        to_date: item.ongoing_to ? `${item.ongoing_to}-01` : null
                    });
                }
            });

            const payload = {
                reference_code: "",
                notes: notes,
                promotion_code: promotionCode.trim() !== '' ? promotionCode.trim().toUpperCase() : null,
                items: flatItems
            };

            await axiosConfig.post(API_ENDPOINTS.USER_REQUEST.CREATE, payload);
            onSuccess(); 
        } catch (err) {
            setError(err.response?.data?.detail || "Error while sending request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="py-20 flex justify-center text-[#4ade80]"><LoaderCircle className="animate-spin w-8 h-8" /></div>;

    const steps = [
        { num: 1, label: 'Configure' },
        { num: 2, label: 'Review' },
        { num: 3, label: 'Finish' }
    ];

    return (
        <div className="flex flex-col h-[80vh] bg-transparent">
            {/* STEPPER */}
            <div className="flex items-center justify-center p-6 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-4">
                    {steps.map((s, idx) => (
                        <React.Fragment key={s.num}>
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                    step >= s.num ? 'bg-[#4ade80] text-slate-900' : 'bg-transparent border border-slate-600 text-slate-500'
                                }`}>
                                    {s.num}
                                </div>
                                <span className={`text-sm font-semibold hidden md:block ${step >= s.num ? 'text-[#4ade80]' : 'text-slate-500'}`}>
                                    {s.label}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`w-12 h-px ${step > s.num ? 'bg-[#4ade80]' : 'bg-slate-700'}`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {error && (
                <div className="mx-6 mt-4 p-3 bg-red-900/30 text-red-400 rounded-lg text-sm border border-red-800">
                    <span className="font-bold mr-2">Error:</span> {error}
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {step === 1 && (
                    <Step1SelectProduct 
                        products={products}
                        pendingProductIds={pendingProductIds}
                        activeAccessMap={activeAccessMap}
                        cartItems={cartItems}
                        handleAddToCart={handleAddToCart}
                        handleRemoveFromCart={handleRemoveFromCart}
                    />
                )}
                {step === 2 && (
                    <Step2SelectMonth 
                        cartItems={cartItems}
                        handleRemoveFromCart={handleRemoveFromCart}
                        handleUpdateConfig={handleUpdateConfig}
                        getSubItemPrice={getSubItemPrice}
                    />
                )}
                {step === 3 && (
                    <Step3Confirm 
                        cartItems={cartItems}
                        notes={notes}
                        setNotes={setNotes}
                        promotionCode={promotionCode}
                        setPromotionCode={setPromotionCode}
                        getSubItemPrice={getSubItemPrice}
                    />
                )}
            </div>

            {/* BUTTONS ĐÁY */}
            <div className="p-6 border-t border-slate-800 flex justify-between items-center shrink-0">
                <button 
                    onClick={step === 1 ? onCancel : () => setStep(step - 1)}
                    className="px-6 py-2.5 text-slate-300 bg-transparent border border-slate-700 rounded-lg hover:bg-slate-800 font-medium text-sm transition-colors"
                >
                    {step === 1 ? 'Cancel' : 'Back'}
                </button>

                {step < 3 ? (
                    <button 
                        onClick={() => {
                            if (step === 1 && cartItems.length === 0) return setError("Please select at least one product.");
                            if (step === 2 && !isStep2Valid) return setError("Please configure valid dates for selected subscriptions.");
                            setError('');
                            setStep(step + 1);
                        }}
                        disabled={step === 1 && cartItems.length === 0}
                        className="px-8 py-2.5 bg-[#3b82f6] text-white rounded-lg hover:bg-blue-600 font-bold shadow-lg shadow-blue-900/20 text-sm disabled:opacity-50 transition-colors"
                    >
                        Continue
                    </button>
                ) : (
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-2.5 bg-[#4ade80] text-slate-900 rounded-lg hover:bg-[#22c55e] font-bold shadow-lg shadow-green-900/20 text-sm disabled:opacity-70 flex items-center gap-2 transition-colors"
                    >
                        {isSubmitting && <LoaderCircle className="animate-spin w-4 h-4"/>}
                        Submit Request
                    </button>
                )}
            </div>
        </div>
    );
};

export default RequestWizard;