// src/components/admin/promotion/PromotionList.jsx
import React from 'react';
import { Edit2, Trash2, Tag, Percent, DollarSign } from 'lucide-react';

const PromotionList = ({ promotions, onEdit, onDelete }) => {
    
    // Format hiển thị giá trị giảm giá
    const formatDiscount = (type, value) => {
        if (type === 'PERCENTAGE') return <span className="text-blue-600 font-bold">{value}%</span>;
        return <span className="text-green-600 font-bold">${value.toLocaleString('en-US')}</span>;
    };

    return (
        <div className="bg-[#111827] text-slate-300 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#0f172a] border-b border-slate-800 text-slate-400 uppercase tracking-wider text-xs">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Promo Code</th>
                            <th className="px-6 py-4 font-semibold">Description</th>
                            <th className="px-6 py-4 font-semibold">Discount Type</th>
                            <th className="px-6 py-4 font-semibold">Value</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold">Expires On</th>
                            <th className="px-6 py-4 font-semibold">Min Order ($)</th>
                            <th className="px-6 py-4 font-semibold">Quantity Left</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {promotions.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                    No promotions found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            promotions.map((promo) => (
                                <tr key={promo.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 font-mono font-bold text-white">
                                            <Tag size={16} className="text-[#4ade80]"/>
                                            {promo.code}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate">
                                        {promo.description || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-300">
                                            {promo.discount_type === 'PERCENTAGE' ? <Percent size={14}/> : <DollarSign size={14}/>}
                                            <span className="text-xs font-semibold uppercase tracking-wide">
                                                {promo.discount_type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-base font-mono font-bold text-[#4ade80]">
                                        {formatDiscount(promo.discount_type, promo.discount_value)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                                            promo.is_active ? 'bg-[#064e3b]/60 text-[#4ade80] border border-[#064e3b]' : 'bg-slate-800 text-slate-500'
                                        }`}>
                                            {promo.is_active ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {promo.expiration_date ? new Date(promo.expiration_date).toLocaleDateString() : <span className="text-slate-600 italic">Never expires</span>}
                                    </td>
                                    
                                    {/* Min_order_value */}
                                    <td className="px-6 py-4 text-slate-300 font-mono">
                                        {promo.min_order_value > 0 ? (
                                            <span className="text-yellow-400 font-bold">${promo.min_order_value.toLocaleString()}</span>
                                        ) : (
                                            <span className="text-slate-500">Any</span>
                                        )}
                                    </td>

                                    {/* quantity */}
                                    <td className="px-6 py-4 font-mono">
                                        {promo.quantity !== null && promo.quantity !== undefined ? (
                                            <span className={`font-bold ${promo.quantity === 0 ? 'text-red-400' : 'text-slate-300'}`}>
                                                {promo.quantity} {promo.quantity <= 0 && <span className="text-xs ml-1 font-sans text-red-500/80">(Sold out)</span>}
                                            </span>
                                        ) : (
                                            <span className="text-slate-500 italic font-sans text-sm">Unlimited</span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => onEdit(promo)}
                                                className="p-2 text-blue-400 hover:bg-blue-950/50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => onDelete(promo.id)}
                                                className="p-2 text-red-400 hover:bg-red-950/50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PromotionList;