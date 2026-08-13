import { useContext, useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { User, LogOut, UserCircle } from "lucide-react";
import AuthContext from "../../context/AuthContext";

const UserMenu = () => {
    const { user, logout } = useContext(AuthContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropDownRef = useRef(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    return (
        <div className="relative" ref={dropDownRef}>
            {/* THAY ICON MATERIAL BẰNG LUCIDE-REACT ĐỂ REACT KIỂM SOÁT 100% DOM */}
            <button 
                onClick={() => setShowDropdown(!showDropdown)} 
                className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 border border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:ring-offset-2 focus:ring-offset-[#0B1121]"
            >
                <UserCircle className="w-6 h-6" strokeWidth={1.5} />
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-3 w-64 bg-[#111827] rounded-xl shadow-2xl shadow-black/50 border border-slate-700/50 py-2 z-50 overflow-hidden transform origin-top-right transition-all">
                    {user ? (
                        <>
                            <div className="px-4 py-3 border-b border-slate-700/50 bg-[#0f172a] mb-1">
                                <p className="text-sm font-semibold text-white truncate">Hello, {user.email}</p>
                                <p className="text-xs text-slate-400 truncate mt-0.5">Role: <span className="text-[#4ade80] uppercase tracking-wider">{user.role}</span></p>
                            </div>

                            <div className="py-1 border-b border-slate-700/50">
                                {/* Route này nằm trong MainLayout, có thể giữ onClick */}
                                <NavLink 
                                    to="/my-profile" 
                                    onClick={() => setShowDropdown(false)}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                >
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span>User Info</span>
                                </NavLink>
                            </div>

                            <div className="py-1 border-b border-slate-700/50">
                                {/* Route này nằm trong MainLayout, có thể giữ onClick */}
                                <NavLink 
                                    to="/my-dashboard" 
                                    onClick={() => setShowDropdown(false)}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    <span>My Requests & Access</span>
                                </NavLink>
                            </div>

                            <div className="py-1 mt-1">
                                <button 
                                    onClick={handleLogout} 
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="p-5 flex flex-col gap-4">
                            <div className="text-center">
                                <p className="font-semibold text-white">Your Account</p>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Log in to experience the full range of features and data access.</p>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                {/* ĐÃ XÓA onClick ở đây để tránh Race Condition */}
                                <NavLink 
                                    to="/login" 
                                    className="flex items-center justify-center w-full py-2.5 px-4 bg-[#4ade80] hover:bg-[#22c55e] text-slate-900 text-sm font-bold rounded-lg transition-colors shadow-lg shadow-green-900/20"
                                >
                                    Login
                                </NavLink>
                                
                                <div className="text-xs text-center text-slate-400 mt-1">
                                    Don't have an account?{' '}
                                    {/* ĐÃ XÓA onClick ở đây để tránh Race Condition */}
                                    <NavLink 
                                        to="/register" 
                                        className="text-[#4ade80] font-semibold hover:text-[#22c55e] transition-colors"
                                    >
                                        Register
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserMenu;