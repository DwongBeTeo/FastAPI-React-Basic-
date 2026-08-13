// src/components/user/request/steps/Step3Confirm.jsx
import React, { useState } from 'react';
import { Tag, LoaderCircle } from 'lucide-react';
import axiosConfig from '../../../../utils/axiosConfig';

const Step3Confirm = ({ 
    cartItems, 
    notes, 
    setNotes,
    promotionCode,
    setPromotionCode,
    getSubItemPrice 
}) => {
    const [isApplied, setIsApplied] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [promoDetails, setPromoDetails] = useState(null);

    // 1. Tính toán Base Total (Giá gốc chưa giảm)
    let cartTotalEstimate = 0;
    cartItems.forEach(item => {
        cartTotalEstimate += getSubItemPrice(item, 'HISTORICAL');
        cartTotalEstimate += getSubItemPrice(item, 'ONGOING');
    });

    // 2. Tính toán tiền giảm giá dựa vào thông tin API trả về
    let discountAmount = 0;
    let finalTotal = cartTotalEstimate;

    if (isApplied && promoDetails) {
        if (promoDetails.discount_type === 'PERCENTAGE') {
            discountAmount = Math.floor(cartTotalEstimate * (promoDetails.discount_value / 100));
        } else if (promoDetails.discount_type === 'FIXED') {
            discountAmount = promoDetails.discount_value;
        }
        finalTotal = Math.max(0, cartTotalEstimate - discountAmount);
    }

    // 3. Hàm gọi API kiểm tra mã
    const handleApplyPromo = async () => {
        if (!promotionCode || promotionCode.trim() === '') return;
        
        setIsApplying(true);
        setPromoError('');
        setIsApplied(false);
        setPromoDetails(null);

        try {
            // Gọi API kiểm tra mã giảm giá
            const response = await axiosConfig.get(`/promotions/check/${promotionCode.trim().toUpperCase()}`);
            
            // Lưu dữ liệu vào state để tính toán
            setPromoDetails(response);
            setIsApplied(true);
        } catch (error) {
            setPromoError(error.response?.data?.detail || "Invalid or expired promotion code.");
        } finally {
            setIsApplying(false);
        }
    };

    const handlePromoChange = (e) => {
        setPromotionCode(e.target.value.toUpperCase());
        setIsApplied(false);
        setPromoDetails(null);
        setPromoError('');
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-4">
            <div className="mb-6 border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-bold text-white mb-1">Review & Submit</h2>
                <p className="text-sm text-slate-400">Please confirm your terminal access subscription details.</p>
            </div>

            {/* ORDER SUMMARY CARD */}
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 lg:p-8">
                <h3 className="font-bold text-lg mb-5 text-white">Order Summary</h3>
                <div className="space-y-5 divide-y divide-slate-800/70">
                    {cartItems.map((item, idx) => (
                        <div key={item.product_id} className={`pt-5 first:pt-0`}>
                            <h4 className="font-bold text-white text-base mb-3 flex items-center justify-between">
                                <span>{item.product_name} <span className="text-xs font-normal text-slate-400 ml-2 border border-slate-700 px-2 py-0.5 rounded bg-slate-800/50">{item.access_type} ACCESS</span></span>
                            </h4>
                            
                            <div className="space-y-4 pl-3 border-l-2 border-slate-800 ml-1">
                                {item.ongoing_selected && (
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-blue-400">Ongoing Subscription</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {item.ongoing_to ? `${item.ongoing_from} to ${item.ongoing_to}` : `Starting from ${item.ongoing_from}`}
                                            </p>
                                        </div>
                                        <div className="text-sm font-mono text-slate-300">
                                            ${getSubItemPrice(item, 'ONGOING').toLocaleString('en-US')}
                                        </div>
                                    </div>
                                )}
                                
                                {item.historical_selected && (
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-slate-300">Historical Data Access</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{item.historical_from} to {item.historical_to}</p>
                                        </div>
                                        <div className="text-sm font-mono text-slate-300">
                                            ${getSubItemPrice(item, 'HISTORICAL').toLocaleString('en-US')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* DISCOUNT CODE CARD */}
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 lg:p-8">
                <h3 className="font-bold text-sm mb-4 text-slate-400 uppercase tracking-wider">Discount Code</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text"
                            value={promotionCode}
                            onChange={handlePromoChange}
                            placeholder="e.g., WELCOME20"
                            className={`w-full pl-10 pr-4 py-3 bg-[#0B1121] border rounded-lg outline-none text-sm text-white uppercase tracking-wider transition-colors placeholder-slate-600 font-medium ${
                                promoError ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-[#4ade80]'
                            }`}
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={isApplying || isApplied}
                        className={`px-8 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center min-w-[120px] ${
                            isApplied 
                            ? 'bg-slate-800 text-slate-400 cursor-default border border-slate-700' 
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                    >
                        {isApplying ? <LoaderCircle className="w-5 h-5 animate-spin" /> : (isApplied ? 'Applied' : 'Apply')}
                    </button>
                </div>
                
                {promoError && (
                    <p className="text-red-400 text-xs mt-3">{promoError}</p>
                )}

                {isApplied && promoDetails && (
                    <p className="text-[#4ade80] text-xs mt-3 flex items-center gap-1.5 font-medium">
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Code applied successfully. {promoDetails.discount_type === 'PERCENTAGE' ? `${promoDetails.discount_value}%` : `$${promoDetails.discount_value.toLocaleString()}`} off.
                    </p>
                )}
            </div>

            {/* TOTALS CARD */}
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 lg:p-8 space-y-4">
                <div className="flex justify-between items-center text-sm text-slate-400">
                    <span>Original Total</span>
                    <span className="font-mono text-slate-300">${cartTotalEstimate.toLocaleString('en-US')}</span>
                </div>
                
                {isApplied && promoDetails && (
                    <div className="flex justify-between items-center text-sm text-[#4ade80]">
                        <span>Discount ({promotionCode})</span>
                        <span className="font-mono">- ${discountAmount.toLocaleString('en-US')}</span>
                    </div>
                )}
                
                <div className="border-t border-slate-800 pt-5 flex justify-between items-end">
                    <span className="font-bold text-lg text-white">Grand Total</span>
                    <span className="font-bold text-3xl text-[#4ade80] font-mono">${finalTotal.toLocaleString('en-US')}</span>
                </div>
            </div>

            {/* NOTES */}
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 lg:p-8">
                <label className="block text-sm font-bold mb-3 text-slate-300">Note for Admin (Optional)</label>
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    placeholder="Any specific API rate limit requirements or billing instructions..."
                    className="w-full p-4 bg-[#0B1121] border border-slate-700 rounded-lg outline-none focus:border-[#4ade80] text-sm text-slate-300 resize-none transition-colors placeholder-slate-600"
                />
            </div>
        </div>
    );
};

export default Step3Confirm;