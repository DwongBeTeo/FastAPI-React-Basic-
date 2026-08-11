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
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
                <div className="bg-red-50 text-red-600 p-8 rounded-2xl max-w-md text-center border border-red-100 shadow-sm">
                    <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-400" />
                    <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                    <p className="text-sm mb-6">{error}</p>
                    <Link to="/my-dashboard" className="inline-flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-lg border font-medium hover:bg-gray-50 transition-colors">
                        <ArrowLeft size={16}/> Back to Permissions Management
                    </Link>
                </div>
            </div>
        );
    }

    // Data Display UI
    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link to="/my-dashboard" className="text-blue-600 hover:underline text-sm flex items-center gap-1 mb-2 font-medium">
                        <ArrowLeft size={14}/> Back to list
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Database className="text-blue-600"/>
                        Data Repository: Product #{productId}
                    </h1>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-900 text-white uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4 w-48"><div className="flex items-center gap-2"><CalendarDays size={14}/> Record Date</div></th>
                            <th className="px-6 py-4">Detailed Content (Content)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="2" className="px-6 py-12 text-center text-gray-500">Retrieving secure data...</td></tr>
                        ) : dataRows.length === 0 ? (
                            <tr>
                                <td colSpan="2" className="px-6 py-12 text-center text-gray-500">
                                    The system could not find any records within your authorized time frame.
                                </td>
                            </tr>
                        ) : (
                            dataRows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono font-bold text-blue-700 align-top">
                                        {row.data_date}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 font-mono text-sm whitespace-pre-wrap bg-gray-50/50">
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