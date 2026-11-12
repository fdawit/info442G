import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ZIP_CENTERS from "../data/zipCenters.json";
import "./ResourceMap.css";

function hasMapCoordinates(resource) {
    return Number.isFinite(resource.lat) &&
        Number.isFinite(resource.lng) &&
        resource.lat >= -90 && resource.lat <= 90 &&
        resource.lng >= -180 && resource.lng <= 180;
}

export default function ResourceMap({ zip, results }) {
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

    useEffect(() => {
        const map = mapRef.current;
        if (!map) {
            return;
        }
        const markers = L.layerGroup().addTo(map);
        results.forEach((resource) => {
            if (!hasMapCoordinates(resource)) {
                return;
            }
            L.circleMarker([resource.lat, resource.lng], {
                radius: 8,
                color: "#ffffff",
                weight: 2,
                fillColor: "#195b40",
                fillOpacity: 1
            }).addTo(markers);
        });
        return () => {
            markers.remove();
        };
    }, [results, apiKey]);

    const hiddenCount = results.filter((resource) => {
        return !hasMapCoordinates(resource);
    }).length;


    return (
        <div className="resource-map">
            {(!apiKey || mapError) && (
                <p role="alert">Unable to load the map. Please try again.</p>
            )}
            {hiddenCount > 0 && <p>TO DO: {hiddenCount} location(s) cannot be shown.</p>}
            <div className="resource-map-canvas" ref={elementRef} role="region" aria-label="Food resource map" />
        </div>
    );
}