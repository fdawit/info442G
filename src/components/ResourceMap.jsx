import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ZIP_CENTERS from "../data/zipCenters.json";
import "./ResourceMap.css";
import { hasResourceCoordinates } from "../services/foodResources";

export default function ResourceMap({ zip, results, onSelect, selectedResource, center, searchQuery = '' }) {
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

        let mapCenter = center;
        if (!hasResourceCoordinates(mapCenter)) {
            mapCenter = ZIP_CENTERS[zip];
        }
        if (!hasResourceCoordinates(mapCenter)) {
            mapCenter = { lat: 47.6062, lng: -122.3321 };
        }
        mapRef.current.setView([mapCenter.lat, mapCenter.lng], 12);
    }, [zip, apiKey, center]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) {
            return;
        }
        const markers = L.layerGroup().addTo(map);
        results.forEach((resource, index) => {
            if (!hasResourceCoordinates(resource)) {
                return;
            }
            const icon = L.divIcon({
                className: "resource-map-marker",
                html: String(index + 1),
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });
            const marker = L.marker([resource.lat, resource.lng], {
                icon,
                title: resource.name || "Resource"
            }).addTo(markers);
            if (typeof onSelect === 'function') {
                marker.on("click", () => {
                    onSelect(resource);
                });
            }
        });
        return () => {
            markers.remove();
        };
    }, [results, onSelect, apiKey]);

    const hiddenCount = results.filter((resource) => {
        return !hasResourceCoordinates(resource);
    }).length;


    return (
        <div className="resource-map">
            {results.indexOf(selectedResource) !== -1 && (
                <p role="status">
                    {selectedResource.name} · {selectedResource.address}{" · "}
                    <Link to={"/resource-details/" + encodeURIComponent(selectedResource.id) + "?" + searchQuery}>View details</Link>
                </p>
            )}
            {(!apiKey || mapError) && (
                <p role="alert">Unable to load the map. Please try again.</p>
            )}
            {hiddenCount > 0 && <p>{hiddenCount} location(s) cannot be shown.</p>}
            <div className="resource-map-canvas" ref={elementRef} role="region" aria-label="Food resource map" />
        </div>
    );
}