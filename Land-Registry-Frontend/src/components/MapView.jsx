import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix for default Leaflet marker icons not showing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DEFAULT_CENTER = [13.0827, 80.2707];

const hashCoordinateOffset = (seed, divisor) => {
    const hash = Array.from(String(seed ?? 'land')).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return ((hash % divisor) - divisor / 2) / 1000;
};

const getLandPosition = (land) => {
    if (land.latitude && land.longitude) {
        return [land.latitude, land.longitude];
    }

    return [
        DEFAULT_CENTER[0] + hashCoordinateOffset(land.id ?? land.surveyNumber, 100),
        DEFAULT_CENTER[1] + hashCoordinateOffset(land.surveyNumber ?? land.id, 120),
    ];
};

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapView = ({ lands }) => {
    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-100 z-0">
            <MapContainer center={DEFAULT_CENTER} zoom={10} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {lands.map((land) => {
                    const [lat, lng] = getLandPosition(land);

                    return (
                        <Marker key={land.id} position={[lat, lng]}>
                            <Popup>
                                <div className="p-1">
                                    <h3 className="font-bold text-sm">{land.village}, {land.district}</h3>
                                    <p className="text-xs text-gray-500">Survey: {land.surveyNumber}</p>
                                    <p className="font-bold text-blue-600">₹{land.price.toLocaleString()}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}
            </MapContainer>
        </div>
    );
};

export default MapView;
