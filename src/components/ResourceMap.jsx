import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ZIP_CENTERS from "../data/zipCenters.json";
import "./ResourceMap.css";

export default function ResourceMap({ zip }) {
    const elementRef = useRef(null);
    const mapRef = useRef(null);
    const [mapError, setMapError] = useState(false);
    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

    useEffect(() => {
        if (!apiKey) {
            return;
        }

        const map = L.map(elementRef.current);
        mapRef.current = map;
        const tiles = L.tileLayer(
            "https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=" + encodeURIComponent(apiKey),
            {
                maxZoom: 20,
                crossOrigin: true,
                attribution: 'Powered by <a href="https://www.geoapify.com/">Geoapify</a> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>'
            }
        );
        tiles.on("tileerror", () => {
            setMapError(true);
        });
        tiles.addTo(map);

        return () => {
            tiles.off();
            map.remove();
            mapRef.current = null;
        };
    }, [apiKey]);

    useEffect(() => {
        if (!mapRef.current) {
            return;
        }

        const center = ZIP_CENTERS[zip] || { lat: 47.6062, lng: -122.3321 };
        mapRef.current.setView([center.lat, center.lng], 12);
    }, [zip, apiKey]);

    return (
        <div className="resource-map">
            {(!apiKey || mapError) && (
                <p role="alert">Unable to load the map. Please try again.</p>
            )}
            <div className="resource-map-canvas" ref={elementRef} role="region" aria-label="Food resource map" />
        </div>
    );
}