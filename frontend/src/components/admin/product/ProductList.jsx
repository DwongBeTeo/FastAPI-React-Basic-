// src/components/admin/product/ProductList.jsx
import React from 'react';
import { Edit, Trash2, Package } from 'lucide-react';

const ProductList = ({ products, onDelete, onEdit }) => {
    return (
        <div className="bg-[#111827] rounded-xl shadow-lg border border-slate-800 overflow-hidden mt-6 text-slate-300">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#0f172a] border-b border-slate-800 text-slate-400 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-4 py-4 w-16 text-center">ID</th>
                            <th className="px-4 py-4 font-semibold tracking-wider">Product Code</th>
                            <th className="px-4 py-4 font-semibold tracking-wider">Name</th>
                            <th className="px-4 py-4 font-semibold tracking-wider">Time</th>
                            <th className="px-4 py-4 font-semibold tracking-wider">Starts From ($)</th>
                            <th className="px-4 py-4 font-semibold tracking-wider">Status</th>
                            <th className="px-4 py-4 font-semibold tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Package className="w-12 h-12 text-slate-600 mb-2" />
                                        <p>There is no product data in the system.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-4 py-4 text-center text-slate-500 font-mono">
                                        #{product.id}
                                    </td>
                                    <td className="px-4 py-4 text-slate-400 font-mono font-medium">
                                        {product.code}
                                    </td>
                                    <td className="px-4 py-4 font-bold text-white">
                                        {product.name}
                                    </td>
                                    
                                    <td className="px-4 py-4 text-xs font-mono text-slate-400">
                                        {product.available_from || 'Any'} <br/> 
                                        ➔ {product.available_to || 'Now'}
                                    </td>

                                    <td className="px-4 py-4 font-bold font-mono text-[#4ade80]">
                                        $ {product.price.toLocaleString('en-US')}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                            product.is_active ? 'bg-[#064e3b]/60 text-[#4ade80] border border-[#064e3b]' : 'bg-slate-800 text-slate-400'
                                        }`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => onEdit && onEdit(product)}
                                                className="p-2 text-blue-400 hover:bg-blue-950/50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => onDelete && onDelete(product.id)}
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

export default ProductList;