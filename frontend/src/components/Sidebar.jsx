import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { ChevronLeft, ChevronRight, LogOutIcon, User } from "lucide-react";
import AuthContext from "../context/AuthContext";
import { SIDE_BAR_ADMIN, SIDE_BAR_USER } from "../assets/asset";

const Sidebar = () => { 
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = user?.role === 'ADMIN';
    
    // quản lý đóng mở(chỉ dùng cho admin)
    const [isExpandState, setIsExpandState] = useState(true);

    // Nếu là Admin: dùng state đóng/mở. Nếu là User: luôn mở.
    const isExpanded = isAdmin ? isExpandState : true;

    // Logic Resize
    useEffect(() => {
        if(!isAdmin) return; 
        const handleResize = () => {
            if(window.innerWidth <= 768) {
                setIsExpandState(false);
            } else {
                setIsExpandState(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isAdmin]);

    const currentUser = user?.role === 'ADMIN' ? SIDE_BAR_ADMIN : SIDE_BAR_USER;
    const heightClass = isAdmin ? "h-screen top-0" : "h-[calc(100vh-61px)] top-[61px]";
    
    return (
        <div className={`${heightClass} flex flex-col bg-[#111827] text-slate-300 border-r border-slate-800 sticky z-20 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20 px-2'}`}>
            {/* toggle expand/collapse */}
            {isAdmin && (
                <button
                    onClick={() => setIsExpandState(!isExpandState)}
                    className="z-50 absolute -right-3 top-6 bg-[#4ade80] text-slate-900 p-1 rounded-full shadow-lg hover:bg-[#22c55e] transition-colors font-bold"
                >
                    {isExpanded ? <ChevronLeft size={20}/> : <ChevronRight size={20} />}
                </button>
            )}
            
            {/* User info */}
            <div className={`flex flex-col items-center justify-center gap-3 mt-4 mb-7 transition-all duration-300 ${!isExpanded && 'mb-4'}`}>
                {user?.profileImageUrl ? (
                    <img
                    src={user.profileImageUrl || ''} 
                    alt="profile image"
                    className={`bg-slate-700 rounded-full transition-all duration-300 object-cover border border-slate-700 ${isExpanded ? 'w-20 h-20' : 'w-10 h-10'}`}
                    />
                ) : (   
                    <User className={`text-slate-400 p-2 bg-slate-800 rounded-full transition-all duration-300 ${isExpanded ? 'w-20 h-20' : 'w-10 h-10'}`} />
                )}
                <div className={`flex flex-col items-center overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100' : 'opacity-0 max-h-0 hidden'}`}>
                    <h5 className="text-white font-bold leading-6 whitespace-nowrap">{user?.username || ''}</h5>
                    <span className="text-slate-400 text-xs uppercase tracking-wider whitespace-nowrap">{user?.role || ''}</span>
                </div>
            </div>

            {/* Menu list */}
            <div className={`flex-1 px-3 py-2 space-y-1.5 scrollbar-hide ${isExpanded ? 'overflow-y-auto' : 'overflow-visible'}`}>
                {currentUser.map((item, index) => {
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                    return (
                        <button 
                            key={`menu_${index}`}
                            onClick={() => navigate(item.path)}
                            className={`cursor-pointer w-full flex items-center py-3 rounded-lg transition-all duration-300 relative group
                            ${isActive ? 'text-slate-900 bg-[#4ade80] font-bold shadow-lg shadow-green-900/25' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}
                            ${isExpanded ? 'px-4 gap-4 justify-start' : 'px-0 justify-center'}
                            `}
                        >
                                <item.icon className="text-xl shrink-0" />
                                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 origin-left text-sm ${isExpanded ? 'w-auto opacity-100' : 'opacity-0 w-0 ml-0'}`}>
                                    {item.label}
                                </span>
                                {/* Tooltip */}
                                {!isExpanded && isAdmin && (
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-slate-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap shadow-xl border border-slate-800">
                                        {item.label}
                                        <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-slate-900"></div>
                                    </div>
                                )}
                        </button>
                    )
                })}
            </div>
            
            {/* Logout Button */}
            {isAdmin && (
                <div className="p-3 bg-[#111827] border-t border-slate-800/80 mt-auto">
                    <button onClick={logout}
                    className={`w-full flex items-center py-2.5 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all duration-300 font-medium text-sm
                        ${isExpanded ? 'px-3 gap-4 justify-start' : 'px-0 justify-center'}
                        `}
                    >
                        <LogOutIcon className="shrink-0" /> 
                        <span className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${isExpanded ? 'w-auto opacity-100' : 'opacity-0 w-0'}`}>
                            Logout
                        </span>
                    </button>
                </div>    
            )}
        </div>
    );
}

export default Sidebar;