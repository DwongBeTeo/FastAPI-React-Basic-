// src/components/user/pet/PetCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PetCard = ({ pet }) => {
    // Xử lý ảnh mặc định nếu không có
    const imageUrl = pet.image || 'https://via.placeholder.com/400x300?text=No+Image';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
            {/* Image Wrapper */}
            <div className="relative h-48 w-full overflow-hidden bg-gray-100 shrink-0">
                <img 
                    src={imageUrl} 
                    alt={pet.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image' }}
                />
                {/* Badge Species (Dog/car) */}
                {pet.species && (
                    <span className="absolute top-3 right-3 bg-teal-400 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                        {pet.species}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{pet.name}</h3>
                
                {/* <p className="text-sm text-gray-500 mb-3 truncate">
                    {pet.breed || 'Chưa rõ giống'} • {pet.gender || 'Chưa rõ giới tính'}
                </p> */}
                <div className="text-sm text-gray-500 mb-2 truncate flex justify-between">
                    <span>{pet.breed || 'Chưa rõ giống'} • {pet.gender || 'Chưa rõ'}</span>
                </div>
                
                <p className="text-lg font-bold text-blue-600 mb-2">
                    {pet.price ? `${pet.price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                </p>


                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-500">
                        Gender: {pet.gender || 'N/A'}
                    </span>
                    <Link 
                        to={`/pets/${pet.id}`} 
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Detail
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PetCard;