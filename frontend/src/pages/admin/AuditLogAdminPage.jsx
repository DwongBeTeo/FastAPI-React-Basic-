import React, { useState, useEffect } from 'react';
import { Activity, Search, RefreshCw, FileJson, ChevronDown } from 'lucide-react';
import axiosConfig from '../../utils/axiosConfig';
import Pagination from '../../components/common/Pagination';
import { API_ENDPOINTS } from '../../utils/apiEndPoint';
import {Modal} from '../../components/Modal'

// pages/admin/AuditLogAdminPage.jsx
const AuditLogAdminPage = () => {
    // --- States ---
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 7;

    // Filters
    const [filters, setFilters] = useState({
        actor_id: '',
        action: '',
        entity_type: ''
    });
    
    // Modal Payload
    const [selectedPayload, setSelectedPayload] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Actions ---
    const fetchAuditLogs = async (page = currentPage, currentFilters = filters) => {
        try {
            setLoading(true);
            const skip = (page - 1) * limit;
            
            // Khởi tạo URL Params
            const params = new URLSearchParams({
                skip: skip.toString(),
                limit: limit.toString()
            });

            if (currentFilters.actor_id) params.append('actor_id', currentFilters.actor_id);
            if (currentFilters.action) params.append('action', currentFilters.action.toUpperCase());
            if (currentFilters.entity_type) params.append('entity_type', currentFilters.entity_type.toUpperCase());

            const response = await axiosConfig.get(`${API_ENDPOINTS.ADMIN_AUDIT.GET_ALL}?${params.toString()}`);
            
            setLogs(response.data || []);
            setTotalItems(response.total || 0);
        } catch (error) {
            console.error("Lỗi tải Audit Logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs(currentPage, filters);
    }, [currentPage]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchAuditLogs(1, filters);
    };

    const handleReset = () => {
        const resetFilters = { actor_id: '', action: '', entity_type: '' };
        setFilters(resetFilters);
        setCurrentPage(1);
        fetchAuditLogs(1, resetFilters);
    };

    const openPayloadModal = (payloadStr) => {
        try {
            const parsed = JSON.parse(payloadStr);
            setSelectedPayload(parsed);
        } catch {
            setSelectedPayload(payloadStr); // Fallback nếu không phải JSON
        }
        setIsModalOpen(true);
    };

    // --- Helpers ---
    const totalPages = Math.ceil(totalItems / limit);

    const getActionColor = (action) => {
        const act = action?.toUpperCase() || '';
        if (act.includes('CREATE') || act.includes('LOGIN')) return 'bg-emerald-900/40 text-emerald-400 border-emerald-800';
        if (act.includes('UPDATE') || act.includes('APPROVE')) return 'bg-blue-900/40 text-blue-400 border-blue-800';
        if (act.includes('DELETE') || act.includes('REJECT')) return 'bg-red-900/40 text-red-400 border-red-800';
        return 'bg-slate-800 text-slate-300 border-slate-700';
    };

    return (
        <div className="max-w-7xl mx-auto p-6 text-slate-300 flex flex-col h-full min-h-screen">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-[#4ade80]" size={28} />
                        System Audit Logs
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Track system activities, security events, and data changes (Total: {totalItems})
                    </p>
                </div>
                <button 
                    onClick={() => fetchAuditLogs(currentPage, filters)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm border border-slate-700"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Filters Bar */}
            <form onSubmit={handleSearch} className="bg-[#111827] border border-slate-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-end shadow-lg shrink-0">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Actor ID</label>
                    <input 
                        type="number" 
                        placeholder="e.g. 1"
                        value={filters.actor_id}
                        onChange={(e) => setFilters({...filters, actor_id: e.target.value})}
                        className="w-full px-4 py-2.5 bg-[#0B1121] border border-slate-700 rounded-lg text-sm text-white focus:border-[#4ade80] outline-none transition-colors"
                    />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Action</label>
                    <input 
                        type="text" 
                        placeholder="e.g. LOGIN, UPDATE..."
                        value={filters.action}
                        onChange={(e) => setFilters({...filters, action: e.target.value})}
                        className="w-full px-4 py-2.5 bg-[#0B1121] border border-slate-700 rounded-lg text-sm text-white focus:border-[#4ade80] outline-none transition-colors"
                    />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Entity Type</label>
                    <input 
                        type="text" 
                        placeholder="e.g. USER, PRODUCT..."
                        value={filters.entity_type}
                        onChange={(e) => setFilters({...filters, entity_type: e.target.value})}
                        className="w-full px-4 py-2.5 bg-[#0B1121] border border-slate-700 rounded-lg text-sm text-white focus:border-[#4ade80] outline-none transition-colors"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        type="button"
                        onClick={handleReset}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-lg transition-colors border border-slate-700"
                    >
                        Clear
                    </button>
                    <button 
                        type="submit"
                        className="flex-1 md:flex-none px-6 py-2.5 bg-[#4ade80] hover:bg-[#22c55e] text-slate-900 text-sm font-bold rounded-lg transition-colors shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                    >
                        <Search size={16} /> Filter
                    </button>
                </div>
            </form>

            {/* Data Table */}
            <div className="flex-1 flex flex-col">
                <div className="bg-[#111827] rounded-xl shadow-lg border border-slate-800 overflow-hidden flex-1 relative">
                    <div className="overflow-x-auto h-full">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-[#0f172a] border-b border-slate-800 text-slate-400 uppercase text-xs tracking-wider sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4">ID / Time</th>
                                    <th className="px-6 py-4">Actor ID</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Entity</th>
                                    <th className="px-6 py-4">Trace ID</th>
                                    <th className="px-6 py-4 text-center">Payload</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                                            Loading logs...
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                                            No audit logs found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-white mb-1">#{log.id}</div>
                                                <div className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString('en-US')}</div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-300">
                                                {log.actor_id ? log.actor_id : <span className="text-slate-600 italic">System</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-300">{log.entity_type}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {log.entity_id}</div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-slate-500 max-w-[150px] truncate" title={log.trace_id}>
                                                {log.trace_id || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {log.payload && log.payload !== 'null' && log.payload !== '{}' ? (
                                                    <button 
                                                        onClick={() => openPayloadModal(log.payload)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded transition-colors text-xs font-medium border border-slate-700"
                                                    >
                                                        <FileJson size={14} /> View
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-600 text-xs italic">N/A</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
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

            {/* Modal hiển thị chi tiết Payload JSON */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Payload Details"
                fitContent={false}
            >
                <div className="bg-[#0B1121] rounded-lg p-4 border border-slate-700 overflow-auto max-h-[60vh] custom-scrollbar">
                    <pre className="text-xs font-mono text-[#4ade80]">
                        {selectedPayload ? JSON.stringify(selectedPayload, null, 2) : 'Empty payload'}
                    </pre>
                </div>
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </Modal>

        </div>
    );
};

export default AuditLogAdminPage;