import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LandRegistrationForm from '../components/LandRegistrationForm';
import LandList from '../components/LandList';
import MapView from '../components/MapView';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import Chatbot from '../components/Chatbot';
import TransferModal from '../components/TransferModal';
import TransferVerificationList from '../components/TransferVerificationList';
import { useAuth } from '../context/useAuth';
import { getAllLands, getMyLands, getPendingLands, registerLand, verifyLand, initiateTransfer, getPendingTransfers, approveTransfer } from '../services/landService';

// Fallback Mock Data for demo when backend is offline
const MOCK_LANDS = [
    { id: '1', surveyNumber: '101/A', village: 'Sriperumbudur', district: 'Kanchipuram', area: 2400, price: 5000000, verified: true, ownerId: '1' },
    { id: '2', surveyNumber: '205/B', village: 'Oragadam', district: 'Kanchipuram', area: 1200, price: 2500000, verified: false, ownerId: '1' },
    { id: '3', surveyNumber: '330/C', village: 'Tambaram', district: 'Chennai', area: 1800, price: 8500000, verified: true, ownerId: '2' }
];

const MOCK_TRANSFERS = [
    {
        id: 't1',
        landId: '1',
        surveyNumber: '101/A',
        village: 'Sriperumbudur',
        district: 'Kanchipuram',
        sellerId: '1',
        buyerId: 'buyer-22',
        salePrice: 5400000,
        status: 'PENDING_APPROVAL',
        requestDate: '2026-04-13 10:00 AM'
    }
];

const StatsCard = ({ title, value, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
    </div>
);

const Overview = ({ user, lands }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome back, {user?.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard title="Total Lands Verified" value={lands.filter(l => l.verified).length} color="text-blue-600 dark:text-blue-400" />
                <StatsCard title="Pending Transfers" value="12" color="text-orange-600 dark:text-orange-400" />
                <StatsCard title="My Properties" value={lands.filter(l => l.ownerId === user?.id || l.ownerId === '1').length} color="text-emerald-600 dark:text-emerald-400" />
            </div>
        </div>
    )
}

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [lands, setLands] = useState([]); // Used for land-based tabs
    const [pendingTransfers, setPendingTransfers] = useState([]);
    const [selectedLand, setSelectedLand] = useState(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();
    const currentUserId = user?.id;

    // Data Fetching Logic
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                let data = [];
                // 1. Attempt to fetch from Backend API
                if (user.role === 'ADMIN' && activeTab === 'verify') {
                    data = await getPendingLands();
                    if (!data || data.length === 0) {
                        data = MOCK_LANDS.filter(l => !l.verified);
                    }
                    setLands(data);
                    return;
                }

                if (user.role === 'ADMIN' && activeTab === 'verify-transfers') {
                    const transfers = await getPendingTransfers();
                    setPendingTransfers(transfers && transfers.length > 0 ? transfers : MOCK_TRANSFERS);
                    return;
                } else if (user.role === 'OWNER' && activeTab === 'my-lands') {
                    data = await getMyLands(currentUserId);
                } else {
                    data = await getAllLands();
                }

                // 2. Fallback to MOCK if API returns empty and we are in "Mock/Demo Mode"
                if ((!data || data.length === 0)) {
                    console.log("Using Fallback Mock Data");
                    if (activeTab === 'verify') {
                        data = MOCK_LANDS.filter(l => !l.verified);
                    } else if (activeTab === 'my-lands') {
                        data = MOCK_LANDS.filter(l => l.ownerId === '1' || l.ownerId === currentUserId);
                    } else {
                        data = MOCK_LANDS.filter(l => l.verified);
                    }
                }

                setLands(data);
            } catch (err) {
                console.error("Fetch failed", err);
                if (activeTab === 'verify-transfers') {
                    setPendingTransfers(MOCK_TRANSFERS);
                } else {
                    setLands(MOCK_LANDS.filter(l => l.verified));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, activeTab, currentUserId]);

    const handleRegister = async (data) => {
        try {
            await registerLand({ ...data, ownerId: currentUserId });
            toast.success("Land registration submitted successfully.");
            setActiveTab('my-lands');
        } catch {
            console.warn("Backend unavailable, using mock fallback");
            const newLand = { ...data, id: Date.now().toString(), verified: false, ownerId: currentUserId };
            setLands([...lands, newLand]);
            toast.info("Land registration submitted in mock mode.");
            setActiveTab('my-lands');
        }
    };

    const handleVerify = async (id) => {
        try {
            await verifyLand(id);
            toast.success("Land verified successfully.");
            setLands(prev => prev.filter(l => l.id !== id));
        } catch {
            console.warn("Backend unavailable, using mock fallback");
            setLands(lands.map(l => l.id === id ? { ...l, verified: true } : l));
            toast.info("Land verified in mock mode.");
        }
    };

    const handleApproveTransfer = async (id) => {
        try {
            await approveTransfer(id);
            toast.success("Transfer verified successfully.");
            setPendingTransfers(prev => prev.filter(transfer => transfer.id !== id));
        } catch {
            console.warn("Backend unavailable, using mock fallback");
            setPendingTransfers(prev => prev.filter(transfer => transfer.id !== id));
            toast.info("Transfer verified in mock mode.");
        }
    };

    const openTransferModal = (land) => {
        setSelectedLand(land);
        setIsTransferModalOpen(true);
    };

    const onConfirmTransfer = async (landId, transferData) => {
        try {
            await initiateTransfer({ landId, sellerId: currentUserId, ...transferData });
            toast.success("Transfer request initiated successfully.");
            setIsTransferModalOpen(false);
        } catch {
            console.warn("Backend unavailable");
            toast.info("Transfer request initiated in mock mode.");
            setIsTransferModalOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row transition-colors duration-300">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }}
                isOpen={isSidebarOpen}
            />

            <div className="flex-1 md:ml-64 transition-all duration-300">
                <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                <main className="p-4 md:p-8">
                    {loading && <p className="text-center text-blue-600 dark:text-blue-400 mb-4">Syncing with blockchain...</p>}

                    {activeTab === 'overview' && <Overview user={user} lands={lands} />}

                    {activeTab === 'verify' && (
                        <div className="animate-fade-in">
                            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Pending Verifications</h1>
                            <LandList
                                lands={lands}
                                role={user?.role}
                                onVerify={handleVerify}
                            />
                        </div>
                    )}

                    {activeTab === 'verify-transfers' && (
                        <div className="animate-fade-in">
                            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Pending Transfer Verifications</h1>
                            <TransferVerificationList
                                transfers={pendingTransfers}
                                onApprove={handleApproveTransfer}
                            />
                        </div>
                    )}

                    {activeTab === 'my-lands' && (
                        <div className="animate-fade-in">
                            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">My Properties</h1>
                            <LandList
                                lands={lands}
                                role={user?.role}
                                onTransfer={openTransferModal}
                            />
                        </div>
                    )}

                    {activeTab === 'map-view' && (
                        <div className="animate-fade-in h-full">
                            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Geospatial Land View</h1>
                            <MapView lands={lands} />
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="animate-fade-in h-full">
                            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Real-Time Analytics</h1>
                            <AnalyticsDashboard lands={lands} />
                        </div>
                    )}

                    {activeTab === 'add-land' && <LandRegistrationForm onSubmit={handleRegister} />}

                    {activeTab === 'search' && (
                        <div className="animate-fade-in">
                            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Public Land Search</h1>
                            <div className="mb-6 flex gap-4 flex-col md:flex-row">
                                <input type="text" placeholder="Enter Survey Number..." className="p-3 border rounded-lg w-full max-w-md focus:border-blue-500 outline-none shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                                <button className="bg-blue-600 text-white px-6 py-3 md:py-0 rounded-lg hover:bg-blue-700 font-medium">Search</button>
                            </div>
                            <LandList
                                lands={lands}
                                role={user?.role}
                            />
                        </div>
                    )}
                </main>
            </div>

            <Chatbot />

            {selectedLand && (
                <TransferModal
                    isOpen={isTransferModalOpen}
                    onClose={() => setIsTransferModalOpen(false)}
                    land={selectedLand}
                    onConfirm={(data) => onConfirmTransfer(selectedLand.id, data)}
                />
            )}
        </div>
    );
};

export default Dashboard;
