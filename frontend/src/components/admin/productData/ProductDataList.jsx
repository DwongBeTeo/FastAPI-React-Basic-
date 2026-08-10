// src/components/admin/productData/ProductDataList.jsx
import React from 'react';
import { Edit, Trash2, DatabaseBackup } from 'lucide-react';

const ProductDataList = ({ dataList, products, onEdit, onDelete }) => {
    // Hàm phụ trợ map product_id ra tên sản phẩm
    const getProductName = (id) => {
        const product = products.find(p => p.id === id);
        return product ? `${product.code} - ${product.name}` : `ID: ${id}`;
    };

    if (dataList.length === 0) {
        return (
            <div className="py-16 bg-white rounded-xl border border-gray-100 text-center flex flex-col items-center">
                <DatabaseBackup className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500">Chưa có bản ghi dữ liệu nào.</p>
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
                            <th className="px-6 py-4">Thuộc Sản phẩm</th>
                            <th className="px-6 py-4">Ngày Dữ Liệu</th>
                            <th className="px-6 py-4">Trích đoạn Nội dung</th>
                            <th className="px-6 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {dataList.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/50 group">
                                <td className="px-6 py-4 text-gray-500 font-mono">#{item.id}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{getProductName(item.product_id)}</td>
                                <td className="px-6 py-4 font-mono text-blue-600">{item.data_date}</td>
                                <td className="px-6 py-4 text-gray-600 truncate max-w-xs font-mono text-xs">
                                    {item.content}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => onDelete(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
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
export default ProductDataList;