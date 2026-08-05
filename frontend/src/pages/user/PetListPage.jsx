// src/pages/user/pet/PetListPage.jsx
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import axiosConfig from '../../utils/axiosConfig';

const PetListPage = () => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        search: '',
        species: '',
        gender: '',
        price: ''
    });

    useEffect(() => {
        const fetchPets = async () => {
            try {
                setLoading(true);
                const response = await axiosConfig.get('/pets/?skip=0&limit=100');
                setPets(response || []);
            } catch (error) {
                console.error("Error loading pet list:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPets();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Logic filter data
    const filteredPets = pets.filter(pet => {
        const matchSearch = pet.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                            (pet.breed && pet.breed.toLowerCase().includes(filters.search.toLowerCase()));
        const matchSpecies = filters.species === '' || pet.species === filters.species;
        const matchGender = filters.gender === '' || pet.gender === filters.gender;
        
        // Show only Active
        const isActive = pet.status === 'Active';
        const matchPrice = filters.maxPrice === '' || (pet.price && pet.price <= Number(filters.maxPrice));
    
        return matchSearch && matchSpecies && matchGender && isActive && matchPrice;
    });

    return (
        <div className="bg-gray-50 min-h-screen pb-12 pt-6">
            <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-20 flex flex-col md:flex-row gap-8">
                
                {/* --- Left column: Filter (SIDEBAR) --- */}

                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Filter</h2>

                        {/* Search */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Tên hoặc giống..." 
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* (Species) */}
                        <div className="mb-5 border-t border-gray-100 pt-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loài</label>
                            <select 
                                name="species"
                                value={filters.species}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            >
                                <option value="">All</option>
                                <option value="Chó">Dog</option>
                                <option value="Mèo">Cat</option>
                                <option value="Khác">Another</option>
                            </select>
                        </div>

                        {/* Age (UI Mock) */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Độ tuổi</label>
                            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-white">
                                <option>All</option>
                                <option>Baby</option>
                                <option>Adult</option>
                            </select>
                        </div>

                        {/* Max-Min Price */}
                        <div className="mb-5 border-t border-gray-100 pt-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mức giá tối đa</label>
                            <select 
                                name="maxPrice"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            >
                                <option value="">Tất cả mức giá</option>
                                <option value="1000000">Dưới 1,000,000 đ</option>
                                <option value="5000000">Dưới 5,000,000 đ</option>
                                <option value="10000000">Dưới 10,000,000 đ</option>
                            </select>
                        </div>

                        {/* Gender */}
                        <div className="mb-5 border-t border-gray-100 pt-5">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Giới tính</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                                    <input 
                                        type="radio" 
                                        name="gender" 
                                        value="Đực"
                                        checked={filters.gender === 'male'}
                                        onChange={handleFilterChange}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                                    />
                                    Male
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                                    <input 
                                        type="radio" 
                                        name="gender" 
                                        value="Cái"
                                        checked={filters.gender === 'female'}
                                        onChange={handleFilterChange}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                                    />
                                    Female
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                                    <input 
                                        type="radio" 
                                        name="gender" 
                                        value=""
                                        checked={filters.gender === ''}
                                        onChange={handleFilterChange}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                                    />
                                    All
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Right column: Pet List --- */}
                <div className="flex-1">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Pets waiting for adoption</h1>
                        <p className="text-gray-500 mt-1">Find {filteredPets.length} matching result</p>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center text-gray-500">Loading...</div>
                    ) : filteredPets.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPets.map(pet => (
                                <PetCard key={pet.id} pet={pet} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-white rounded-xl border border-gray-100 shadow-sm text-gray-500">
                            No pets found matching the filter criteria.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PetListPage;