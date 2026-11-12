import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { loadResources, hasResourceCoordinates } from "../services/foodResources";
import ResourceMap from "../components/ResourceMap";
import "./ResourceDetailsPage.css";

export default function ResourceDetailsPage() {
    const params = useParams();
    const [searchParams] = useSearchParams();
    const query = searchParams.toString();
    const backTo = query ? '/?' + query : '/';
    return <ResourceDetailsContent key={params.resourceId} resourceId={params.resourceId} backTo={backTo} />;
}

function ResourceDetailsContent({ resourceId, backTo }) {
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(resourceId !== undefined);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        if (!resourceId) {
            return;
        }
        let active = true;
        loadResources().then((resources) => {
            if (active) {
                setResource(resources.find((item) => item.id === resourceId));
            }
        }).catch(() => {
            if (active) {
                setLoadError(true);
            }
        }).finally(() => {
            if (active) {
                setLoading(false);
            }
        });
        return () => {
            active = false;
        };
    }, [resourceId]);

    if (loading) {
        return <main><Link to={backTo}>Back to results</Link><p>Loading...</p></main>;
    }
    if (loadError) {
        return <main><Link to={backTo}>Back to results</Link><p role="alert">Unable to load resource details. Please try again.</p></main>;
    }
    if (!resource) {
        return <main><Link to={backTo}>Back to results</Link><h1>404</h1><p>Resource not found.</p></main>;
    }
    return (
        <main className="resource-details-page">
            <Link to={backTo}>Back to results</Link>
            <div className="resource-details-columns">
                <section>
                    {hasResourceCoordinates(resource) ? (
                        <ResourceMap center={resource} results={[resource]} />
                    ) : <p>Map location not available.</p>}
                    <h1>{resource.name}</h1>
                    <p>{resource.type || "Information not available."}</p>
                    <p>
                        {resource.address ? (
                            <a href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(resource.address)} target="_blank" rel="noreferrer">
                                {resource.address}
                            </a>
                        ) : "Information not available."}
                    </p>
                    <h2>Contact information</h2>
                    {resource.phone && <p><a href={"tel:" + resource.phone}>{resource.phone}</a></p>}
                    {resource.website && (
                        <p><a href={resource.website} target="_blank" rel="noreferrer">Visit website</a></p>
                    )}
                    {!resource.phone && !resource.website && <p>Information not available.</p>}
                </section>
                <section>
                    <h2>About resource</h2>
                    <p>Information not available.</p>
                    <h2>Eligibility requirements</h2>
                    <p>{resource.whoTheyServe || "Information not available."}</p>
                    <h2>Hours of operation</h2>
                    {resource.days.length > 0 && <p>Open days: {resource.days.join(', ')}</p>}
                </section>
            </div>
        </main>
    );
}