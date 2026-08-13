import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 bg-[#111827] border border-slate-800 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={18} />
            </button>

            <div className="flex gap-1">
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                            currentPage === page
                                ? 'bg-[#4ade80] text-slate-900 shadow-lg shadow-green-900/20'
                                : 'bg-[#111827] border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 bg-[#111827] border border-slate-800 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default Pagination;