import { useContext } from "react";
import { Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Sidebar from "./Sidebar";
import MenuBar from "./Header/MenuBar";
import Footer from "./footer/Footer";

const MainLayout = () => {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'ADMIN';
    // const baseBgClass = isAdmin ? "bg-[#0B1121] text-slate-200" : "bg-[#0B1121] text-slate-200";
    const baseBgClass = "bg-[#0B1121] text-slate-200"

    return (
        <div className={`min-h-screen font-sans ${baseBgClass}`}>
            {/* ------------------------------------------------------ */}
            {/* Case1: ADMIN (Layout Dashboard: left - right)    */}
            {/* ------------------------------------------------------ */}
            {isAdmin ? (
                <div className="flex h-screen overflow-hidden">
                    {/* left Sidebar */}
                    <div className="z-20 shrink-0">
                         <Sidebar /> 
                    </div>

                    {/* Content right side */}
                    <main className="flex-1 h-full overflow-y-auto bg-[#0B1121] relative p-6 md:p-8">
                        <Outlet />
                    </main>
                </div>
            ) : (
                /* ------------------------------------------------------ */
                /* Case2: USER    */
                /* ------------------------------------------------------ */
                <div className="flex flex-col min-h-screen w-full">
                    <MenuBar/>
                    
                    {/* Hide Sidebar if role User */}
                    <div className="hidden">
                        {/* <Sidebar/> */}
                    </div>
                    <main className="flex-1 w-full">
                        <Outlet />
                    </main>

                    {/* Footer  */}
                    {/* <Footer/> */}
                </div>
            )}
        </div>
    );
};

export default MainLayout;