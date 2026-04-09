import React, { useState } from 'react';
import { Upload, MapPin, LocateFixed } from 'lucide-react';

const LandRegistrationForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        surveyNumber: '',
        district: '',
        village: '',
        area: '',
        price: '',
        latitude: '',
        longitude: '',
        imageUrl: '',
        document: null
    });
    const [locationError, setLocationError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            area: Number(formData.area),
            price: Number(formData.price),
            latitude: Number(formData.latitude),
            longitude: Number(formData.longitude)
        });
        alert('Land Registration Request Sent!');
    };

    const useCurrentLocation = () => {
        setLocationError('');

        if (!navigator.geolocation) {
            setLocationError('Location access is not supported by this browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(7),
                    longitude: position.coords.longitude.toFixed(7)
                }));
            },
            () => setLocationError('Unable to fetch current location. Enter latitude and longitude manually.'),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Market Value (INR)</label>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                        <input
                            type="number"
                            step="any"
                            min="-90"
                            max="90"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. 13.0827"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                        <input
                            type="number"
                            step="any"
                            min="-180"
                            max="180"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. 80.2707"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Land Image URL (optional)</label>
                        <input
                            type="url"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="https://example.com/land-photo.jpg"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Add a hosted image URL if you want the land card to show a photo.
                        </p>
                    </div>
                </div>

                <div>
                    <button
                        type="button"
                        onClick={useCurrentLocation}
                        className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        <LocateFixed className="w-4 h-4" />
                        Use Current Location
                    </button>
                    {locationError && <p className="text-sm text-red-600 mt-2">{locationError}</p>}
                    <p className="text-xs text-gray-500 mt-2">
                        Enter exact land coordinates. The map will not generate approximate or random marker positions.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Legal Documents</label>
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <span className="text-sm">
                            {formData.document ? formData.document.name : 'Click to upload Sale Deed (PDF/Image)'}
                        </span>
                        <input
                            type="file"
                            name="document"
                            accept=".pdf,image/*"
                            className="hidden"
                            onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.files?.[0] || null }))}
                        />
                    </label>
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
