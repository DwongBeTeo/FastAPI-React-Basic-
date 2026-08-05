import React, { useEffect, useState } from 'react';
import { PlusCircle, Save, LoaderCircle } from 'lucide-react';

const AddPetForm = ({ onSubmit, onCancel, initialData, isEditing }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Khởi tạo state bao gồm tất cả các trường từ schema backend
    const [formData, setFormData] = useState({
        name: '',
        species: '',
        breed: '',
        gender: '',
        status: 'Active', // Default theo backend
        image: '',
        description: ''
    });

    useEffect(() => {
        if (isEditing && initialData) {
            setFormData({
                name: initialData.name || '',
                species: initialData.species || '',
                breed: initialData.breed || '',
                gender: initialData.gender || '',
                status: initialData.status || 'Active',
                image: initialData.image || '',
                description: initialData.description || ''
            });
        } else {
            // Reset form khi là ADD
            setFormData({
                name: '', species: '', breed: '', gender: '', status: 'Active', image: '', description: ''
            });
        }
    }, [initialData, isEditing]);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate cơ bản
        if (!formData.name.trim()) return setError('Vui lòng nhập tên động vật.');
        if (!formData.species.trim()) return setError('Vui lòng nhập giống loài.');

        setIsLoading(true);
        setError('');

        try {
            // Loại bỏ các trường rỗng (chuỗi rỗng) chuyển thành null nếu cần thiết, 
            // hoặc giữ nguyên tùy theo logic backend của bạn xử lý
            const payload = { ...formData };
            
            const success = await onSubmit(payload);
            
            if (success) {
                // Reset form if addd successfully
                setFormData({
                    name: '',
                    species: '',
                    breed: '',
                    gender: '',
                    status: 'Active',
                    image: '',
                    description: '',
                    price: '',
                });
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi lưu dữ liệu, vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <PlusCircle className="text-blue-600" size={20} />
                    Add new animal
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 p-5 md:p-6">
                    {/* Error notice */}
                    {error && (
                        <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            <span className="font-medium mr-1">Lỗi:</span> {error}
                        </div>
                    )}

                    {/* 2 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* --- Left column: info basic --- */}
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name Animal <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    placeholder="VD: Kōhaku Tanchō"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Species <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={formData.species}
                                        onChange={(e) => updateField('species', e.target.value)}
                                        placeholder="VD: Cá Koi"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                                    <input 
                                        type="text" 
                                        value={formData.breed}
                                        onChange={(e) => updateField('breed', e.target.value)}
                                        placeholder="VD: Hikarimono"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    placeholder="Nhập mô tả, đặc điểm, tình trạng sức khỏe..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[110px] resize-y"
                                />
                            </div>
                        </div>

                        {/* --- CỘT PHẢI: PHÂN LOẠI & ẢNH --- */}
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select 
                                        value={formData.gender}
                                        onChange={(e) => updateField('gender', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                    >
                                        <option value="">-- None --</option>
                                        <option value="Đực">Male</option>
                                        <option value="Cái">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select 
                                        value={formData.status}
                                        onChange={(e) => updateField('status', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Sold">Sold</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input 
                                    type="text" 
                                    value={formData.image}
                                    onChange={(e) => updateField('image', e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                {formData.image && (
                                    <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 h-32 w-full bg-gray-50 flex items-center justify-center">
                                        <img src={formData.image} alt="Preview" className="h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                                <input 
                                    type="number" 
                                    value={formData.price}
                                    onChange={(e) => updateField('price', e.target.value ? Number(e.target.value) : '')}
                                    placeholder="VD: 500000"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- FOOTER BUTTONS --- */}
                <div className="py-4 px-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                    {onCancel && (
                        <button 
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none disabled:opacity-50 transition-colors"
                        >
                            Cancle
                        </button>
                    )}
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 shadow-sm transition-colors"
                    >
                        {isLoading ? <LoaderCircle className='w-4 h-4 animate-spin'/> : <Save className="w-4 h-4" />}
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPetForm;