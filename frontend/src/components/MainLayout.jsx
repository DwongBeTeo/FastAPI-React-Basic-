import { useContext } from "react";
import { Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Sidebar from "./Sidebar";
import MenuBar from "./Header/MenuBar";
import Footer from "./footer/Footer";

const MainLayout = () => {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
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
                    <main className="flex-1 h-full overflow-y-auto bg-gray-50 relative p-6 md:p-8">
                        <Outlet />
                    </main>
                </div>
            ) : (
                /* ------------------------------------------------------ */
                /* Case2: USER    */
                /* ------------------------------------------------------ */
                <div className="flex flex-col w-full">
                    <MenuBar/>
                    {/* Hide Sidebar if role User */}
                    <div className="hidden">
                        <Sidebar/>
                    </div>

                    <div className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6">
                        <Outlet />
                    </div>

                    {/* Footer  */}
                    <Footer/>
                </div>
            )}
        </div>
    );
};

export default MainLayout;