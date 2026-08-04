import React, { useState, useEffect } from 'react';
import PetList from '../../components/pets/PetList';
import { API_ENDPOINTS } from '../../utils/apiEndPoint';
import axiosConfig from '../../utils/axiosConfig';
import AddPetForm from '../../components/pets/AddPetForm';

const PetAdmin = () => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleAddPet = async (newPet) => {
        try {
            await axiosConfig.post(API_ENDPOINTS.ADMIN.ADD_PET, newPet);
            fetchPets(); 
            return true; 
        } catch (error) {
            console.error("Lỗi thêm thú cưng:", error);
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

    const handleEditPet = (pet) => {
        console.log("Tính năng Edit đang phát triển. Dữ liệu:", pet);
        alert(`Đang phát triển tính năng sửa cho cá: ${pet.name}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Cá Cảnh</h1>
                    <p className="text-gray-500 text-sm mt-1">Thêm, sửa, xóa danh mục cá cảnh trong hệ thống</p>
                </div>

                <AddPetForm onAdd={handleAddPet} />

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : (
                    <PetList 
                        pets={pets} 
                        onDelete={handleDeletePet} 
                        onEdit={handleEditPet} 
                    />
                )}
            </div>
        </div>
    );
};

export default PetAdmin;