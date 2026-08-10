// src/components/admin/product/ProductList.jsx
import React from 'react';
import { Edit, Trash2, Package } from 'lucide-react';

const ProductList = ({ products, onDelete, onEdit }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-4 w-16 text-center">ID</th>
                            <th className="px-4 py-4 font-semibold tracking-wider">Product Code</th>
                            <th className="px-4 py-4 font-semibold tracking-wider">Name</th>
                            <th className="px-4 py-4 font-semibold tracking-wider">Time</th>
                            <th className="px-4 py-4 font-semibold tracking-wider">Price</th>
                            <th className="px-4 py-4 font-semibold tracking-wider">Status</th>
                            <th className="px-4 py-4 font-semibold tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Package className="w-12 h-12 text-gray-300 mb-2" />
                                        <p>There is no product data in the system.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-4 py-4 text-center text-gray-500 font-mono">
                                        #{product.id}
                                    </td>
                                    <td className="px-4 py-4 text-gray-600 font-mono font-medium">
                                        {product.code}
                                    </td>
                                    <td className="px-4 py-4 font-medium text-gray-900">
                                        {product.name}
                                    </td>
                                    
                                    {/* CỘT MỚI: Hiển thị Available From -> To */}
                                    <td className="px-4 py-4 text-xs font-mono text-gray-500">
                                        {product.available_from || 'Any'} <br/> 
                                        ➔ {product.available_to || 'Now'}
                                    </td>

                                    <td className="px-4 py-4 font-semibold text-blue-600">
                                        {product.price.toLocaleString('vi-VN')} đ
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => onEdit && onEdit(product)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => onDelete && onDelete(product.id)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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