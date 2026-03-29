import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Menu } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 sticky top-0 z-30">
            <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 md:hidden text-gray-600"
            >
                <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 ml-auto">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <UserCircle className="w-10 h-10 text-gray-400" />
            </div>
        </header>
    );
};

export default Navbar;
