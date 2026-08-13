// src/pages/admin/ProductDataAdmin.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import axiosConfig from '../../utils/axiosConfig';
import { Modal } from '../../components/Modal';
import { API_ENDPOINTS } from '../../utils/apiEndPoint';
import ProductDataList from '../../components/admin/productData/ProductDataList';
import AddProductDataForm from '../../components/admin/productData/AddProductDataForm';

const ProductDataPage = () => {
    const [dataList, setDataList] = useState([]);
    const [products, setProducts] = useState([]); // Used for filter and add new Dropdown
    const [loading, setLoading] = useState(true);
    const [selectedFilterId, setSelectedFilterId] = useState('');

    // Modal state
    const [openModal, setOpenModal] = useState(false);
    const [modalType, setModalType] = useState('ADD');
    const [selectedData, setSelectedData] = useState(null);

    // Get product list (for filter dropdown)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axiosConfig.get(API_ENDPOINTS.ADMIN.GET_ALL_PRODUCTS);
                setProducts(res || []);
            } catch (err) {
                console.error("Error loading products:", err);
            }
        };
        fetchProducts();
    }, []);

    // Get actual data list
    const fetchProductData = async () => {
        try {
            setLoading(true);
            const url = selectedFilterId 
                ? `${API_ENDPOINTS.ADMIN_PRODUCT_DATA.GET_ALL}?product_id=${selectedFilterId}`
                : API_ENDPOINTS.ADMIN_PRODUCT_DATA.GET_ALL;
            
            const res = await axiosConfig.get(url);
            setDataList(res || []);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductData();
    }, [selectedFilterId]);

    const handleOpenAddModal = () => {
        setModalType('ADD');
        setSelectedData(null);
        setOpenModal(true);
    };

    const handleOpenEditModal = (item) => {
        setModalType('EDIT');
        setSelectedData(item);
        setOpenModal(true);
    };

    const handleSubmitData = async (formData) => {
        try {
            if (modalType === 'ADD') {
                await axiosConfig.post(API_ENDPOINTS.ADMIN_PRODUCT_DATA.CREATE, formData);
            } else {
                // Backend Schema Update doesn't require product_id, only data_date and content
                await axiosConfig.put(API_ENDPOINTS.ADMIN_PRODUCT_DATA.UPDATE(selectedData.id), {
                    data_date: formData.data_date,
                    content: formData.content
                });
            }
            fetchProductData();
            setOpenModal(false);
            return true;
        } catch (error) {
            throw error;
        }
    };

    const handleDeleteData = async (id) => {
        if (!window.confirm("Permanently delete this data row?")) return;
        try {
            await axiosConfig.delete(API_ENDPOINTS.ADMIN_PRODUCT_DATA.DELETE(id));
            fetchProductData();
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    return (
        <div className="min-h-screen p-6 text-slate-300">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">System Data Content</h1>
                        <p className="text-slate-400 text-sm mt-1">Manage actual data repository of products</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <select 
                                value={selectedFilterId}
                                onChange={(e) => setSelectedFilterId(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-slate-700 rounded-lg outline-none focus:border-[#4ade80] text-sm bg-[#0B1121] text-white transition-colors"
                            >
                                <option value="" className="bg-[#111827]">All products</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id} className="bg-[#111827]">{p.code} - {p.name}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            onClick={handleOpenAddModal}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4ade80] text-slate-900 rounded-lg hover:bg-[#22c55e] shadow-lg shadow-green-900/20 transition-all font-bold text-sm whitespace-nowrap"
                        >
                            <Plus size={18} /> Add Data
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading data structure...</div>
                ) : (
                    // LƯU Ý: Bạn cần chỉnh sửa màu bên trong ProductDataList
                    <ProductDataList 
                        dataList={dataList} 
                        products={products}
                        onEdit={handleOpenEditModal} 
                        onDelete={handleDeleteData} 
                    />
                )}

                <Modal
                    isOpen={openModal}
                    onClose={() => setOpenModal(false)}
                    title={modalType === 'ADD' ? 'Add new data row' : 'Edit data row'}
                >
                    <AddProductDataForm 
                        onSubmit={handleSubmitData}
                        onCancel={() => setOpenModal(false)}
                        initialData={selectedData}
                        isEditing={modalType === 'EDIT'}
                        products={products}
                    />
                </Modal>
            </div>
        </div>
    );
};
export default ProductDataPage;