//Issue #3(Milestone1) version of the results page, to show search by zip, then filter by type and day

import { useEffect, useState } from 'react';
import ZipSearchBar from '../components/ZipSearchBar'
import FilterPanel from '../components/FilterPanel';
import { loadResources, findByZip, applyFilters } from '../services/foodResources';


export default function ListResultsPage() {
    const [allResources, setAllResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [searchedZip, setSearchedZip] = useState('');
    const [foodType, setFoodType] = useState('All Food');
    const [day, setDay] = useState('');

    //Downloads data once when the page first opens
    useEffect(() => {
        loadResources()
            .then((resources) => setAllResources(resources))
            .catch((error) => setLoadError(error.message))
            .finally(() => setLoading(false));
    }, []);

    function handleApplyFilters(newFoodType, newDay) {
        setFoodType(newFoodType);
        setDay(newDay);
    }

    let results = findByZip(allResources, searchedZip); //issue #2(M1)
    results = applyFilters(results, foodType, day); //issue #3 (M1)

    return (
        <main>
            <h1>Find Food Near You</h1>

            <ZipSearchBar onSearch={setSearchedZip} />
            <FilterPanel onApply={handleApplyFilters} />

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
                    <li key={resource.name + resource.address}>
                        <strong>{resource.name}</strong>
                        <div>{resource.address}</div>
                        <div>{resource.type} | {resource.status}</div>
                        <div>Open: {resource.days.length > 0 ? resource.days.join(', ') : 'Days not listed'}</div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
