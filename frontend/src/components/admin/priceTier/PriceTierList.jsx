// src/components/admin/priceTier/PriceTierList.jsx
import React from 'react';
import { Edit, Trash2, Layers } from 'lucide-react';

const PriceTierList = ({ tiers, onEdit, onDelete }) => {
    if (tiers.length === 0) {
        return (
            <div className="py-16 bg-white rounded-xl border border-gray-100 text-center flex flex-col items-center">
                <Layers className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500">There is no pricing configuration available for this product yet.</p>
                <p className="text-sm text-gray-400 mt-1">This product is currently free or not yet available for purchase.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Month</th>
                            <th className="px-6 py-4 text-right">$ / Month</th>
                            <th className="px-6 py-4 text-right">$</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tiers.map((tier) => (
                            <tr key={tier.id} className="hover:bg-blue-50/50 group">
                                <td className="px-6 py-4 text-gray-500 font-mono">#{tier.id}</td>
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    From {tier.min_months} {tier.max_months ? `to ${tier.max_months}` : 'to (∞)'} month
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-blue-600 font-medium">
                                    ${tier.price_per_month.toLocaleString('en-US')}
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-green-600 font-medium">
                                    {tier.fixed_package_price !== null ? `$${tier.fixed_package_price.toLocaleString('en-US')}` : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEdit(tier)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => onDelete(tier.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PriceTierList;