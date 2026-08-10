// src/components/admin/productData/AddProductDataForm.jsx
import React, { useState, useEffect } from 'react';
import { Save, LoaderCircle } from 'lucide-react';

const AddProductDataForm = ({ onSubmit, onCancel, initialData, isEditing, products }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        product_id: '',
        data_date: '',
        content: ''
    });

    useEffect(() => {
        if (isEditing && initialData) {
            setFormData({
                product_id: initialData.product_id,
                data_date: initialData.data_date,
                content: initialData.content
            });
        } else {
            setFormData({ product_id: '', data_date: '', content: '' });
        }
    }, [initialData, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await onSubmit({
                ...formData,
                product_id: Number(formData.product_id)
            });
        } catch (err) {
            setError(err.response?.data?.detail || 'Có lỗi xảy ra khi lưu dữ liệu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 h-full min-h-0 w-full bg-white overflow-hidden">
            <div className="flex-1 p-5 md:p-6 overflow-y-auto custom-scrollbar">
                {error && (
                    <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thuộc Sản phẩm</label>
                        <select
                            value={formData.product_id}
                            onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                            disabled={isEditing} 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-white disabled:bg-gray-100"
                            required
                        >
                            <option value="">-- Chọn Sản phẩm --</option>
                            {products && products.map(p => (
                                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày định danh (Data Date)</label>
                        <input
                            type="date"
                            value={formData.data_date}
                            onChange={(e) => setFormData({...formData, data_date: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung dữ liệu (Content)</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            rows="6"
                            placeholder="Nhập cấu trúc JSON, Markdown hoặc text thuần..."
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-mono text-sm"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Vùng Footer chứa nút bấm: Luôn cố định ở dưới cùng */}
            <div className="py-4 px-6 border-t bg-gray-50 border-gray-100 flex items-center justify-end gap-3 shrink-0">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70"
                >
                    Save Data
                </button>
            </div>
        </form>
    );
};

export default AddProductDataForm;