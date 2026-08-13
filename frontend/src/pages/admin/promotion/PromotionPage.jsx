// src/pages/admin/promotion/PromotionPage.jsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, LoaderCircle } from 'lucide-react';
import axiosConfig from '../../../utils/axiosConfig';
import PromotionList from '../../../components/admin/promotion/PromotionList';
import PromotionForm from '../../../components/admin/promotion/PromotionForm';
import { API_ENDPOINTS } from '../../../utils/apiEndPoint';

const PromotionPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State quản lý Form
    const [showForm, setShowForm] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const res = await axiosConfig.get(API_ENDPOINTS.ADMIN.PROMOTIONS.LIST);
            setPromotions(res || []);
        } catch (err) {
            setError('Cannot load promotions from server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    // --- HANDLERS ---
    const handleAddNew = () => {
        setEditingPromo(null);
        setShowForm(true);
        setError('');
    };

    const handleEdit = (promo) => {
        setEditingPromo(promo);
        setShowForm(true);
        setError('');
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingPromo(null);
    };

    const handleSave = async (payload) => {
        setIsSubmitting(true);
        setError('');
        try {
            if (editingPromo) {
                // UPDATE
                await axiosConfig.put(API_ENDPOINTS.ADMIN.PROMOTIONS.UPDATE(editingPromo.id), payload);
            } else {
                // CREATE
                await axiosConfig.post(API_ENDPOINTS.ADMIN.PROMOTIONS.CREATE, payload);
            }
            setShowForm(false);
            fetchPromotions(); // Refresh danh sách
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to save promotion.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this promotion code?")) return;
        try {
            await axiosConfig.delete(API_ENDPOINTS.ADMIN.PROMOTIONS.DELETE(id));
            fetchPromotions();
        } catch (err) {
            alert(err.response?.data?.detail || "Error deleting promotion.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 text-slate-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Promotion Codes</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage discount rules and coupons for customers.</p>
                </div>
                {!showForm && (
                    <button 
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#4ade80] text-slate-900 rounded-lg font-bold hover:bg-[#22c55e] transition-colors shadow-lg shadow-green-900/20"
                    >
                        <PlusCircle size={18}/> New Promotion
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-900/30 text-red-400 border border-red-800 rounded-lg text-sm font-medium">
                    <b>Error:</b> {error}
                </div>
            )}

            {showForm && (
                <PromotionForm 
                    initialData={editingPromo} 
                    onSave={handleSave} 
                    onCancel={handleCancelForm}
                    isSubmitting={isSubmitting}
                />
            )}

            {loading ? (
                <div className="flex justify-center py-20 text-slate-500">
                    <LoaderCircle className="animate-spin w-8 h-8" />
                </div>
            ) : (
                <PromotionList 
                    promotions={promotions} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                />
            )}
        </div>
    );
};

export default PromotionPage;