// src/components/admin/promotion/PromotionForm.jsx
import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

const PromotionForm = ({ initialData, onSave, onCancel, isSubmitting }) => {
    const isEditing = !!initialData;

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'PERCENTAGE',
        discount_value: '',
        expiration_date: '',
        is_active: true
    });

    useEffect(() => {
        if (isEditing && initialData) {
            setFormData({
                code: initialData.code || '',
                description: initialData.description || '',
                discount_type: initialData.discount_type || 'PERCENTAGE',
                discount_value: initialData.discount_value || '',
                expiration_date: initialData.expiration_date || '',
                is_active: initialData.is_active !== undefined ? initialData.is_active : true
            });
        }
    }, [initialData, isEditing]);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const payload = {
            ...formData,
            // Nếu có nhập thì ép chữ hoa, nếu rỗng thì truyền lên null để Backend tự sinh
            code: formData.code.trim() !== '' ? formData.code.toUpperCase() : null, 
            discount_value: parseFloat(formData.discount_value),
            expiration_date: formData.expiration_date || null
        };
        onSave(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-[#111827] text-slate-300 rounded-xl shadow-lg border border-slate-800 p-6 mb-8 relative">
            <button 
                type="button" 
                onClick={onCancel}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-full transition-colors"
            >
                <X size={18} />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">
                {isEditing ? 'Edit Promotion' : 'Create New Promotion'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Code */}
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1.5">
                        Promo Code {isEditing ? <span className="text-red-500">*</span> : ''}
                    </label>
                    <input 
                        type="text" 
                        value={formData.code}
                        onChange={(e) => updateField('code', e.target.value)}
                        placeholder={isEditing ? "" : "Leave blank to auto-generate"}
                        required={isEditing}
                        disabled={isEditing}
                        className="w-full px-4 py-2.5 border border-slate-700 bg-[#0B1121] rounded-lg focus:border-[#4ade80] outline-none uppercase font-mono disabled:bg-slate-900 disabled:text-slate-600 text-white placeholder-slate-600 transition-colors"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1.5">Description</label>
                    <input 
                        type="text" 
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Internal note about this promo..."
                        className="w-full px-4 py-2.5 border border-slate-700 bg-[#0B1121] rounded-lg focus:border-[#4ade80] outline-none text-white placeholder-slate-600 transition-colors"
                    />
                </div>

                {/* Discount Type */}
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1.5">Discount Type <span className="text-red-500">*</span></label>
                    <select 
                        value={formData.discount_type}
                        onChange={(e) => updateField('discount_type', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-700 rounded-lg focus:border-[#4ade80] outline-none bg-[#0B1121] text-white transition-colors"
                    >
                        <option value="PERCENTAGE" className="bg-[#111827]">Percentage (%)</option>
                        <option value="FIXED" className="bg-[#111827]">Fixed Amount ($)</option>
                    </select>
                </div>

                {/* Discount Value */}
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1.5">
                        Discount Value <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                            {formData.discount_type === 'FIXED' ? '$' : '%'}
                        </span>
                        <input 
                            type="number" 
                            min="0.1" 
                            step="0.1"
                            value={formData.discount_value}
                            onChange={(e) => updateField('discount_value', e.target.value)}
                            placeholder={formData.discount_type === 'FIXED' ? "100" : "20"}
                            required
                            className="w-full pl-8 pr-4 py-2.5 border border-slate-700 bg-[#0B1121] rounded-lg focus:border-[#4ade80] outline-none text-white transition-colors"
                        />
                    </div>
                </div>

                {/* Expiration Date */}
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1.5">Expiration Date</label>
                    <input 
                        type="date" 
                        value={formData.expiration_date}
                        onChange={(e) => updateField('expiration_date', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-700 bg-[#0B1121] rounded-lg focus:border-[#4ade80] outline-none text-white [&::-webkit-calendar-picker-indicator]:filter-[invert(1)] transition-colors"
                    />
                    <p className="text-xs text-slate-500 mt-1">Leave blank if the code never expires.</p>
                </div>

                {/* Status */}
                <div className="flex items-center h-full pt-6">
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.is_active}
                            onChange={(e) => updateField('is_active', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ade80] relative"></div>
                        <span className="ml-3 text-sm font-bold text-slate-300">Active</span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-slate-800 pt-5">
                <button 
                    type="button" 
                    onClick={onCancel}
                    className="px-6 py-2.5 border border-slate-700 rounded-lg text-slate-300 bg-slate-800 font-medium hover:bg-slate-700 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#4ade80] text-slate-900 rounded-lg font-bold hover:bg-[#22c55e] disabled:opacity-70 transition-colors shadow-lg shadow-green-900/20"
                >
                    <Save size={18} />
                    {isSubmitting ? 'Saving...' : 'Save Promotion'}
                </button>
            </div>
        </form>
    );
};

export default PromotionForm;