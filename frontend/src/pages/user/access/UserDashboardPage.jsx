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
    
    // Manage active tab ('ACCESS' or 'REQUESTS')
    const [activeTab, setActiveTab] = useState('ACCESS'); 
    
    const [accesses, setAccesses] = useState([]);
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch data depending on the active tab
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
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // Handle successful request creation
    const handleFormSuccess = () => {
        setIsModalOpen(false);
        setActiveTab('REQUESTS'); // Automatically switch to History tab so user can see the newly created request
    };

    return (
        <div className="max-w-6xl mx-auto p-6 text-slate-300">
            
            {/* HEADER & ADD NEW BUTTON */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Data Management</h1>
                    <p className="text-slate-400 text-sm mt-1">View authorized data and track requests</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#4ade80] text-slate-900 px-5 py-2.5 rounded-lg hover:bg-[#22c55e] transition-colors shadow-lg shadow-green-900/20 font-bold"
                >
                    <Plus size={18}/> Request new access
                </button>
            </div>

            {/* TABS NAVIGATION */}
            <div className="flex border-b border-slate-800 mb-6">
                <button
                    onClick={() => setActiveTab('ACCESS')}
                    className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === 'ACCESS' ? 'border-[#4ade80] text-[#4ade80]' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
                    }`}
                >
                    <Database size={16}/> Current Access
                </button>
                <button
                    onClick={() => setActiveTab('REQUESTS')}
                    className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === 'REQUESTS' ? 'border-[#4ade80] text-[#4ade80]' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
                    }`}
                >
                    <Clock size={16}/> Request History
                </button>
            </div>

            {/* CONTENT AREA: CURRENT ACCESS (ACCESS) */}
            {activeTab === 'ACCESS' && (
                isLoading ? <div className="py-12 text-center text-slate-500">Loading...</div> :
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {accesses.map(acc => (
                        <div key={acc.id} className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-600 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-[#064e3b]/30 text-[#4ade80] rounded-lg border border-[#064e3b]"><LockOpen size={20}/></div>
                                <div>
                                    <p className="text-xs text-slate-500">Product ID</p>
                                    <p className="font-bold text-lg text-white">#{acc.product_id}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mb-1">Granted date: {new Date(acc.granted_at).toLocaleDateString()}</p>
                            <p className="text-xs text-red-400 mb-4 font-medium">Expires: {new Date(acc.expires_at).toLocaleDateString()}</p>
                            <button 
                                onClick={() => navigate(`/my-data/${acc.product_id}`)}
                                className="w-full py-2.5 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 hover:text-[#4ade80] transition-colors"
                            >
                                View actual data
                            </button>
                        </div>
                    ))}
                    {accesses.length === 0 && (
                        <div className="col-span-3 py-16 text-center bg-[#111827] rounded-xl border border-slate-800 border-dashed">
                            <LockOpen className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                            <p className="text-slate-400">You have no active access permissions.</p>
                        </div>
                    )}
                </div>
            )}

            {/* CONTENT AREA: REQUEST HISTORY (REQUESTS) */}
            {activeTab === 'REQUESTS' && (
                <div className="bg-[#111827] rounded-xl shadow-sm border border-slate-800 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0f172a] border-b border-slate-800 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Reference Code</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Notes</th>
                                <th className="px-6 py-4 text-right">Product Count</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center text-slate-500">
                                        <FileText className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                                        <p>You haven't submitted any requests.</p>
                                    </td>
                                </tr>
                            ) : (
                                requests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-mono font-medium text-white">{req.reference_code}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider
                                                ${req.status === 'APPROVED' ? 'bg-[#064e3b]/60 text-[#4ade80] border border-[#064e3b]' : 
                                                  req.status === 'REJECTED' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'}`}
                                            >
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 truncate max-w-[200px]">{req.notes || '-'}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-300">{req.items?.length || 0} products</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL WIZARD REQUEST NEW ACCESS */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Access request process"
                fitContent={true}
            >
                {/* Force re-render Wizard when opening to clear old data */}
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