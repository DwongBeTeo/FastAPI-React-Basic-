import { X } from "lucide-react";
import { useRef } from "react";
import { useClickOutside } from "../hook/useClickOutside";

export const Modal = ({ isOpen, onClose, children, title, fitContent = false }) => {
    const formRef = useRef(null);
    useClickOutside(formRef, onClose);

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center w-full h-full overflow-hidden bg-black/60 backdrop-blur-sm p-4 md:p-6">
            
            <div 
                ref={formRef} 
                // Thay đổi bg-white -> bg-[#111827], thay màu shadow và viền
                className={`flex flex-col overflow-hidden relative bg-[#111827] rounded-xl shadow-2xl shadow-black/70 border border-slate-800 w-full max-w-2xl max-h-[90vh] ${fitContent ? 'h-auto' : ''}`}
            >
                {/* Modal header */}
                {/* Đổi border-gray-100 -> border-slate-800 */}
                <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-800 rounded-t-xl shrink-0">
                    <h3 className="text-xl font-bold text-white">
                        {title}
                    </h3>

                    <button
                        onClick={onClose}
                        type="button"
                        // Đổi nút close sang màu tối, hover sáng nhẹ
                        className="text-slate-400 bg-transparent hover:bg-slate-800 hover:text-white rounded-lg text-sm w-9 h-9 inline-flex items-center justify-center transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:ring-offset-2 focus:ring-offset-[#111827]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* THAY ĐỔI: Đổi bg-white -> bg-[#0B1121] hoặc bg-transparent để nội dung bên trong quyết định màu nền */}
                <div className="flex-1 min-h-0 bg-transparent flex flex-col overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
};