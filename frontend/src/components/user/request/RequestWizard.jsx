// src/components/user/request/RequestWizard.jsx
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Calendar, CheckCircle, ArrowRight, ArrowLeft, Trash2, Info, LoaderCircle } from 'lucide-react';
import axiosConfig from '../../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../../utils/apiEndPoint';

const RequestWizard = ({ onSuccess, onCancel,initialProduct = null }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Dữ liệu từ API
    const [products, setProducts] = useState([]);
    const [pendingProductIds, setPendingProductIds] = useState(new Set());
    const [activeAccessMap, setActiveAccessMap] = useState(new Map());

    // State form (Giỏ hàng và Ghi chú)
    const [cartItems, setCartItems] = useState([]);
    const [notes, setNotes] = useState('');

    // Fetch 3 API cùng lúc khi mở Wizard
    useEffect(() => {
        const fetchWizardData = async () => {
            setIsLoading(true);
            try {
                const [prodRes, reqRes, accRes] = await Promise.all([
                    axiosConfig.get(`${API_ENDPOINTS.USER.GET_AVAILABLE_PRODUCTS}?skip=0&limit=100`),
                    axiosConfig.get(API_ENDPOINTS.USER_REQUEST.GET_MINE),
                    axiosConfig.get(API_ENDPOINTS.USER_ACCESS.GET_MINE)
                ]);

                setProducts(prodRes || []);

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

                // --- LOGIC MỚI BỔ SUNG VÀO ĐÂY ---
                // Nếu Wizard được mở bằng nút "Mua ngay" từ 1 sản phẩm cụ thể
                if (initialProduct) {
                    // Kiểm tra xem sản phẩm này đã bị PENDING chưa, nếu chưa thì tự động đưa vào giỏ
                    if (!pIds.has(initialProduct.id)) {
                        const fullProduct = (prodRes || []).find(p => p.id === initialProduct.id) || initialProduct;
                        setCartItems([{
                            product_id: fullProduct.id,
                            product_name: fullProduct.name,
                            product_code: fullProduct.code,
                            available_from: fullProduct.available_from,
                            available_to: fullProduct.available_to,
                            access_type: 'READ',
                            from_date: '',
                            to_date: ''
                        }]);
                        setStep(2); // Tự động nhảy thẳng sang Bước 2 (Bắt user chọn ngày)
                    }
                }

            } catch (err) {
                console.error("Lỗi tải dữ liệu Wizard:", err);
                setError("Không thể tải dữ liệu khởi tạo. Vui lòng thử lại.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchWizardData();
    }, [initialProduct]);

    // --- STEP 1 HANDLERS: CHỌN SẢN PHẨM ---
    const toggleCartItem = (product) => {
        const isExists = cartItems.find(item => item.product_id === product.id);
        if (isExists) {
            setCartItems(cartItems.filter(item => item.product_id !== product.id));
        } else {
            setCartItems([...cartItems, {
                product_id: product.id,
                product_name: product.name,
                product_code: product.code,
                available_from: product.available_from, // Lấy mốc giới hạn từ sản phẩm
                available_to: product.available_to,
                access_type: 'READ',
                from_date: '',
                to_date: ''
            }]);
        }
    };

    // --- STEP 2 HANDLERS: CẤU HÌNH NGÀY ---
    const handleUpdateConfig = (index, field, value) => {
        const newCart = [...cartItems];
        newCart[index][field] = value;
        setCartItems(newCart);
    };

    // Kiểm tra xem tất cả các item trong giỏ đã điền đủ ngày và hợp lệ chưa (dùng cho UX mờ nút Tiếp tục)
    const isStep2Valid = cartItems.length > 0 && cartItems.every(item => {
        if (!item.from_date || !item.to_date) return false;
        if (item.from_date > item.to_date) return false;
        // Kiểm tra chặn theo available_from / available_to của sản phẩm
        if (item.available_from && item.from_date < item.available_from) return false;
        if (item.available_to && item.to_date > item.available_to) return false;
        return true;
    });

    // --- STEP 3: SUBMIT ---
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
                    from_date: item.from_date,
                    to_date: item.to_date
                }))
            };

            await axiosConfig.post(API_ENDPOINTS.USER_REQUEST.CREATE, payload);
            onSuccess(); 
        } catch (err) {
            setError(err.response?.data?.detail || "Có lỗi khi gửi yêu cầu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="py-20 flex justify-center text-gray-500"><LoaderCircle className="animate-spin w-8 h-8" /></div>;

    return (
        <div className="flex flex-col h-[75vh] bg-white">
            {/* TIẾN TRÌNH (Stepper) */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
                {[
                    { num: 1, label: 'Select product', icon: ShoppingCart },
                    { num: 2, label: 'Select date', icon: Calendar },
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

            {/* ERROR MESSAGE */}
            {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                    <span className="font-bold mr-2">Error:</span>{error}
                </div>
            )}

            {/* NỘI DUNG TỪNG BƯỚC */}
            <div className="flex-1 overflow-y-auto p-6">
                
                {/* STEP 1: CHỌN SẢN PHẨM */}
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
                                                {product.price.toLocaleString('vi-VN')} đ
                                            </span>
                                        </div>

                                        {/* Hiển thị giới hạn ngày của sản phẩm (nếu có) */}
                                        {(product.available_from || product.available_to) && (
                                            <p className="text-xs text-gray-500 mb-2">
                                                Data range: {product.available_from || 'Any'} ➔ {product.available_to || 'Now'}
                                            </p>
                                        )}

                                        {/* Cảnh báo Quyền đang có */}
                                        {activeAcc && (
                                            <div className="mb-2 text-[11px] text-green-700 bg-green-100 px-2 py-1 rounded flex items-center gap-1">
                                                <Info size={12}/> Access granted: {new Date(activeAcc.expires_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Nút Chọn / Bỏ chọn */}
                                    {isPending ? (
                                        <div className="mt-4 w-full text-center py-2 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed">
                                            Pending
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => toggleCartItem(product)}
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

                {/* STEP 2: CẤU HÌNH NGÀY (Sử dụng input type="date" chặn giới hạn) */}
                {step === 2 && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 mb-2">Please select the time period for which you want to access data for each product:</p>
                        
                        {cartItems.map((item, index) => (
                            <div key={item.product_id} className="p-5 border border-gray-200 rounded-xl bg-gray-50 relative">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-gray-900">{item.product_code} - {item.product_name}</h4>
                                    <button 
                                        onClick={() => toggleCartItem({ id: item.product_id })}
                                        className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                                        title="Xóa sản phẩm"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>

                                {item.available_from || item.available_to ? (
                                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mb-3">
                                        * Note: This product only allows selection from <b>{item.available_from || 'system'}</b> to <b>{item.available_to || 'now'}</b>.
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
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Từ ngày (From Date)</label>
                                        <input 
                                            type="date" 
                                            value={item.from_date}
                                            min={item.available_from || undefined}
                                            max={item.available_to || undefined}
                                            onChange={(e) => handleUpdateConfig(index, 'from_date', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg outline-none bg-white text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
                                        <input 
                                            type="date" 
                                            value={item.to_date}
                                            min={item.from_date || item.available_from || undefined}
                                            max={item.available_to || undefined}
                                            onChange={(e) => handleUpdateConfig(index, 'to_date', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg outline-none bg-white text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* STEP 3: XÁC NHẬN & GỬI */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Product</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Access time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cartItems.map(item => (
                                        <tr key={item.product_id}>
                                            <td className="px-4 py-3 font-medium text-gray-900">{item.product_name}</td>
                                            <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{item.access_type}</span></td>
                                            <td className="px-4 py-3 text-gray-600 font-mono">{item.from_date} ➔ {item.to_date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Note</label>
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows="3"
                                placeholder="Reason..."
                                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* THANH ĐIỀU HƯỚNG DƯỚI CÙNG */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                <button 
                    onClick={step === 1 ? onCancel : () => setStep(step - 1)}
                    className="px-5 py-2.5 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium flex items-center gap-2 text-sm"
                >
                    {step === 1 ? 'Hủy bỏ' : <><ArrowLeft size={16}/>Back</>}
                </button>

                {step < 3 ? (
                    <button 
                        onClick={() => {
                            if (step === 1 && cartItems.length === 0) return setError("Vui lòng chọn ít nhất 1 sản phẩm.");
                            if (step === 2 && !isStep2Valid) return setError("Vui lòng chọn ngày hợp lệ cho tất cả sản phẩm trước khi tiếp tục.");
                            setError('');
                            setStep(step + 1);
                        }}
                        disabled={step === 1 && cartItems.length === 0}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Go on <ArrowRight size={16}/>
                    </button>
                ) : (
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 shadow-sm text-sm disabled:opacity-70"
                    >
                        {isSubmitting ? <LoaderCircle className="animate-spin w-4 h-4"/> : <CheckCircle size={16}/>}
                        Send request to admin
                    </button>
                )}
            </div>
        </div>
    );
};

export default RequestWizard;