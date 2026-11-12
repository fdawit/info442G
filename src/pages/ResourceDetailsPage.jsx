import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { loadResources } from "../services/foodResources";
import "./ResourceDetailsPage.css";

export default function ResourceDetailsPage() {
    const params = useParams();
    return <ResourceDetailsContent key={params.resourceId} resourceId={params.resourceId} />;
}

function ResourceDetailsContent({ resourceId }) {
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
        return <main><p>Loading...</p></main>;
    }
    if (loadError) {
        return <main><Link to="/">Back to results</Link><p role="alert">Unable to load resource details. Please try again.</p></main>;
    }
    if (!resource) {
        return <main><Link to="/">Back to results</Link><h1>404</h1><p>Resource not found.</p></main>;
    }
    return (
        <main className="resource-details-page">
            <Link to="/">Back to results</Link>
            <div className="resource-details-columns">
                <section>
                    <div className="resource-details-map">TO DO</div>
                    <h1>{resource.name}</h1>
                    <p>TO DO</p>
                    <h2>Contact information</h2>
                    <p>TO DO</p>
                </section>
                <section>
                    <h2>About resource</h2>
                    <p>TO DO</p>
                    <h2>Eligibility requirements</h2>
                    <p>TO DO</p>
                    <h2>Hours of operation</h2>
                    <p>TO DO</p>
                </section>
            </div>
        </main>
    );
}