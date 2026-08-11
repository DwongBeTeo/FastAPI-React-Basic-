// src/pages/admin/PriceTierPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import axiosConfig from '../../utils/axiosConfig';
import { Modal } from '../../components/Modal';
import PriceTierList from '../../components/admin/priceTier/PriceTierList';
import PriceTierForm from '../../components/admin/priceTier/PriceTierForm';
import { API_ENDPOINTS } from '../../utils/apiEndPoint';

const PriceTierPage = () => {
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [openModal, setOpenModal] = useState(false);
    const [modalType, setModalType] = useState('ADD');
    const [selectedTier, setSelectedTier] = useState(null);

    // 1. Fetch product list to populate Select Box
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axiosConfig.get(API_ENDPOINTS.ADMIN.GET_ALL_PRODUCTS);
                setProducts(res || []);
                // Automatically select the first product if available
                if (res && res.length > 0) setSelectedProductId(res[0].id);
            } catch (err) {
                console.error("Error loading products:", err);
            }
        };
        fetchProducts();
    }, []);

    // 2. Fetch Price Tiers whenever Product changes
    const fetchTiers = async () => {
        if (!selectedProductId) return;
        try {
            setLoading(true);
            const res = await axiosConfig.get(API_ENDPOINTS.ADMIN_PRICE_TIER.GET_BY_PRODUCT(selectedProductId));
            setTiers(res || []);
        } catch (error) {
            console.error("Error loading price configuration:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTiers();
    }, [selectedProductId]);

    // Functions to open Modal
    const handleOpenAddModal = () => {
        if (!selectedProductId) return alert("Please select a Product before adding a price.");
        setModalType('ADD');
        setSelectedTier(null);
        setOpenModal(true);
    };

    const handleOpenEditModal = (tier) => {
        setModalType('EDIT');
        setSelectedTier(tier);
        setOpenModal(true);
    };

    // API Submit function
    const handleSubmitTier = async (payload) => {
        try {
            if (modalType === 'ADD') {
                await axiosConfig.post(API_ENDPOINTS.ADMIN_PRICE_TIER.CREATE, payload);
            } else {
                await axiosConfig.put(API_ENDPOINTS.ADMIN_PRICE_TIER.UPDATE(selectedTier.id), payload);
            }
            fetchTiers(); // Reload the table
            setOpenModal(false);
        } catch (error) {
            throw error; // Throw error for form to catch and display in red
        }
    };

    // Delete function
    const handleDeleteTier = async (id) => {
        if (!window.confirm("Delete this price configuration?")) return;
        try {
            await axiosConfig.delete(API_ENDPOINTS.ADMIN_PRICE_TIER.DELETE(id));
            fetchTiers();
        } catch (error) {
            alert(error.response?.data?.detail || "Error when deleting.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Price Configuration (Price Tiers)</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage retail/combo prices per month for each product</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 sm:w-64 w-full">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select 
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-sm bg-white font-medium"
                            >
                                <option value="" disabled>-- Select a Product to view --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            onClick={handleOpenAddModal}
                            disabled={!selectedProductId}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors w-full sm:w-auto text-sm font-medium"
                        >
                            <Plus size={18} /> Add New Price Tier
                        </button>
                    </div>
                </div>

                {/* --- CONTENT --- */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading configuration...</div>
                ) : (
                    <PriceTierList 
                        tiers={tiers} 
                        onEdit={handleOpenEditModal} 
                        onDelete={handleDeleteTier} 
                    />
                )}

                {/* --- MODAL --- */}
                <Modal
                    isOpen={openModal}
                    onClose={() => setOpenModal(false)}
                    title={modalType === 'ADD' ? 'Add new price tier' : 'Edit price tier'}
                    fitContent={true}
                >
                    <PriceTierForm 
                        onSubmit={handleSubmitTier}
                        onCancel={() => setOpenModal(false)}
                        initialData={selectedTier}
                        isEditing={modalType === 'EDIT'}
                        productId={selectedProductId}
                    />
                </Modal>
            </div>
        </div>
    );
};

export default PriceTierPage;