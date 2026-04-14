import React from 'react';
import { ArrowRightLeft, BadgeIndianRupee, CalendarDays, MapPin } from 'lucide-react';

const TransferVerificationList = ({ transfers, onApprove }) => {
    if (transfers.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300">
                <p className="text-gray-500 dark:text-gray-400">No pending transfer requests found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {transfers.map((transfer) => (
                <div
                    key={transfer.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300"
                >
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 font-semibold">
                                Pending Transfer
                            </p>
                            <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                                Survey No: {transfer.surveyNumber || transfer.landId}
                            </h3>
                        </div>
                        <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-xs font-bold">
                            Awaiting Admin
                        </span>
                    </div>

                    <div className="space-y-3 text-sm mb-5">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{transfer.village && transfer.district ? `${transfer.village}, ${transfer.district}` : `Land ID: ${transfer.landId}`}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                            <span>{transfer.sellerId} to {transfer.buyerId}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <BadgeIndianRupee className="w-4 h-4 text-gray-400" />
                            <span>Sale Price: Rs. {Number(transfer.salePrice || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <CalendarDays className="w-4 h-4 text-gray-400" />
                            <span>{transfer.requestDate}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => onApprove(transfer.id)}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        Verify Transfer
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TransferVerificationList;
