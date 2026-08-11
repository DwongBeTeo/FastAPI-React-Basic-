// src/components/admin/priceTier/PriceTierForm.jsx
import React, { useState, useEffect } from 'react';
import { Save, LoaderCircle } from 'lucide-react';

const PriceTierForm = ({ onSubmit, onCancel, initialData, isEditing, productId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        min_months: '',
        max_months: '',
        price_per_month: '',
        fixed_package_price: ''
    });

    useEffect(() => {
        if (isEditing && initialData) {
            setFormData({
                min_months: initialData.min_months || '',
                max_months: initialData.max_months || '',
                price_per_month: initialData.price_per_month || '',
                fixed_package_price: initialData.fixed_package_price || ''
            });
        } else {
            setFormData({ min_months: '', max_months: '', price_per_month: '', fixed_package_price: '' });
        }
    }, [initialData, isEditing]);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Handle converting data (string -> number or null)
        const payload = {
            product_id: productId, // Always include the current product ID
            min_months: Number(formData.min_months),
            max_months: formData.max_months === '' ? null : Number(formData.max_months),
            price_per_month: Number(formData.price_per_month),
            fixed_package_price: formData.fixed_package_price === '' ? null : Number(formData.fixed_package_price)
        };

        // Basic UI validation
        if (payload.max_months !== null && payload.min_months > payload.max_months) {
            setError("Minimum months cannot be greater than maximum months.");
            setIsLoading(false);
            return;
        }

        try {
            await onSubmit(payload);
        } catch (err) {
            setError(err.response?.data?.detail || "An error occurred while saving the price configuration.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col bg-white h-full w-full min-h-0">
            <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
                <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar">
                    {error && (
                        <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            <span className="font-medium mr-1">Error:</span> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-5">
                        {/* COLUMN 1: MONTHS */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum months <span className="text-red-500">*</span></label>
                            <input 
                                type="number" min="1"
                                value={formData.min_months}
                                onChange={(e) => updateField('min_months', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum months</label>
                            <input 
                                type="number" min="1"
                                value={formData.max_months}
                                onChange={(e) => updateField('max_months', e.target.value)}
                                placeholder="Leave empty if Infinity"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* COLUMN 2: PRICE */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Retail price/Month ($) <span className="text-red-500">*</span></label>
                            <input 
                                type="number" min="0"
                                value={formData.price_per_month}
                                onChange={(e) => updateField('price_per_month', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Combo price ($)</label>
                            <input 
                                type="number" min="0"
                                value={formData.fixed_package_price}
                                onChange={(e) => updateField('fixed_package_price', e.target.value)}
                                placeholder="Leave empty to use retail price"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <b>Guide:</b> For example, if a customer buys 8 months retail ($100/month), enter Months: 1-11, Retail price: 100, Combo price: Leave empty. For 1-year wholesale ($1000), enter Months: 12-Infinity, Retail price: 0, Combo price: 1000.
                    </div>
                </div>

                <div className="py-4 px-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
                    <button type="button" onClick={onCancel} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors">
                        {isLoading ? <LoaderCircle className='w-4 h-4 animate-spin'/> : <Save className="w-4 h-4" />}
                        Save Configuration
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PriceTierForm;