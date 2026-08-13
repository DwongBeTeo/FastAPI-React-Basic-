// src/pages/admin/ProductAdmin.jsx
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ProductList from '../../components/admin/product/ProductList';
import { API_ENDPOINTS } from '../../utils/apiEndPoint';
import axiosConfig from '../../utils/axiosConfig';
import AddProductForm from '../../components/admin/product/AddProductForm';
import { Modal } from '../../components/Modal'; 

const ProductAdmin = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // State quản lý Modal
    const [openModal, setOpenModal] = useState(false);
    const [modalType, setModalType] = useState('ADD'); 
    const [selectedProduct, setSelectedProduct] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await axiosConfig.get(API_ENDPOINTS.ADMIN.GET_ALL_PRODUCTS);
            setProducts(data);
        } catch (error) {
            console.error("Lỗi tải danh sách sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleOpenAddModal = () => {
        setModalType('ADD');
        setSelectedProduct(null);
        setOpenModal(true);
    };

    const handleOpenEditModal = (product) => {
        setModalType('EDIT');
        setSelectedProduct(product);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedProduct(null);
    };

    const handleSubmitProduct = async (formData) => {
        try {
            if (modalType === 'ADD') {
                await axiosConfig.post(API_ENDPOINTS.ADMIN.ADD_PRODUCT, formData);
            } else {
                await axiosConfig.put(API_ENDPOINTS.ADMIN.UPDATE_PRODUCT(selectedProduct.id), formData);
            }
            
            fetchProducts(); 
            handleCloseModal(); 
            return true; 
        } catch (error) {
            console.error("Lỗi lưu sản phẩm:", error);
            return false;
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        
        try {
            await axiosConfig.delete(API_ENDPOINTS.ADMIN.DELETE_PRODUCT(productId));
            fetchProducts(); 
        } catch (error) {
            console.error("Lỗi xóa sản phẩm:", error);
        }
    };

    return (
        <div className="min-h-screen p-6 text-slate-300">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Product Management</h1>
                        <p className="text-slate-400 text-sm mt-1">Add, edit, delete product</p>
                    </div>
                    
                    <button 
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#4ade80] text-slate-900 rounded-lg hover:bg-[#22c55e] shadow-lg shadow-green-900/20 transition-all font-bold"
                    >
                        <Plus size={18} />
                        <span>Add product</span>
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading data...</div>
                ) : (
                    <ProductList 
                        products={products} 
                        onDelete={handleDeleteProduct} 
                        onEdit={handleOpenEditModal} 
                    />
                )}

                <Modal
                    isOpen={openModal}
                    onClose={handleCloseModal}
                    title={modalType === 'ADD' ? 'Add new product' : 'Edit product'}
                >
                    
                    <AddProductForm 
                        onSubmit={handleSubmitProduct} 
                        onCancel={handleCloseModal}
                        initialData={selectedProduct}
                        isEditing={modalType === 'EDIT'}
                    />
                </Modal>
            </div>
        </div>
    );
};

export default ProductAdmin;