import React from 'react';
import { useAuth } from '../context/useAuth';
import { LayoutDashboard, FileCheck, PlusCircle, Search, LogOut, Map, BarChart } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isOpen }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, roles: ['ADMIN', 'OWNER', 'PUBLIC'] },
        { id: 'analytics', label: 'Analytics', icon: BarChart, roles: ['ADMIN', 'OWNER', 'PUBLIC'] },
        { id: 'map-view', label: 'Map Search', icon: Map, roles: ['ADMIN', 'OWNER', 'PUBLIC'] },
        { id: 'verify', label: 'Verify Lands', icon: FileCheck, roles: ['ADMIN'] },
        { id: 'verify-transfers', label: 'Verify Transfers', icon: FileCheck, roles: ['ADMIN'] },
        { id: 'my-lands', label: 'My Lands', icon: FileCheck, roles: ['OWNER'] },
        { id: 'add-land', label: 'Add Land', icon: PlusCircle, roles: ['OWNER'] },
        { id: 'search', label: 'Search Records', icon: Search, roles: ['PUBLIC', 'ADMIN', 'OWNER'] },
    ];

    return (
        <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-all duration-300 ease-in-out border-r border-gray-100 dark:border-gray-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
    `}>
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-400">LandRegistry</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">Secure & Immutable</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.filter(item => item.roles.includes(user?.role)).map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
