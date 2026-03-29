import React, { useState } from 'react';
import { MapPin, CheckCircle, Clock } from 'lucide-react';
import HistoryModal from './HistoryModal';

const LandList = ({ lands, role, onVerify, onTransfer }) => {
    const [selectedHistoryLandId, setSelectedHistoryLandId] = useState(null);

    if (lands.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300">
                <p className="text-gray-500 dark:text-gray-400">No records found.</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lands.map((land) => (
                    <div key={land.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300">
                        <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                            {land.imageUrl ? (
                                <img src={land.imageUrl} alt="Land" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700">
                                    No Image
                                </div>
                            )}
                            <div className="absolute top-2 right-2">
                                {land.verified ? (
                                    <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Verified
                                    </span>
                                ) : (
                                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-xs font-bold">Pending</span>
                                )}
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">Survey No: {land.surveyNumber}</h3>
                            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3">
                                <MapPin className="w-4 h-4 mr-1" />
                                {land.village}, {land.district}
                            </div>

                            <div className="flex justify-between items-center mb-4 text-sm">
                                <div>
                                    <p className="text-gray-400">Area</p>
                                    <p className="font-semibold dark:text-gray-200">{land.area} sq.ft</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400">Price</p>
                                    <p className="font-semibold text-blue-600 dark:text-blue-400">₹{land.price.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setSelectedHistoryLandId(land.id)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Clock className="w-4 h-4" /> History
                                </button>

                                {role === 'ADMIN' && !land.verified && (
                                    <button
                                        onClick={() => onVerify(land.id)}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Verify
                                    </button>
                                )}

                                {role === 'OWNER' && land.verified && onTransfer && (
                                    <button
                                        onClick={() => onTransfer(land)}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                    >
                                        Transfer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedHistoryLandId && (
                <HistoryModal
                    isOpen={!!selectedHistoryLandId}
                    onClose={() => setSelectedHistoryLandId(null)}
                    landId={selectedHistoryLandId}
                />
            )}
        </>
    );
};

export default LandList;
