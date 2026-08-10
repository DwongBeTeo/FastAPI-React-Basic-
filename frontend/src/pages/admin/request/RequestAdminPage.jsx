import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import axiosConfig from '../../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../../utils/apiEndPoint';

const RequestAdminPage = () => {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('');

    const fetchRequests = async () => {
        try {
            const url = filter ? `${API_ENDPOINTS.ADMIN_REQUEST.GET_ALL}?status=${filter}` : API_ENDPOINTS.ADMIN_REQUEST.GET_ALL;
            const data = await axiosConfig.get(url);
            setRequests(data || []);
        } catch (error) {
            console.error("Lỗi:", error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const handleAction = async (id, action) => {
        if (!window.confirm(`Do you want ${action} this request?`)) return;
        try {
            const url = action === 'APPROVE' 
                ? API_ENDPOINTS.ADMIN_REQUEST.APPROVE(id) 
                : API_ENDPOINTS.ADMIN_REQUEST.REJECT(id);
            await axiosConfig.put(url);
            fetchRequests(); // Reload
        } catch (err) {
            alert("Lỗi xử lý.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Review Data Request</h1>
                <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="border p-2 rounded-lg outline-none"
                >
                    <option value="">All</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b text-gray-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">User ID</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Number of product</th>
                            <th className="px-6 py-4 text-right">Active</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.map(req => (
                            <tr key={req.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono text-gray-900">{req.reference_code}</td>
                                <td className="px-6 py-4">ID: {req.user_id}</td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-xs">{req.status}</span>
                                </td>
                                <td className="px-6 py-4">{req.items?.length || 0} product</td>
                                <td className="px-6 py-4 text-right">
                                    {req.status === 'PENDING' && (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleAction(req.id, 'APPROVE')} className="p-2 text-green-600 hover:bg-green-100 rounded" title="Duyệt">
                                                <CheckCircle size={18}/>
                                            </button>
                                            <button onClick={() => handleAction(req.id, 'REJECT')} className="p-2 text-red-600 hover:bg-red-100 rounded" title="Từ chối">
                                                <XCircle size={18}/>
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default RequestAdminPage;