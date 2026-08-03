import { useState } from 'react';

export default function PetForm({ onAddPet }) {
    const [name, setName] = useState('');
    const [species, setSpecies] = useState('Cá Koi');

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        
        if (!name.trim()) {
            return alert("Vui lòng nhập tên!");
        }
        
        const isSuccess = await onAddPet({ name, species });
        
        if (isSuccess) {
            setName('');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
                type="text" 
                placeholder="Nhập tên..." 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <select 
                value={species} 
                onChange={(e) => setSpecies(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
                <option value="Cá Koi">Cá Koi</option>
                <option value="Cá Betta">Cá Betta</option>
                <option value="Chó">Chó</option>
                <option value="Mèo">Mèo</option>
            </select>
            <button 
                type="submit" 
                style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Thêm mới
            </button>
        </form>
    );
}