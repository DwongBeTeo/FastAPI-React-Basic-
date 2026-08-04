import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

const AddPetForm = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [species, setSpecies] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !species) return;

        setIsLoading(true);
        const success = await onAdd({ name, species });
        
        if (success) {
            setName('');
            setSpecies('');
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PlusCircle className="text-blue-600" size={20} />
                Thêm Cá Cảnh Mới
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên cá</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="VD: Kōhaku Tanchō"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                    />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giống loài</label>
                    <input 
                        type="text" 
                        value={species}
                        onChange={(e) => setSpecies(e.target.value)}
                        placeholder="VD: Cá Koi"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 h-[42px]"
                >
                    {isLoading ? 'Đang lưu...' : 'Lưu dữ liệu'}
                </button>
            </form>
        </div>
    );
};

export default AddPetForm;