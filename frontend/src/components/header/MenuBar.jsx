import React from 'react';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';

const MenuBar = () => {
    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
            <div className="w-full flex justify-center">
                <div className="px-5 md:px-10 lg:px-20 flex w-full max-w-[1440px] items-center justify-between py-4 md:py-5">
                    
                    {/* 1. Logo Section */}
                    <Link to="/" className="text-2xl font-black text-blue-900 tracking-tight flex-shrink-0">
                        PetTrust
                    </Link>

                    {/* 2. Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8 lg:gap-12">
                        <Link to="/products" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Product
                        </Link>
                        <Link to="/services" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Services
                        </Link>
                        <Link to="/about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            About Us
                        </Link>
                    </nav>

                    {/* 3. Right Actions (UserMenu / Login / Signup) */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <UserMenu />
                    </div>

                </div>
            </div>
        </header>
    );
};

export default MenuBar;