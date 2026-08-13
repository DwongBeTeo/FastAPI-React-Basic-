// src/pages/user/access/ActualDataPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldAlert, Database, CalendarDays, ArrowLeft } from 'lucide-react';
import axiosConfig from '../../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../../utils/apiEndPoint';

const ActualDataPage = () => {
    const { productId } = useParams();
    const [dataRows, setDataRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActualData = async () => {
            try {
                setLoading(true);
                const res = await axiosConfig.get(API_ENDPOINTS.USER_ACCESS.GET_ACTUAL_DATA(productId));
                setDataRows(res || []);
            } catch (err) {
                // Backend returns 403 Forbidden or 404 Not Found
                setError(err.response?.data?.detail || "Access denied. You do not have permission to view this data.");
            } finally {
                setLoading(false);
            }
        };
        
        if (productId) fetchActualData();
    }, [productId]);

    // Error / Access Denied UI State
    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-slate-300">
                <div className="bg-[#111827] text-red-400 p-8 rounded-2xl max-w-md text-center border border-red-900/50 shadow-2xl shadow-black/50">
                    <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h2 className="text-xl font-bold mb-2 text-white">Access Denied</h2>
                    <p className="text-sm mb-6 text-slate-400">{error}</p>
                    <Link to="/my-dashboard" className="inline-flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-700 transition-colors">
                        <ArrowLeft size={16}/> Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Data Display UI
    return (
        <div className="max-w-5xl mx-auto p-6 text-slate-300">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link to="/my-dashboard" className="text-[#3b82f6] hover:text-[#60a5fa] hover:underline text-sm flex items-center gap-1 mb-2 font-medium transition-colors">
                        <ArrowLeft size={14}/> Back to list
                    </Link>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Database className="text-[#3b82f6]"/>
                        Data Repository: Product #{productId}
                    </h1>
                </div>
            </div>

            <div className="bg-[#111827] rounded-xl shadow-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#0f172a] text-slate-300 uppercase text-xs tracking-wider border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4 w-48"><div className="flex items-center gap-2"><CalendarDays size={14}/> Record Date</div></th>
                            <th className="px-6 py-4">Detailed Content</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {loading ? (
                            <tr><td colSpan="2" className="px-6 py-12 text-center text-slate-500">Retrieving secure data...</td></tr>
                        ) : dataRows.length === 0 ? (
                            <tr>
                                <td colSpan="2" className="px-6 py-12 text-center text-slate-500 bg-[#0B1121]/50">
                                    The system could not find any records within your authorized time frame.
                                </td>
                            </tr>
                        ) : (
                            dataRows.map(row => (
                                <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-[#4ade80] align-top bg-[#0B1121]/30">
                                        {row.data_date}
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                                        {row.content}
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
export default ActualDataPage;