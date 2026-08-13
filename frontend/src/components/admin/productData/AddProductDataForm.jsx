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
            setError(err.response?.data?.detail || 'An error occurred while saving data.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 h-full min-h-0 w-full bg-[#111827] text-slate-300 overflow-hidden">
            <div className="flex-1 p-5 md:p-6 overflow-y-auto custom-scrollbar space-y-4">
                {error && (
                    <div className="mb-5 p-3 bg-red-900/30 text-red-400 text-sm rounded-lg border border-red-800 font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-1.5">Product</label>
                        <select
                            value={formData.product_id}
                            onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                            disabled={isEditing} 
                            className="w-full px-4 py-2.5 border border-slate-700 rounded-lg outline-none focus:border-[#4ade80] bg-[#0B1121] text-white disabled:bg-slate-900 disabled:text-slate-500 transition-colors"
                            required
                        >
                            <option value="" className="bg-[#111827]">-- Select Product --</option>
                            {products && products.map(p => (
                                <option key={p.id} value={p.id} className="bg-[#111827]">{p.code} - {p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-1.5">Data Date</label>
                        <input
                            type="date"
                            value={formData.data_date}
                            onChange={(e) => setFormData({...formData, data_date: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-700 rounded-lg outline-none focus:border-[#4ade80] bg-[#0B1121] text-white transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-1.5">Content</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            rows="6"
                            placeholder="Enter JSON structure, Markdown, or plain text..."
                            className="w-full px-4 py-3 border border-slate-700 rounded-lg outline-none focus:border-[#4ade80] bg-[#0B1121] text-white font-mono text-sm transition-colors placeholder-slate-600"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Footer area containing buttons */}
            <div className="py-4 px-6 border-t bg-[#0f172a] border-slate-800 flex items-center justify-end gap-3 shrink-0">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-900 bg-[#4ade80] rounded-lg hover:bg-[#22c55e] disabled:opacity-70 transition-colors shadow-lg shadow-green-900/20"
                >
                    Save Data
                </button>
            </div>
        </form>
    );
};

export default AddProductDataForm;