//Issue #2 version of the results page, solely to prove that data is loading

import { useEffect, useState } from 'react';
import ZipSeaarchBar from '../components/ZipSearchBar'
import { loadResources, findByZip } from '../services/foodResources';


export default function ListResultsPage() {
    const [allResources, setAllResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [searchedZip, setSearchedZip] = useState('');

    //Downloads data once when the page first opens
    useEffect(() => {
        loadResources()
            .then((resources) => setAllResources(resources))
            .catch((error) => setLoadError(error.message))
            .finally(() => setLoading(false));
    }, []);

    const results = findByZip(allResources, searchedZip);

    return (
        <main>
            <h1>Find Food Near You</h1>

            <ZipSeaarchBar onSearch={setSearchedZip} />

            {loading &&  <p>Loading...</p>}
            {loadError && <p>{loadError}</p>}
            {!loading && !loadError && searchedZip === '' && (<p>Please enter a ZIP code to find food near you.</p>)}
            {!loading && !loadError && searchedZip !== '' && (<ResultsList zip={searchedZip} results={results} />)}
        </main>
    );
}

function ResultsList({ zip, results }) {
    if (results.length === 0) {
        return <p>No resources found. Please try another zip code or change your filters.</p>;
    }

    return (
        <section>
            <h2>Results for {zip}</h2>
            <p>
                {results.length} {results.length === 1 ? 'place' : 'places'} found.
            </p>
            <ul>
                {results.map((resource) => (
                    <li>
                        <strong>{resource.name}</strong>
                        <div>{resource.address}</div>
                        <div>{resource.type} | {resource.status}</div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
