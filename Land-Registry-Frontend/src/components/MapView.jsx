import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const hasValidCoordinates = (land) => {
    const lat = Number(land.latitude);
    const lng = Number(land.longitude);

    return Number.isFinite(lat)
        && Number.isFinite(lng)
        && lat >= -90
        && lat <= 90
        && lng >= -180
        && lng <= 180;
};

const FitToLandMarkers = ({ lands }) => {
    const map = useMap();

    React.useEffect(() => {
        if (lands.length === 0) return;

        const bounds = L.latLngBounds(lands.map(land => [Number(land.latitude), Number(land.longitude)]));

        if (lands.length === 1) {
            map.setView(bounds.getCenter(), 16);
        } else {
            map.fitBounds(bounds, { padding: [32, 32], maxZoom: 16 });
        }
    }, [lands, map]);

    return null;
};

const MapView = ({ lands }) => {
    const defaultCenter = [13.0827, 80.2707];
    const landsWithCoordinates = lands.filter(hasValidCoordinates);

    return (
        <div className="space-y-3">
            {lands.length > 0 && landsWithCoordinates.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 text-sm">
                    No mapped lands yet. Register land with exact latitude and longitude to display it here.
                </div>
            )}

            <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-100 z-0">
                <MapContainer center={defaultCenter} zoom={10} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FitToLandMarkers lands={landsWithCoordinates} />
                    {landsWithCoordinates.map((land) => {
                        const lat = Number(land.latitude);
                        const lng = Number(land.longitude);

                        return (
                            <Marker key={land.id} position={[lat, lng]}>
                                <Popup>
                                    <div className="p-1">
                                        <h3 className="font-bold text-sm">{land.village}, {land.district}</h3>
                                        <p className="text-xs text-gray-500">Survey: {land.surveyNumber}</p>
                                        <p className="text-xs text-gray-500">Lat/Lng: {lat}, {lng}</p>
                                        <p className="font-bold text-blue-600">INR {Number(land.price || 0).toLocaleString()}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapView;
