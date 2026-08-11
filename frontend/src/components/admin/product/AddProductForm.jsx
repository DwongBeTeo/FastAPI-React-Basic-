// src/components/admin/product/AddProductForm.jsx
import React, { useEffect, useState } from 'react';
import { Save, LoaderCircle } from 'lucide-react';

const AddProductForm = ({ onSubmit, onCancel, initialData, isEditing }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        is_active: true,
        available_from: '',
        available_to: ''
    });

    useEffect(() => {
        if (isEditing && initialData) {
            setFormData({
                name: initialData.name || '',
                price: initialData.price || 0,
                is_active: initialData.is_active !== undefined ? initialData.is_active : true,
                // Lấy ngày có sẵn, nếu null thì gán rỗng để input không lỗi
                available_from: initialData.available_from || '',
                available_to: initialData.available_to || ''
            });
        } else {
            setFormData({
                name: '', price: '', is_active: true, available_from: '', available_to: ''
            });
        }
    }, [initialData, isEditing]);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) return setError('Vui lòng nhập tên sản phẩm.');
        if (formData.price < 0 || formData.price === '') return setError('Giá sản phẩm không hợp lệ.');
        
        // Validate ngày hợp lệ (Từ ngày không được lớn hơn Đến ngày)
        if (formData.available_from && formData.available_to && formData.available_from > formData.available_to) {
            return setError('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
        }

        setIsLoading(true);
        setError('');

        try {
            const payload = { 
                ...formData,
                price: Number(formData.price),
                // Nếu rỗng thì gửi null lên backend
                available_from: formData.available_from || null,
                available_to: formData.available_to || null
            };
            
            const success = await onSubmit(payload);
            
            if (success && !isEditing) {
                setFormData({ name: '', price: '', is_active: true, available_from: '', available_to: '' });
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi lưu dữ liệu, vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col bg-white h-full w-full min-h-0">
            <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
                <div className="flex-1 min-h-0 overflow-y-auto p-5 md:p-6">
                    {error && (
                        <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            <span className="font-medium mr-1">Error:</span> {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-5">
                        {isEditing && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Code of Product</label>
                                <input 
                                    type="text" 
                                    value={initialData?.code || ''}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 outline-none cursor-not-allowed"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name of Product<span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                placeholder="Type..."
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Base Retail Price / Month ($) <span className="text-red-500">*</span></label>
                            <input 
                                type="number" 
                                value={formData.price}
                                onChange={(e) => updateField('price', e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>

                        {/* --- KHU VỰC CHỌN NGÀY --- */}
                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                <input 
                                    type="date" 
                                    value={formData.available_from}
                                    onChange={(e) => updateField('available_from', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                <input 
                                    type="date" 
                                    value={formData.available_to}
                                    min={formData.available_from} // Chặn User không chọn được ngày bé hơn available_from
                                    onChange={(e) => updateField('available_to', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                />
                            </div>
                            <div className="col-span-2 text-xs text-gray-500">
                                * Leave blank if the product has no time limit (always available)..
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select 
                                value={formData.is_active ? 'true' : 'false'}
                                onChange={(e) => updateField('is_active', e.target.value === 'true')}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="py-4 px-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
                    {onCancel && (
                        <button 
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none disabled:opacity-50 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 shadow-sm transition-colors"
                    >
                        {isLoading ? <LoaderCircle className='w-4 h-4 animate-spin'/> : <Save className="w-4 h-4" />}
                        Save Data
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProductForm;