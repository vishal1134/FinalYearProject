import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix for default Leaflet marker icons not showing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapView = ({ lands }) => {
    // Default center: Chennai coordinates
    const defaultCenter = [13.0827, 80.2707];

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-100 z-0">
            <MapContainer center={defaultCenter} zoom={10} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {lands.map((land) => {
                    // Use actual coords if available, otherwise mock random scatter around Chennai for demo
                    const lat = land.latitude || (13.08 + (Math.random() - 0.5) * 0.1);
                    const lng = land.longitude || (80.27 + (Math.random() - 0.5) * 0.1);

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
