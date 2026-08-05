// src/pages/user/pet/PetDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Info, Heart } from 'lucide-react';
import axiosConfig from '../../utils/axiosConfig';

const PetDetailPage = () => {
    const { id } = useParams();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPetDetail = async () => {
            try {
                setLoading(true);
                const response = await axiosConfig.get(`/api/v1/pets/${id}`);
                setPet(response);
            } catch (err) {
                console.error("Lỗi tải chi tiết:", err);
                setError('information of this pet was not found.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPetDetail();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
    
    if (error || !pet) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <p className="text-red-500">{error}</p>
            <Link to="/pets" className="text-blue-600 hover:underline">Comback PetList</Link>
        </div>
    );

    const imageUrl = pet.image || 'https://via.placeholder.com/600x600?text=No+Image';

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-5xl mx-auto px-5 md:px-10">
                
                {/* Nút Back */}
                <Link to="/pets" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 transition-colors">
                    <ArrowLeft size={16} /> Comeback List
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                    {/* Hình ảnh */}
                    <div className="w-full md:w-1/2 h-[400px] md:h-[500px] bg-gray-100 relative">
                        <img 
                            src={imageUrl} 
                            alt={pet.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/600x600?text=No+Image' }}
                        />
                    </div>

                    {/* Nội dung chi tiết */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${pet.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {pet.status === 'Active' ? 'Sẵn sàng' : 'Không có sẵn'}
                            </span>
                        </div>
                        
                        <p className="text-lg text-gray-500 mb-6">{pet.breed || 'Not Update Yet'}</p>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 border-y border-gray-100 py-6">
                            <div>
                                <p className="text-xs text-gray-400 mb-1 uppercase font-semibold">Species</p>
                                <p className="font-medium text-gray-900">{pet.species}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1 uppercase font-semibold">Gender</p>
                                <p className="font-medium text-gray-900">{pet.gender || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="mb-8 flex-1">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                                <Info size={16} className="text-blue-500" /> About {pet.name}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                {pet.description || 'There is no description available for this little one yet. Please contact the rescue center for more details.'}
                            </p>
                        </div>

                        <button 
                            disabled={pet.status !== 'Active'}
                            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Heart size={20} /> Adoption request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetDetailPage;