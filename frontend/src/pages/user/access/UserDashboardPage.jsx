// src/pages/user/UserDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, FileText, LockOpen, Database, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosConfig from '../../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../../utils/apiEndPoint';
import { Modal } from '../../../components/Modal';
import RequestWizard from '../../../components/user/request/RequestWizard';

const UserDashboardPage = () => {
    const navigate = useNavigate();
    
    // Quản lý Tab đang mở ('ACCESS' hoặc 'REQUESTS')
    const [activeTab, setActiveTab] = useState('ACCESS'); 
    
    const [accesses, setAccesses] = useState([]);
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch dữ liệu tùy theo Tab đang mở
    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'ACCESS') {
                const data = await axiosConfig.get(API_ENDPOINTS.USER_ACCESS.GET_MINE);
                setAccesses(data || []);
            } else {
                const data = await axiosConfig.get(API_ENDPOINTS.USER_REQUEST.GET_MINE);
                setRequests(data || []);
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // Xử lý khi tạo Request thành công
    const handleFormSuccess = () => {
        setIsModalOpen(false);
        setActiveTab('REQUESTS'); // Tự động chuyển sang tab Lịch sử để user thấy request vừa tạo
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            
            {/* HEADER & NÚT THÊM MỚI */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Dữ liệu của tôi</h1>
                    <p className="text-gray-500 text-sm mt-1">Xem dữ liệu đã được cấp quyền và theo dõi các yêu cầu</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <Plus size={18}/> Xin cấp quyền mới
                </button>
            </div>

            {/* TABS NAVIGATION */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('ACCESS')}
                    className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === 'ACCESS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    <Database size={16}/> Quyền đang có
                </button>
                <button
                    onClick={() => setActiveTab('REQUESTS')}
                    className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === 'REQUESTS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    <Clock size={16}/> Lịch sử yêu cầu
                </button>
            </div>

            {/* CONTENT KHU VỰC: QUYỀN ĐANG CÓ (ACCESS) */}
            {activeTab === 'ACCESS' && (
                isLoading ? <div className="py-12 text-center text-gray-500">Đang tải...</div> :
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {accesses.map(acc => (
                        <div key={acc.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-lg"><LockOpen size={20}/></div>
                                <div>
                                    <p className="text-xs text-gray-500">Mã Sản Phẩm ID</p>
                                    <p className="font-bold text-lg">#{acc.product_id}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">Cấp ngày: {new Date(acc.granted_at).toLocaleDateString()}</p>
                            <p className="text-xs text-red-500 mb-4">Hết hạn: {new Date(acc.expires_at).toLocaleDateString()}</p>
                            <button 
                                onClick={() => navigate(`/my-data/${acc.product_id}`)}
                                className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
                            >
                                Xem dữ liệu thật
                            </button>
                        </div>
                    ))}
                    {accesses.length === 0 && (
                        <div className="col-span-3 py-16 text-center bg-white rounded-xl border border-gray-100">
                            <LockOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">Bạn chưa có quyền truy cập nào đang hoạt động.</p>
                        </div>
                    )}
                </div>
            )}

            {/* CONTENT KHU VỰC: LỊCH SỬ YÊU CẦU (REQUESTS) */}
            {activeTab === 'REQUESTS' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Mã tham chiếu</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Ghi chú</th>
                                <th className="px-6 py-4 text-right">Số lượng SP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Đang tải...</td></tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p>Bạn chưa gửi phiếu yêu cầu nào.</p>
                                    </td>
                                </tr>
                            ) : (
                                requests.map(req => (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-medium text-gray-900">{req.reference_code}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-md text-xs font-bold 
                                                ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                                                  req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
                                            >
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]">{req.notes || '-'}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-700">{req.items?.length || 0} sản phẩm</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL WIZARD XIN QUYỀN MỚI */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Quy trình xin cấp quyền truy cập"
                fitContent={true}
            >
                {/* Ép render lại Wizard mỗi khi mở để xóa dữ liệu cũ */}
                {isModalOpen && (
                    <RequestWizard 
                        onSuccess={handleFormSuccess} 
                        onCancel={() => setIsModalOpen(false)} 
                    />
                )}
            </Modal>
        </div>
    );
};

export default UserDashboardPage;