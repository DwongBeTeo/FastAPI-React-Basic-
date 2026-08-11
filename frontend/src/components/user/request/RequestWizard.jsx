// src/components/user/request/RequestWizard.jsx
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Calendar, CheckCircle, ArrowRight, ArrowLeft, Trash2, Info, LoaderCircle } from 'lucide-react';
import axiosConfig from '../../../utils/axiosConfig';
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
                    const fullProduct = (prodRes || []).find(p => p.id === initialProduct.id) || initialProduct;
                    
                    let tiers = fullProduct.price_tiers;
                    let basePrice = fullProduct.price;
                    
                    if (!tiers) {
                        try {
                            const detailRes = await axiosConfig.get(API_ENDPOINTS.USER.GET_PRODUCT_DETAIL(fullProduct.id));
                            tiers = detailRes.price_tiers;
                            basePrice = detailRes.price;
                        } catch(e) { console.error(e); }
                    }

                    setCartItems([{
                        product_id: fullProduct.id,
                        product_name: fullProduct.name,
                        product_code: fullProduct.code,
                        available_from: fullProduct.available_from,
                        available_to: fullProduct.available_to,
                        base_price: basePrice || 0,
                        price_tiers: tiers || [],
                        access_type: 'READ',
                        from_date: '',
                        to_date: ''    
                    }]);
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
    }, [initialProduct]);

    // --- HÀM TÍNH TOÁN ---
    const calculateMonths = (startDate, endDate) => {
        if (!startDate || !endDate) return 0; 
        const start = new Date(`${startDate}-01`);
        const end = new Date(`${endDate}-01`);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
        
        return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    };

    const getEstimatedPrice = (item) => {
        const months = calculateMonths(item.from_date, item.to_date);
        if (months <= 0) return 0;

        const basePrice = item.base_price ? Number(item.base_price) : 0;
        const totalBase = basePrice * months;

        // Áp dụng khuyến mãi giống hệt Backend
        if (months >= 12 && months <= 24) {
            return Math.floor(totalBase * 0.8); // Discount 20%
        } else if (months > 24) {
            return Math.floor(totalBase * 0.7); // Discount 30%
        }

        return totalBase; //Under 12months price base
    };

    const handleAddToCart = (product) => {
        if (cartItems.some(i => i.product_id === product.id)) return;

        // Không cần fetch price_tiers nữa, chỉ lưu giá gốc
        const basePrice = product.price || 0;

        setCartItems([...cartItems, {
            product_id: product.id,
            product_name: product.name,
            product_code: product.code,
            available_from: product.available_from,
            available_to: product.available_to,
            base_price: basePrice,
            access_type: 'READ',
            from_date: '',
            to_date: ''
        }]);
    };

    const handleRemoveFromCart = (productId) => {
        setCartItems(cartItems.filter(item => item.product_id !== productId));
    };

    const handleUpdateConfig = (index, field, value) => {
        const newCart = [...cartItems];
        newCart[index][field] = value;
        setCartItems(newCart);
    };

    const isStep2Valid = cartItems.length > 0 && cartItems.every(item => {
        if (!item.from_date || !item.to_date) return false;
        if (item.from_date > item.to_date) return false;
        
        // So sánh chuỗi YYYY-MM
        const availFromStr = item.available_from ? item.available_from.substring(0, 7) : null;
        const availToStr = item.available_to ? item.available_to.substring(0, 7) : null;
        
        if (availFromStr && item.from_date < availFromStr) return false;
        if (availToStr && item.to_date > availToStr) return false;
        return true;
    });

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            const payload = {
                reference_code: "",
                notes: notes,
                items: cartItems.map(item => ({
                    product_id: item.product_id,
                    access_type: item.access_type,
                    from_date: `${item.from_date}-01`,
                    to_date: `${item.to_date}-01`
                }))
            };

            await axiosConfig.post(API_ENDPOINTS.USER_REQUEST.CREATE, payload);
            onSuccess(); 
        } catch (err) {
            setError(err.response?.data?.detail || "Error while sending request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="py-20 flex justify-center text-gray-500"><LoaderCircle className="animate-spin w-8 h-8" /></div>;

    return (
        <div className="flex flex-col h-[75vh] bg-white">
            {/* STEPPER */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
                {[
                    { num: 1, label: 'Select product', icon: ShoppingCart },
                    { num: 2, label: 'Select month', icon: Calendar },
                    { num: 3, label: 'Confirm & send', icon: CheckCircle }
                ].map((s) => (
                    <div key={s.num} className={`flex items-center gap-2 ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 font-bold ${step >= s.num ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                            {s.num}
                        </div>
                        <span className="text-sm font-semibold hidden md:block">{s.label}</span>
                    </div>
                ))}
            </div>

            {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                    <span className="font-bold mr-2">Error:</span>{error}
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                
                {/* STEP 1 */}
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map(product => {
                            const isPending = pendingProductIds.has(product.id);
                            const activeAcc = activeAccessMap.get(product.id);
                            const inCart = cartItems.some(i => i.product_id === product.id);

                            return (
                                <div key={product.id} className={`p-4 rounded-xl border ${inCart ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'} transition-all flex flex-col justify-between`}>
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-xs font-mono text-gray-400">{product.code}</p>
                                                <h3 className="font-bold text-gray-900">{product.name}</h3>
                                            </div>
                                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                Starts from ${product.price?.toLocaleString('en-US') || 0}
                                            </span>
                                        </div>

                                        {(product.available_from || product.available_to) && (
                                            <p className="text-xs text-gray-500 mb-2">
                                                Data range: {product.available_from ? product.available_from.substring(0, 7) : 'Any'} ➔ {product.available_to ? product.available_to.substring(0, 7) : 'Now'}
                                            </p>
                                        )}

                                        {activeAcc && (
                                            <div className="mb-2 text-[11px] text-green-700 bg-green-100 px-2 py-1 rounded flex items-center gap-1">
                                                <Info size={12}/> Access granted: {new Date(activeAcc.expires_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>

                                    {isPending ? (
                                        <div className="mt-4 w-full text-center py-2 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed">
                                            Pending
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => inCart ? handleRemoveFromCart(product.id) : handleAddToCart(product)}
                                            className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                                                inCart ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            {inCart ? 'Cancel' : 'Select'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 mb-2">Please select the month period for which you want to access data:</p>
                        
                        {cartItems.map((item, index) => {
                            // Cắt YYYY-MM-DD thành YYYY-MM để truyền vào min/max của thẻ input
                            const minMonth = item.available_from ? item.available_from.substring(0, 7) : undefined;
                            const maxMonth = item.available_to ? item.available_to.substring(0, 7) : undefined;

                            return (
                            <div key={item.product_id} className="p-5 border border-gray-200 rounded-xl bg-gray-50 relative">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-gray-900">{item.product_code} - {item.product_name}</h4>
                                    <button 
                                        onClick={() => handleRemoveFromCart(item.product_id)}
                                        className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                                        title="Remove product"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>

                                {minMonth || maxMonth ? (
                                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mb-3 border border-amber-100">
                                        * Note: This product only allows selection from <b>{minMonth || 'system start'}</b> to <b>{maxMonth || 'now'}</b>.
                                    </p>
                                ) : null}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                                        <select 
                                            value={item.access_type}
                                            onChange={(e) => handleUpdateConfig(index, 'access_type', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg outline-none bg-white text-sm"
                                        >
                                            <option value="READ">READ</option>
                                            <option value="WRITE">WRITE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">From Month</label>
                                        <input 
                                            type="month" 
                                            value={item.from_date}
                                            min={minMonth}
                                            max={maxMonth}
                                            onChange={(e) => handleUpdateConfig(index, 'from_date', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg outline-none bg-white text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">To Month</label>
                                        <input 
                                            type="month" 
                                            value={item.to_date}
                                            min={item.from_date || minMonth}
                                            max={maxMonth}
                                            onChange={(e) => handleUpdateConfig(index, 'to_date', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg outline-none bg-white text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center bg-blue-50/30 px-4 py-3 rounded-lg border border-blue-100">
                                    <span className="text-sm font-medium text-gray-600">
                                        Estimated Time: <b className="text-blue-600">{calculateMonths(item.from_date, item.to_date)} months</b>
                                    </span>
                                    <span className="text-sm font-medium text-gray-600">
                                        Est. Price: <b className="text-xl text-green-600">${getEstimatedPrice(item).toLocaleString('en-US')}</b>
                                    </span>
                                </div>
                            </div>
                        )})}
                    </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Product</th>
                                        <th className="px-4 py-3 text-center">Type</th>
                                        <th className="px-4 py-3 text-right">Access time</th>
                                        <th className="px-4 py-3 text-right">Est. Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cartItems.map(item => (
                                        <tr key={item.product_id}>
                                            <td className="px-4 py-3 font-medium text-gray-900">{item.product_name}</td>
                                            <td className="px-4 py-3 text-center"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{item.access_type}</span></td>
                                            <td className="px-4 py-3 text-gray-600 font-mono text-right">{item.from_date} ➔ {item.to_date}</td>
                                            <td className="px-4 py-3 font-bold text-green-600 text-right">${getEstimatedPrice(item).toLocaleString('en-US')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Note (Optional)</label>
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows="3"
                                placeholder="Write a note to admin..."
                                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* BUTTONS */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                <button 
                    onClick={step === 1 ? onCancel : () => setStep(step - 1)}
                    className="px-5 py-2.5 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium flex items-center gap-2 text-sm transition-colors"
                >
                    {step === 1 ? 'Cancel' : <><ArrowLeft size={16}/>Back</>}
                </button>

                {step < 3 ? (
                    <button 
                        onClick={() => {
                            if (step === 1 && cartItems.length === 0) return setError("Please select at least one product.");
                            if (step === 2 && !isStep2Valid) return setError("Please select valid month range for all products.");
                            setError('');
                            setStep(step + 1);
                        }}
                        disabled={step === 1 && cartItems.length === 0}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Continue <ArrowRight size={16}/>
                    </button>
                ) : (
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 shadow-sm text-sm disabled:opacity-70 transition-colors"
                    >
                        {isSubmitting ? <LoaderCircle className="animate-spin w-4 h-4"/> : <CheckCircle size={16}/>}
                        Send Request
                    </button>
                )}
            </div>
        </div>
    );
};

export default RequestWizard;