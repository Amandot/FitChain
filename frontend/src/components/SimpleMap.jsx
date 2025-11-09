import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './SimpleMap.css';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const currentLocationIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="#ffffff"/>
        </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
});

const trackingPointIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="6" cy="6" r="4" fill="#D4AF37" stroke="#ffffff" stroke-width="1"/>
        </svg>
    `),
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6]
});

// Component to handle map updates
const MapUpdater = ({ center, trackingPoints }) => {
    const map = useMap();

    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);

    useEffect(() => {
        if (trackingPoints.length > 1) {
            const bounds = L.latLngBounds(trackingPoints);
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [trackingPoints, map]);

    return null;
};

const SimpleMap = ({ isTracking, currentPosition, path }) => {
    const [trackingPoints, setTrackingPoints] = useState([]);
    const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC
    const mapRef = useRef();

    // Update tracking points when path changes
    useEffect(() => {
        if (path && path.length > 0) {
            setTrackingPoints(path);
            if (path.length === 1) {
                setMapCenter(path[0]);
            }
        }
    }, [path]);

    // Update map center when current position changes
    useEffect(() => {
        if (currentPosition && currentPosition[0] && currentPosition[1]) {
            setMapCenter(currentPosition);
        }
    }, [currentPosition]);

    // Get user's location on component mount
    useEffect(() => {
        if (navigator.geolocation && !currentPosition) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = [position.coords.latitude, position.coords.longitude];
                    setMapCenter(pos);
                },
                (error) => {
                    console.log('Location error:', error);
                    // Keep default location
                },
                { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
            );
        }
    }, [currentPosition]);

    return (
        <div className="simple-map-container">
            <div className="leaflet-map-wrapper">
                <MapContainer
                    center={mapCenter}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    ref={mapRef}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapUpdater center={mapCenter} trackingPoints={trackingPoints} />

                    {/* Current position marker */}
                    {currentPosition && currentPosition[0] && currentPosition[1] && (
                        <Marker position={currentPosition} icon={currentLocationIcon}>
                            <Popup>
                                <div className="popup-content">
                                    <strong>📍 Current Location</strong>
                                    <br />
                                    Lat: {currentPosition[0].toFixed(6)}
                                    <br />
                                    Lng: {currentPosition[1].toFixed(6)}
                                    <br />
                                    Status: {isTracking ? '🏃‍♂️ Tracking' : '⏸️ Stopped'}
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Tracking path */}
                    {trackingPoints.length > 1 && (
                        <Polyline
                            positions={trackingPoints}
                            color="#D4AF37"
                            weight={4}
                            opacity={0.8}
                            smoothFactor={1}
                        />
                    )}

                    {/* Tracking points markers */}
                    {trackingPoints.map((point, index) => (
                        index > 0 && index < trackingPoints.length - 1 && (
                            <Marker
                                key={index}
                                position={point}
                                icon={trackingPointIcon}
                            >
                                <Popup>
                                    <div className="popup-content">
                                        <strong>📍 Tracking Point {index}</strong>
                                        <br />
                                        Lat: {point[0].toFixed(6)}
                                        <br />
                                        Lng: {point[1].toFixed(6)}
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    ))}
                </MapContainer>
            </div>

            {/* Map info overlay */}
            <div className="map-info">
                <motion.div
                    className="info-badge"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <span className="info-label">📍 Points</span>
                    <span className="info-value">{trackingPoints.length}</span>
                </motion.div>
                <motion.div
                    className="info-badge"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <span className="info-label">🎯 Status</span>
                    <span className="info-value">{isTracking ? 'Active' : 'Ready'}</span>
                </motion.div>
                {trackingPoints.length > 1 && (
                    <motion.div
                        className="info-badge"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <span className="info-label">🛣️ Path</span>
                        <span className="info-value">Connected</span>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SimpleMap;