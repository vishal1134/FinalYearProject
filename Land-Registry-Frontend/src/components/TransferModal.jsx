import React, { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';

const TransferModal = ({ land, isOpen, onClose, onConfirm }) => {
    const [buyerId, setBuyerId] = useState('');
    const [salePrice, setSalePrice] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onConfirm({ buyerId: buyerId.trim(), salePrice: Number(salePrice) });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <ArrowRightLeft className="text-blue-600" />
                        Transfer Ownership
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-sm text-gray-500">Property</p>
                        <p className="font-semibold text-gray-800">Survey No: {land.surveyNumber}</p>
                        <p className="text-xs text-gray-500">{land.village}, {land.district}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Buyer Email or User ID</label>
                        <input
                            type="text"
                            value={buyerId}
                            onChange={(e) => setBuyerId(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. owner2@gmail.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (₹)</label>
                        <input
                            type="number"
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. 6000000"
                            required
                        />
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 bg-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 px-4 rounded-lg bg-blue-600 font-medium text-white hover:bg-blue-700"
                        >
                            Initiate Transfer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransferModal;
