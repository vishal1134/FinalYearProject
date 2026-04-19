import React, { useEffect, useState } from 'react';
import { Upload, MapPin, ImageIcon } from 'lucide-react';

const LandRegistrationForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        surveyNumber: '',
        district: '',
        village: '',
        area: '',
        price: '',
        document: null,
        image: null,
    });
    const [previewUrl, setPreviewUrl] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0] ?? null;
        setFormData(prev => ({ ...prev, image: file }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    useEffect(() => {
        if (!formData.image) {
            setPreviewUrl('');
            return;
        }

        const nextPreviewUrl = URL.createObjectURL(formData.image);
        setPreviewUrl(nextPreviewUrl);

        return () => {
            URL.revokeObjectURL(nextPreviewUrl);
        };
    }, [formData.image]);

    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin className="text-blue-600" />
                Register New Land
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Survey Number</label>
                        <input
                            type="text"
                            name="surveyNumber"
                            value={formData.surveyNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. 101/A"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                        <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Kanchipuram"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                        <input
                            type="text"
                            name="village"
                            value={formData.village}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Sriperumbudur"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Area (sq.ft)</label>
                        <input
                            type="number"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. 2400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Market Value (₹)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. 5000000"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Legal Documents</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <span className="text-sm">Click to upload Sale Deed (PDF/Image)</span>
                    </div>
                </div>

                <div>
                    <label htmlFor="land-image" className="block text-sm font-medium text-gray-700 mb-2">Upload Land Image</label>
                    <label
                        htmlFor="land-image"
                        className="border-2 border-dashed border-blue-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                        <ImageIcon className="w-8 h-8 mb-2 text-blue-500" />
                        <span className="text-sm font-medium">
                            {formData.image ? formData.image.name : 'Choose a land photo to attach to this registration'}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">Accepted formats: JPG, PNG, WEBP</span>
                    </label>
                    <input
                        id="land-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />

                    {previewUrl && (
                        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                            <img
                                src={previewUrl}
                                alt="Land preview"
                                className="h-56 w-full object-cover"
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                    Submit for Verification
                </button>
            </form>
        </div>
    );
};

export default LandRegistrationForm;
