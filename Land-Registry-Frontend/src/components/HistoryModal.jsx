import React, { useState, useEffect } from 'react';
import { X, Clock, User, CheckCircle } from 'lucide-react';
import api from '../services/api';

const HistoryModal = ({ isOpen, onClose, landId }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && landId) {
            fetchHistory();
        }
    }, [isOpen, landId]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/history/${landId}`);
            setHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Ownership History
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">No history found for this property.</div>
                    ) : (
                        <div className="relative border-l-2 border-blue-100 ml-3 space-y-8">
                            {history.map((record, index) => (
                                <div key={record.id || index} className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-blue-700 text-sm">{record.action}</span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(record.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {record.previousOwnerId && (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-red-400 text-xs">From:</span>
                                                    <span className="font-medium">{record.previousOwnerId}</span>
                                                </div>
                                            )}
                                            {record.newOwnerId && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-500 text-xs">To:</span>
                                                    <span className="font-medium">{record.newOwnerId}</span>
                                                </div>
                                            )}
                                            {!record.previousOwnerId && !record.newOwnerId && (
                                                <span className="italic">System Event</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 text-center">
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Close</button>
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
