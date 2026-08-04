import React from 'react';
import { Edit, Trash2, Fish } from 'lucide-react';

const PetList = ({ pets, onDelete, onEdit }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase">
                        <tr>
                            <th className="px-6 py-4 w-12 text-center">ID</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Tên Cá Cảnh</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Giống Loài</th>
                            <th className="px-6 py-4 font-semibold tracking-wider text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pets.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Fish className="w-12 h-12 text-gray-300 mb-2" />
                                        <p>Chưa có dữ liệu cá cảnh trong hệ thống.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            pets.map((pet) => (
                                <tr key={pet.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-center text-gray-500 font-mono">
                                        #{pet.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                                <Fish size={20} />
                                            </div>
                                            <span className="font-medium text-gray-900">{pet.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                            {pet.species}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => onEdit && onEdit(pet)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Sửa"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => onDelete && onDelete(pet.id)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PetList;