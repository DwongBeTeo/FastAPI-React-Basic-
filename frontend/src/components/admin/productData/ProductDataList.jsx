// src/components/admin/productData/ProductDataList.jsx
import React from 'react';
import { Edit, Trash2, DatabaseBackup } from 'lucide-react';

const ProductDataList = ({ dataList, products, onEdit, onDelete }) => {
    // Helper function to map product_id to product name
    const getProductName = (id) => {
        const product = products.find(p => p.id === id);
        return product ? `${product.code} - ${product.name}` : `ID: ${id}`;
    };

    if (dataList.length === 0) {
        return (
            <div className="py-16 bg-[#111827] rounded-xl border border-slate-800 text-center flex flex-col items-center">
                <DatabaseBackup className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-slate-400">No data records available.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#111827] rounded-xl shadow-lg border border-slate-800 overflow-hidden text-slate-300">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#0f172a] border-b border-slate-800 text-slate-400 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Data Date</th>
                            <th className="px-6 py-4">Content Excerpt</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {dataList.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/30 group transition-colors">
                                <td className="px-6 py-4 text-slate-500 font-mono">#{item.id}</td>
                                <td className="px-6 py-4 font-bold text-white">{getProductName(item.product_id)}</td>
                                <td className="px-6 py-4 font-mono text-[#4ade80]">{item.data_date}</td>
                                <td className="px-6 py-4 text-slate-400 truncate max-w-xs font-mono text-xs">
                                    {item.content}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEdit(item)} className="p-2 text-blue-400 hover:bg-blue-950/50 rounded-lg transition-colors" title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => onDelete(item.id)} className="p-2 text-red-400 hover:bg-red-950/50 rounded-lg transition-colors" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {dataList.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                    No product data records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default ProductDataList;