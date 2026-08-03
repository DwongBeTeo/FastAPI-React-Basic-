export default function PetList({ pets, onDeletePet }) {
    if (!pets || pets.length === 0) {
        return <p style={{ color: '#666', fontStyle: 'italic' }}>Chưa có dữ liệu nào trong Database.</p>;
    }

    return (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {pets.map(pet => (
                <li key={pet.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '12px 10px', 
                    borderBottom: '1px solid #eee' 
                }}>
                    <span>
                        <strong>{pet.name}</strong> 
                        <span style={{ color: '#666', marginLeft: '5px' }}>({pet.species})</span>
                    </span>
                    <button 
                        onClick={() => onDeletePet(pet.id)} 
                        style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Xóa
                    </button>
                </li>
            ))}
        </ul>
    );
}