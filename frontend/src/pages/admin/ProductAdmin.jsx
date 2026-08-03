import { useEffect, useState } from 'react';
import PetForm from '../../components/pets/PetForm'
import PetList from '../../components/pets/PetList';

export default function ProductAdmin() {
    const [pets, setPets] = useState([]);

    const fetchPets = async () => {
        try {
            const response = await fetch('http://localhost:8000/pets/');
            const data = await response.json();
            setPets(data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);

    const handleAddPet = async (petData) => {
        try {
            const response = await fetch('http://localhost:8000/pets/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(petData)
            });
            if (response.ok) {
                fetchPets(); 
                return true; 
            }
        } catch (error) {
            console.error("Lỗi khi thêm mới:", error);
        }
        return false;
    };

    const handleDeletePet = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/pets/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchPets(); 
            }
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
        }
    };

    return (
        <div className="container" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Quản lý Thú cưng / Cá cảnh</h2>
            <PetForm onAddPet={handleAddPet} />
            <hr style={{ margin: '20px 0', borderTop: '1px solid #eee' }} />
            <PetList pets={pets} onDeletePet={handleDeletePet} />
        </div>
    );
}