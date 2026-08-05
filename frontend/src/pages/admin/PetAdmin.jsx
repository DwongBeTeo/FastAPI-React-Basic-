import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import PetList from '../../components/pets/PetList';
import { API_ENDPOINTS } from '../../utils/apiEndPoint';
import axiosConfig from '../../utils/axiosConfig';
import AddPetForm from '../../components/pets/AddPetForm';
import { Modal } from '../../components/Modal'; // Đảm bảo đường dẫn import Modal đúng

const PetAdmin = () => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);

    // State quản lý Modal
    const [openModal, setOpenModal] = useState(false);
    const [modalType, setModalType] = useState('ADD'); // 'ADD' hoặc 'EDIT'
    const [selectedPet, setSelectedPet] = useState(null);

    const fetchPets = async () => {
        try {
            setLoading(true);
            const data = await axiosConfig.get(API_ENDPOINTS.ADMIN.GET_ALL_PETS);
            setPets(data);
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);

    // --- QUẢN LÝ MODAL ---
    const handleOpenAddModal = () => {
        setModalType('ADD');
        setSelectedPet(null);
        setOpenModal(true);
    };

    const handleOpenEditModal = (pet) => {
        setModalType('EDIT');
        setSelectedPet(pet);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedPet(null);
    };

    // --- HÀNH ĐỘNG GỌI API ---
    
    // Gộp chung hàm Submit cho cả Add và Edit
    const handleSubmitPet = async (formData) => {
        try {
            if (modalType === 'ADD') {
                await axiosConfig.post(API_ENDPOINTS.ADMIN.ADD_PET, formData);
            } else {
                // Lưu ý: Cần thêm UPDATE_PET vào apiEndPoint.js của bạn
                await axiosConfig.put(API_ENDPOINTS.ADMIN.UPDATE_PET(selectedPet.id), formData);
            }
            
            fetchPets(); // Cập nhật lại danh sách
            handleCloseModal(); // Đóng modal
            return true; 
        } catch (error) {
            console.error("Lỗi lưu thú cưng:", error);
            return false;
        }
    };

    const handleDeletePet = async (petId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa dữ liệu này?")) return;
        
        try {
            await axiosConfig.delete(API_ENDPOINTS.ADMIN.DELETE_PET(petId));
            fetchPets(); 
        } catch (error) {
            console.error("Lỗi xóa thú cưng:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý Động Vật</h1>
                        <p className="text-gray-500 text-sm mt-1">Thêm, sửa, xóa động vật trong hệ thống</p>
                    </div>
                    
                    <button 
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all font-medium"
                    >
                        <Plus size={18} />
                        <span>Thêm động vật</span>
                    </button>
                </div>

                {/* Danh sách */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : (
                    <PetList 
                        pets={pets} 
                        onDelete={handleDeletePet} 
                        onEdit={handleOpenEditModal} 
                    />
                )}

                {/* Modal chứa Form */}
                <Modal
                    isOpen={openModal}
                    onClose={handleCloseModal}
                    title={modalType === 'ADD' ? 'Thêm động vật mới' : 'Chỉnh sửa thông tin'}
                    fitContent={true}
                >
                    <AddPetForm 
                        onSubmit={handleSubmitPet} 
                        onCancel={handleCloseModal}
                        initialData={selectedPet}
                        isEditing={modalType === 'EDIT'}
                    />
                </Modal>
            </div>
        </div>
    );
};

export default PetAdmin;