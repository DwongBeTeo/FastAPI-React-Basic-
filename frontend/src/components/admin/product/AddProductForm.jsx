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
        <div className="flex flex-col bg-[#111827] text-slate-300 h-full w-full min-h-0">
            <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
                <div className="flex-1 min-h-0 overflow-y-auto p-5 md:p-6 space-y-5 custom-scrollbar">
                    {error && (
                        <div className="mb-5 p-3 bg-red-900/30 text-red-400 text-sm rounded-lg border border-red-800 font-medium">
                            <span className="font-bold mr-1">Error:</span> {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-5">
                        {isEditing && (
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-1.5">Code of Product</label>
                                <input 
                                    type="text" 
                                    value={initialData?.code || ''}
                                    disabled
                                    className="w-full px-4 py-2.5 border border-slate-800 rounded-lg bg-slate-900 text-slate-500 outline-none cursor-not-allowed font-mono"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-1.5">Name of Product<span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                placeholder="Type..."
                                className="w-full px-4 py-2.5 bg-[#0B1121] border border-slate-700 rounded-lg focus:border-[#4ade80] outline-none transition-colors text-white placeholder-slate-600"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-1.5">Base Retail Price / Month ($) <span className="text-red-500">*</span></label>
                            <input 
                                type="number" 
                                value={formData.price}
                                onChange={(e) => updateField('price', e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-2.5 bg-[#0B1121] border border-slate-700 rounded-lg focus:border-[#4ade80] outline-none transition-colors text-white placeholder-slate-600"
                                required
                            />
                        </div>

                        {/* --- KHU VỰC CHỌN NGÀY --- */}
                        <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 mt-2">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-1.5">From Date</label>
                                <input 
                                    type="date" 
                                    value={formData.available_from}
                                    onChange={(e) => updateField('available_from', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#0B1121] border border-slate-700 rounded-lg focus:border-[#4ade80] outline-none transition-colors text-sm text-white [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-1.5">To Date</label>
                                <input 
                                    type="date" 
                                    value={formData.available_to}
                                    min={formData.available_from} 
                                    onChange={(e) => updateField('available_to', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#0B1121] border border-slate-700 rounded-lg focus:border-[#4ade80] outline-none transition-colors text-sm text-white [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                                />
                            </div>
                            <div className="col-span-2 text-xs text-slate-500">
                                * Leave blank if the product has no time limit (always available).
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-1.5">Status</label>
                            <select 
                                value={formData.is_active ? 'true' : 'false'}
                                onChange={(e) => updateField('is_active', e.target.value === 'true')}
                                className="w-full px-4 py-2.5 border border-slate-700 rounded-lg outline-none focus:border-[#4ade80] transition-colors bg-[#0B1121] text-white"
                            >
                                <option value="true" className="bg-[#111827]">Active</option>
                                <option value="false" className="bg-[#111827]">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="py-4 px-6 border-t border-slate-800 bg-[#0f172a] flex items-center justify-end gap-3 shrink-0">
                    {onCancel && (
                        <button 
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white focus:outline-none disabled:opacity-50 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-900 bg-[#4ade80] rounded-lg hover:bg-[#22c55e] focus:outline-none disabled:opacity-70 shadow-lg shadow-green-900/20 transition-colors"
                    >
                        {isLoading ? <LoaderCircle className='w-4 h-4 animate-spin text-slate-900'/> : <Save className="w-4 h-4" />}
                        Save Data
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProductForm;