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
                // Backend trả 403 Forbidden hoặc 404 Not Found
                setError(err.response?.data?.detail || "Từ chối truy cập. Bạn không có quyền xem dữ liệu này.");
            } finally {
                setLoading(false);
            }
        };
        
        if (productId) fetchActualData();
    }, [productId]);

    // UI Trạng thái Lỗi / Cấm truy cập
    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
                <div className="bg-red-50 text-red-600 p-8 rounded-2xl max-w-md text-center border border-red-100 shadow-sm">
                    <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-400" />
                    <h2 className="text-xl font-bold mb-2">Truy Cập Bị Từ Chối</h2>
                    <p className="text-sm mb-6">{error}</p>
                    <Link to="/my-dashboard" className="inline-flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-lg border font-medium hover:bg-gray-50 transition-colors">
                        <ArrowLeft size={16}/> Quay lại Quản lý Quyền
                    </Link>
                </div>
            </div>
        );
    }

    // UI Khung Hiển thị Dữ liệu
    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link to="/my-dashboard" className="text-blue-600 hover:underline text-sm flex items-center gap-1 mb-2 font-medium">
                        <ArrowLeft size={14}/> Trở về danh sách
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Database className="text-blue-600"/>
                        Kho Dữ Liệu: Sản phẩm #{productId}
                    </h1>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-900 text-white uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4 w-48"><div className="flex items-center gap-2"><CalendarDays size={14}/> Ngày ghi nhận</div></th>
                            <th className="px-6 py-4">Nội dung chi tiết (Content)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="2" className="px-6 py-12 text-center text-gray-500">Đang truy xuất dữ liệu an toàn...</td></tr>
                        ) : dataRows.length === 0 ? (
                            <tr>
                                <td colSpan="2" className="px-6 py-12 text-center text-gray-500">
                                    Hệ thống không tìm thấy bản ghi nào nằm trong khung thời gian bạn được cấp quyền.
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