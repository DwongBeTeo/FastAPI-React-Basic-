import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import axiosConfig from '../../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../../utils/apiEndPoint';
import Pagination from '../../../components/common/Pagination';
const RequestAdminPage = () => {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('');

    // --- State Phân Trang ---
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10; 

    // Cập nhật hàm fetch để hỗ trợ phân trang
    const fetchRequests = async (page = currentPage, currentFilter = filter) => {
        try {
            const skip = (page - 1) * limit;
            
            // Xây dựng URL cơ bản
            let url = `${API_ENDPOINTS.ADMIN_REQUEST.GET_ALL}?skip=${skip}&limit=${limit}`;
            
            // Nối thêm param filter nếu có
            if (currentFilter) {
                url += `&status=${currentFilter}`;
            }

            const response = await axiosConfig.get(url);
            
            // Bóc tách data từ response API phân trang
            setRequests(response.data || []);
            setTotalItems(response.total || 0);
        } catch (error) {
            console.error("Lỗi:", error);
        }
    };

    // Gọi API khi chuyển trang hoặc đổi filter
    useEffect(() => {
        fetchRequests(currentPage, filter);
    }, [currentPage, filter]);

    // Xử lý khi đổi Filter (tự động quay về trang 1)
    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalItems / limit);

    const handleAction = async (id, action) => {
        if (!window.confirm(`Do you want ${action} this request?`)) return;
        try {
            const url = action === 'APPROVE' 
                ? API_ENDPOINTS.ADMIN_REQUEST.APPROVE(id) 
                : API_ENDPOINTS.ADMIN_REQUEST.REJECT(id);
            await axiosConfig.put(url);
            
            // Reload lại trang hiện tại sau khi duyệt/từ chối
            fetchRequests(currentPage, filter); 
        } catch (err) {
            alert("Lỗi xử lý.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 text-slate-300 flex flex-col h-full min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white">Review Data Request</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage and approve client requests (Total: {totalItems})</p>
                </div>
                <select 
                    value={filter} 
                    onChange={handleFilterChange}
                    className="border border-slate-700 bg-[#0B1121] text-white p-2.5 rounded-lg outline-none focus:border-[#4ade80] transition-colors min-w-[150px]"
                >
                    <option value="" className="bg-[#111827]">All Status</option>
                    <option value="PENDING" className="bg-[#111827]">Pending</option>
                    <option value="APPROVED" className="bg-[#111827]">Approved</option>
                    <option value="REJECTED" className="bg-[#111827]">Rejected</option>
                </select>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="bg-[#111827] rounded-xl shadow-lg border border-slate-800 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0f172a] border-b border-slate-800 text-slate-400 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">User ID</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4 text-right">Total Amount</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 bg-[#0B1121]/50">
                                        No requests found.
                                    </td>
                                </tr>
                            ) : (
                                requests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-mono font-medium text-white">{req.reference_code}</td>
                                        <td className="px-6 py-4 font-mono text-slate-400">ID: {req.user_id}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider
                                                ${req.status === 'APPROVED' ? 'bg-[#064e3b]/60 text-[#4ade80] border border-[#064e3b]' : 
                                                  req.status === 'REJECTED' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'}`}
                                            >
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">{req.items?.length || 0} product(s)</td>
                                        
                                        <td className="px-6 py-4 text-right font-bold font-mono text-[#4ade80]">
                                            ${req.total_amount ? req.total_amount.toLocaleString('en-US') : '0'}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {req.status === 'PENDING' && (
                                                <div className="flex justify-end gap-3">
                                                    <button 
                                                        onClick={() => handleAction(req.id, 'APPROVE')} 
                                                        className="p-2 text-[#4ade80] hover:bg-[#064e3b]/50 hover:text-white rounded-lg transition-colors border border-transparent hover:border-[#4ade80]/50" 
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAction(req.id, 'REJECT')} 
                                                        className="p-2 text-red-400 hover:bg-red-900/50 hover:text-white rounded-lg transition-colors border border-transparent hover:border-red-500/50" 
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18}/>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- COMPONENT PHÂN TRANG --- */}
                {totalPages > 1 && (
                    <div className="mt-6 pb-6">
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestAdminPage;