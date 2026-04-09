import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LandRegistrationForm from '../components/LandRegistrationForm';
import LandList from '../components/LandList';
import MapView from '../components/MapView';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import Chatbot from '../components/Chatbot';
import TransferModal from '../components/TransferModal';
import { useAuth } from '../context/AuthContext';
import {
    getAllLands,
    getMyLands,
    getPendingLands,
    getPendingTransfers,
    registerLand,
    verifyLand,
    initiateTransfer,
    uploadLandDocument,
    verifyTransferDocuments,
    approveTransfer,
    rejectTransfer
} from '../services/landService';

const StatsCard = ({ title, value, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
    </div>
);

const Overview = ({ user, lands, stats }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome back, {user?.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard title="Total Lands Verified" value={stats.verifiedLands} color="text-blue-600 dark:text-blue-400" />
                <StatsCard title="Pending Verifications" value={stats.pendingVerifications} color="text-orange-600 dark:text-orange-400" />
                <StatsCard title="My Properties" value={stats.myProperties} color="text-emerald-600 dark:text-emerald-400" />
                <StatsCard title="Pending Transfers" value={stats.pendingTransfers} color="text-indigo-600 dark:text-indigo-400" />
            </div>
        </div>
    )
}

const TransferApprovalList = ({ transfers, onVerifyDocuments, onApprove, onReject }) => {
    if (!transfers.length) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 text-gray-600 dark:text-gray-300">
                No pending transfer requests.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {transfers.map((transfer) => (
                <div key={transfer.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Land Transfer</p>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Survey {transfer.land?.surveyNumber || 'Unknown'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {transfer.land?.village || 'Unknown village'}, {transfer.land?.district || 'Unknown district'}
                            </p>
                        </div>
                        <span className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                            {transfer.status || 'PENDING_APPROVAL'}
                        </span>
                    </div>

                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Seller</p>
                                <p className="font-medium text-gray-900 dark:text-white">{transfer.seller?.name || 'Unknown seller'}</p>
                                <p className="break-all">{transfer.seller?.email || 'No email available'}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Buyer</p>
                                <p className="font-medium text-gray-900 dark:text-white">{transfer.buyer?.name || 'Unknown buyer'}</p>
                                <p className="break-all">{transfer.buyer?.email || 'No email available'}</p>
                            </div>
                        </div>
                        <p><span className="font-medium">Sale Price:</span> INR {Number(transfer.salePrice || 0).toLocaleString()}</p>
                        <p><span className="font-medium">Transfer Type:</span> {transfer.transferType || 'FULL_TRANSFER'}</p>
                        <p><span className="font-medium">Share:</span> {transfer.sharePercentage || 100}%</p>
                        <p><span className="font-medium">Area:</span> {transfer.land?.area || 0} sq.ft</p>
                        <p><span className="font-medium">Documents:</span> {transfer.documentsVerified ? 'Verified' : 'Waiting for admin verification'}</p>
                        <details className="text-xs text-gray-500 dark:text-gray-400">
                            <summary className="cursor-pointer">Technical IDs</summary>
                            <div className="mt-2 space-y-1">
                                <p className="break-all">Transfer: {transfer.id}</p>
                                <p className="break-all">Land: {transfer.land?.id}</p>
                                <p className="break-all">Seller: {transfer.seller?.id}</p>
                                <p className="break-all">Buyer: {transfer.buyer?.id}</p>
                            </div>
                        </details>
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row gap-3">
                        {!transfer.documentsVerified && (
                            <button
                                onClick={() => onVerifyDocuments(transfer.id)}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                            >
                                Verify Documents
                            </button>
                        )}
                        <button
                            onClick={() => onApprove(transfer.id)}
                            disabled={!transfer.documentsVerified}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${transfer.documentsVerified
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                                }`}
                        >
                            Approve Transfer
                        </button>
                        <button
                            onClick={() => onReject(transfer.id)}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [lands, setLands] = useState([]); // Start empty, fetch on load
    const [transferRequests, setTransferRequests] = useState([]);
    const [selectedLand, setSelectedLand] = useState(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        verifiedLands: 0,
        pendingVerifications: 0,
        myProperties: 0,
        pendingTransfers: 0
    });

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
                if (activeTab === 'overview') {
                    const [verifiedLands, pendingLands, myLands, pendingTransfers] = await Promise.all([
                        getAllLands(),
                        user.role === 'ADMIN' ? getPendingLands() : Promise.resolve([]),
                        user.role === 'OWNER' ? getMyLands() : Promise.resolve([]),
                        user.role === 'ADMIN' ? getPendingTransfers() : Promise.resolve([])
                    ]);

                    setStats({
                        verifiedLands: verifiedLands.length,
                        pendingVerifications: pendingLands.length,
                        myProperties: myLands.length,
                        pendingTransfers: pendingTransfers.length
                    });

                    data = user.role === 'OWNER' ? myLands : [...verifiedLands, ...pendingLands];
                    setTransferRequests(pendingTransfers);
                } else if (user.role === 'ADMIN' && activeTab === 'verify') {
                    data = await getPendingLands();
                } else if (user.role === 'ADMIN' && activeTab === 'transfers') {
                    setTransferRequests(await getPendingTransfers());
                } else if (user.role === 'OWNER' && (activeTab === 'my-lands' || activeTab === 'map-view')) {
                    data = await getMyLands();
                } else {
                    data = await getAllLands();
                }

                setLands(data || []);
            } catch (err) {
                console.error("Fetch failed", err);
                setLands([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, activeTab, currentUserId]);

    const handleRegister = async (data) => {
        try {
            const { document, ...landPayload } = data;
            const savedLand = await registerLand(landPayload);

            if (document) {
                await uploadLandDocument(savedLand.id, document, 'PROOF');
            }

            alert(document
                ? "Land registration and document upload submitted successfully!"
                : "Land registration submitted successfully!");
            setActiveTab('my-lands');
        } catch (e) {
            console.error("Land registration failed", e);
            alert("Land registration failed. Please confirm the backend is running and try again.");
        }
    };

    const handleVerify = async (id) => {
        try {
            await verifyLand(id);
            alert("Land Verified (Backend)!");
            setLands(prev => prev.filter(l => l.id !== id));
        } catch (e) {
            console.error("Land verification failed", e);
            alert("Land verification failed. Please confirm the backend is running and try again.");
        }
    };

    const openTransferModal = (land) => {
        setSelectedLand(land);
        setIsTransferModalOpen(true);
    };

    const onConfirmTransfer = async (landId, transferData) => {
        try {
            await initiateTransfer({ landId, sellerId: currentUserId, ...transferData });
            alert("Transfer Request Initiated (Backend)!");
            setIsTransferModalOpen(false);
        } catch (e) {
            console.error("Transfer request failed", e);
            alert(e.message || "Transfer request failed. Please confirm the backend is running and try again.");
            setIsTransferModalOpen(false);
        }
    };

    const refreshPendingTransfers = async () => {
        const pendingTransfers = await getPendingTransfers();
        setTransferRequests(pendingTransfers);
        setStats(prev => ({ ...prev, pendingTransfers: pendingTransfers.length }));
    };

    const handleVerifyTransferDocuments = async (id) => {
        try {
            await verifyTransferDocuments(id);
            alert("Transfer documents verified.");
            await refreshPendingTransfers();
        } catch (e) {
            console.error("Transfer document verification failed", e);
            alert(e.response?.data?.message || e.message || "Transfer document verification failed.");
        }
    };

    const handleApproveTransfer = async (id) => {
        try {
            await approveTransfer(id, "Approved by registrar");
            alert("Transfer approved and ownership committed.");
            await refreshPendingTransfers();
        } catch (e) {
            console.error("Transfer approval failed", e);
            alert(e.response?.data?.message || e.message || "Transfer approval failed. Verify documents before approval.");
        }
    };

    const handleRejectTransfer = async (id) => {
        try {
            await rejectTransfer(id, "Rejected by registrar");
            alert("Transfer rejected.");
            await refreshPendingTransfers();
        } catch (e) {
            console.error("Transfer rejection failed", e);
            alert(e.response?.data?.message || e.message || "Transfer rejection failed.");
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

                    {activeTab === 'overview' && <Overview user={user} lands={lands} stats={stats} />}

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

                    {activeTab === 'transfers' && (
                        <div className="animate-fade-in">
                            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Pending Transfer Approvals</h1>
                            <TransferApprovalList
                                transfers={transferRequests}
                                onVerifyDocuments={handleVerifyTransferDocuments}
                                onApprove={handleApproveTransfer}
                                onReject={handleRejectTransfer}
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
