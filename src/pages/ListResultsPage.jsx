//Issue #1 version of the results page, solely to prove that data is loading

import { useEffect, useState } from 'react';
import { loadResources } from '../services/foodResources';

export default function ListResultsPage() {
    const [allResources, setAllResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    //Downloads data once when the page first opens
    useEffect(() => {
        loadResources()
            .then((resources) => setAllResources(resources))
            .catch((error) => setLoadError(error.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <main>
            <h1>Find Food Near You</h1>

            {loading &&  <p>Loading...</p>}
            {loadError && <p>{loadError}</p>}
            {!loading && !loadError && <ResultsList results={allResources} />}
        </main>
    );
}

function ResultsList({ results }) {
    if (results.length === 0) {
        return <p>No resources found.</p>
    }

    return (
        <section>
            <p>
                {results.length} {results.length == 1 ? 'place' : 'places'} found.
            </p>
            <ul>
                {results.map((resource) => (
                <li key={resource.name + resource.address}>
                    <strong>{resource.name}</strong>
                    <div>{resource.address}</div>
                    <div>{resource.type} | {resource.status}</div>
                </li>
                ))}
            </ul>
        </section>
    );
}
