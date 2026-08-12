// src/components/user/request/steps/Step2SelectMonth.jsx
import React from 'react';
import { Calendar, Info, Trash2, Check } from 'lucide-react';

const Step2SelectMonth = ({ 
    cartItems, 
    handleRemoveFromCart, 
    handleUpdateConfig, 
    getSubItemPrice 
}) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const currentMonthStr = `${currentYear}-${currentMonth}`; // VD: "2026-08"

    // --- TÍNH TOÁN THÁNG KẾ TIẾP (NEXT MONTH) ---
    const nextMonthDate = new Date(currentYear, today.getMonth() + 1, 1);
    const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <p className="text-sm text-slate-400">Please configure the subscription type and period for each selected product.</p>
            </div>
            
            {cartItems.map((item, index) => {
                const minMonth = item.available_from ? item.available_from.substring(0, 7) : undefined;
                const maxMonth = item.available_to ? item.available_to.substring(0, 7) : undefined;

                const displayHistFrom = item.historical_from ? `${item.historical_from}-01` : '';
                const displayHistTo = item.historical_to ? `${item.historical_to}-01` : '';
                const displayOngoFrom = item.ongoing_from ? `${item.ongoing_from}-01` : '';
                const displayOngoTo = item.ongoing_to ? `${item.ongoing_to}-01` : '';
                
                // ==========================================
                // LƯỚI LỌC 1: HISTORICAL DATA 
                // ==========================================
                const displayHistMinDate = minMonth ? `${minMonth}-01` : undefined;
                let actualHistMaxMonth = currentMonthStr; 
                if (maxMonth && maxMonth < currentMonthStr) {
                    actualHistMaxMonth = maxMonth;
                }
                const displayHistMaxDate = `${actualHistMaxMonth}-01`;
                const histMinToDate = item.historical_from ? `${item.historical_from}-01` : displayHistMinDate;

                const isHistFromInvalid = item.historical_from && (
                    (minMonth && item.historical_from < minMonth) || 
                    (item.historical_from > currentMonthStr)
                );
                const isHistToInvalid = item.historical_to && (
                    item.historical_to > actualHistMaxMonth || 
                    (item.historical_from && item.historical_to < item.historical_from)
                );

                // ==========================================
                // LƯỚI LỌC 2: ONGOING SUBSCRIPTION 
                // ==========================================
                // --- SỬA Ở ĐÂY: Ongoing phải bắt đầu từ Tháng tiếp theo ---
                let actualOngoMinMonth = nextMonthStr;
                if (minMonth && minMonth > nextMonthStr) {
                    actualOngoMinMonth = minMonth;
                }
                const displayOngoMinDate = `${actualOngoMinMonth}-01`;
                const displayOngoMaxDate = maxMonth ? `${maxMonth}-01` : undefined;
                
                const ongoMinToDate = item.ongoing_from ? `${item.ongoing_from}-01` : displayOngoMinDate;

                const isOngoFromInvalid = item.ongoing_from && (
                    item.ongoing_from < actualOngoMinMonth || 
                    (maxMonth && item.ongoing_from > maxMonth)
                );
                const isOngoToInvalid = item.ongoing_to && (
                    (item.ongoing_from && item.ongoing_to < item.ongoing_from) || 
                    (maxMonth && item.ongoing_to > maxMonth)
                );

                const totalProductPrice = getSubItemPrice(item, 'HISTORICAL') + getSubItemPrice(item, 'ONGOING');

                return (
                <div key={item.product_id} className="relative group mb-8">
                    {/* Header Sản phẩm */}
                    <div className="flex justify-between items-center mb-4 pl-3 border-l-4 border-[#3b82f6]">
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-wide">{item.product_name}</h3>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm font-mono text-slate-500">Total Est: <span className="text-[#4ade80] font-bold">${totalProductPrice.toLocaleString('en-US')}</span></span>
                                <select 
                                    value={item.access_type}
                                    onChange={(e) => handleUpdateConfig(index, 'access_type', e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm text-blue-400 cursor-pointer p-0"
                                >
                                    <option value="READ" className="bg-[#111827]">READ ACCESS</option>
                                    <option value="WRITE" className="bg-[#111827]">WRITE ACCESS</option>
                                </select>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleRemoveFromCart(item.product_id)}
                            className="text-slate-500 hover:text-red-400 p-2 bg-slate-800/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove product"
                        >
                            <Trash2 size={18}/>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* --- ONGOING SUBSCRIPTION CARD --- */}
                        <div className={`border rounded-xl transition-all duration-300 ${item.ongoing_selected ? 'bg-[#111827] border-[#3b82f6]/50 shadow-[0_0_15px_rgba(59,130,246,0.05)]' : 'bg-[#0B1121] border-slate-800'}`}>
                            <div 
                                className="flex justify-between items-center p-5 cursor-pointer"
                                onClick={() => handleUpdateConfig(index, 'ongoing_selected', !item.ongoing_selected)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${item.ongoing_selected ? 'bg-[#3b82f6]' : 'border border-slate-600 bg-[#0B1121]'}`}>
                                        {item.ongoing_selected && <Check size={14} className="text-white stroke-[3]"/>}
                                    </div>
                                    <h4 className={`text-lg font-bold ${item.ongoing_selected ? 'text-white' : 'text-slate-400'}`}>Ongoing Subscription</h4>
                                </div>
                                <div className={`text-sm font-mono px-3 py-1 rounded ${item.ongoing_selected ? 'bg-[#064e3b]/30 text-[#4ade80] border border-[#064e3b]' : 'text-slate-500 border border-slate-700'}`}>
                                    ${(item.base_price || 0).toLocaleString('en-US')}/month
                                </div>
                            </div>

                            {item.ongoing_selected && (
                                <div className="p-5 pt-0 border-t border-slate-800/50 mt-2">
                                    <div className="flex flex-col md:flex-row gap-6 mt-4 items-start">
                                        <div className="w-full md:w-1/2">
                                            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">Start Date</label>
                                            <div className={`flex items-center border rounded px-3 py-2.5 transition-colors ${isOngoFromInvalid ? 'border-red-500 bg-red-900/10' : 'border-slate-700 bg-[#0B1121] focus-within:border-[#3b82f6]'}`}>
                                                <Calendar size={16} className="text-slate-500 mr-2 shrink-0"/>
                                                <input 
                                                    type="date" 
                                                    value={displayOngoFrom}
                                                    min={displayOngoMinDate} // CHẶN LỊCH DƯỚI THÁNG TIẾP THEO
                                                    max={displayOngoMaxDate}
                                                    onChange={(e) => {
                                                        const monthVal = e.target.value ? e.target.value.substring(0, 7) : '';
                                                        handleUpdateConfig(index, 'ongoing_from', monthVal);
                                                    }}
                                                    className="w-full bg-transparent outline-none text-sm text-white [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                                                />
                                            </div>
                                            {isOngoFromInvalid && <p className="text-red-400 text-xs mt-1.5">Ongoing subscription must start from {actualOngoMinMonth} or later.</p>}
                                        </div>

                                        <div className="w-full md:w-1/2">
                                            <label className="flex justify-between items-center text-sm text-slate-400 mb-2">
                                                <span>End Date <span className="italic opacity-60">(Optional)</span></span>
                                                {item.ongoing_to && (
                                                    <button 
                                                        onClick={() => handleUpdateConfig(index, 'ongoing_to', '')}
                                                        className="text-[10px] text-[#3b82f6] hover:underline"
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                            </label>
                                            <div className={`flex items-center border rounded px-3 py-2.5 transition-colors ${isOngoToInvalid ? 'border-red-500 bg-red-900/10' : 'border-slate-700 bg-[#0B1121] focus-within:border-[#3b82f6]'}`}>
                                                <Calendar size={16} className="text-slate-500 mr-2 shrink-0"/>
                                                <input 
                                                    type="date" 
                                                    value={displayOngoTo}
                                                    min={ongoMinToDate}
                                                    max={displayOngoMaxDate}
                                                    onChange={(e) => {
                                                        const monthVal = e.target.value ? e.target.value.substring(0, 7) : '';
                                                        handleUpdateConfig(index, 'ongoing_to', monthVal);
                                                    }}
                                                    placeholder="Leave blank for ongoing"
                                                    className={`w-full bg-transparent outline-none text-sm [&::-webkit-calendar-picker-indicator]:filter-[invert(1)] ${!item.ongoing_to ? 'text-slate-500' : 'text-white'}`}
                                                />
                                            </div>
                                            {isOngoToInvalid && <p className="text-red-400 text-xs mt-1.5">End date must be after start date.</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- HISTORICAL DATA CARD --- */}
                        <div className={`border rounded-xl transition-all duration-300 ${item.historical_selected ? 'bg-[#111827] border-[#3b82f6]/50 shadow-[0_0_15px_rgba(59,130,246,0.05)]' : 'bg-[#0B1121] border-slate-800'}`}>
                            <div 
                                className="flex justify-between items-center p-5 cursor-pointer"
                                onClick={() => handleUpdateConfig(index, 'historical_selected', !item.historical_selected)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${item.historical_selected ? 'bg-[#3b82f6]' : 'border border-slate-600 bg-[#0B1121]'}`}>
                                        {item.historical_selected && <Check size={14} className="text-white stroke-[3]"/>}
                                    </div>
                                    <h4 className={`text-lg font-bold ${item.historical_selected ? 'text-white' : 'text-slate-400'}`}>Historical Data</h4>
                                </div>
                                <div className={`text-sm font-mono px-3 py-1 rounded ${item.historical_selected ? 'bg-[#064e3b]/30 text-[#4ade80] border border-[#064e3b]' : 'text-slate-500 border border-slate-700'}`}>
                                    ${(item.base_price || 0).toLocaleString('en-US')}/month
                                </div>
                            </div>

                            {item.historical_selected && (
                                <div className="p-5 pt-0 border-t border-slate-800/50 mt-2">
                                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3.5 mt-4 mb-5 flex items-center gap-2 text-sm text-slate-300">
                                        <Info size={16} className="text-[#3b82f6] shrink-0"/> 
                                        <span>Data available: from <b className="text-white">{minMonth || 'system start'}</b> to <b className="text-white">{actualHistMaxMonth}</b></span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                        <div>
                                            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">Start Date</label>
                                            <div className={`flex items-center border rounded px-3 py-2.5 transition-colors ${isHistFromInvalid ? 'border-red-500 bg-red-900/10' : 'border-slate-700 bg-[#0B1121] focus-within:border-[#3b82f6]'}`}>
                                                <Calendar size={16} className="text-slate-500 mr-2 shrink-0"/>
                                                <input 
                                                    type="date" 
                                                    value={displayHistFrom}
                                                    min={displayHistMinDate}
                                                    max={displayHistMaxDate}
                                                    onChange={(e) => {
                                                        const monthVal = e.target.value ? e.target.value.substring(0, 7) : '';
                                                        handleUpdateConfig(index, 'historical_from', monthVal);
                                                    }}
                                                    className="w-full bg-transparent outline-none text-sm text-white [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                                                />
                                            </div>
                                            {isHistFromInvalid && <p className="text-red-400 text-xs mt-1.5 leading-snug">Cannot start after {actualHistMaxMonth}.</p>}
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">End Date</label>
                                            <div className={`flex items-center border rounded px-3 py-2.5 transition-colors ${isHistToInvalid ? 'border-red-500 bg-red-900/10' : 'border-slate-700 bg-[#0B1121] focus-within:border-[#3b82f6]'}`}>
                                                <Calendar size={16} className="text-slate-500 mr-2 shrink-0"/>
                                                <input 
                                                    type="date" 
                                                    value={displayHistTo}
                                                    min={histMinToDate}
                                                    max={displayHistMaxDate}
                                                    onChange={(e) => {
                                                        const monthVal = e.target.value ? e.target.value.substring(0, 7) : '';
                                                        handleUpdateConfig(index, 'historical_to', monthVal);
                                                    }}
                                                    className="w-full bg-transparent outline-none text-sm text-white [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                                                />
                                            </div>
                                            {isHistToInvalid && <p className="text-red-400 text-xs mt-1.5 leading-snug">Historical data cannot exceed {actualHistMaxMonth}.</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )})}
        </div>
    );
};

export default Step2SelectMonth;