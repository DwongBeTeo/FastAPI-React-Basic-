import { X } from "lucide-react";
import { useRef } from "react";
import { useClickOutside } from "../hook/useClickOutside";

export const Modal = ({ isOpen, onClose, children, title, fitContent = false }) => {
    const formRef = useRef(null);
    useClickOutside(formRef, onClose);

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full overflow-hidden bg-black/40 backdrop-blur-sm p-4 md:p-6">
            
            <div 
                ref={formRef} 
                className="flex flex-col overflow-hidden relative bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh]"
            >
                {/* Modal header */}
                <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 rounded-t-xl shrink-0">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {title}
                    </h3>

                    <button
                        onClick={onClose}
                        type="button"
                        className="text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-700 rounded-lg text-sm w-9 h-9 inline-flex items-center justify-center transition-color duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* THAY ĐỔI: Thêm overflow-hidden vào body wrapper để ngăn form phình to ra ngoài */}
                <div className="flex-1 min-h-0 bg-white flex flex-col overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
};