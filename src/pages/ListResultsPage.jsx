import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import ZipSearchBar from '../components/ZipSearchBar'
import FilterPanel from '../components/FilterPanel';
import SortMenu from '../components/SortMenu';
import ResourceCard from '../components/ResourceCard';
import { loadResources, findNearZip, applyFilters, addDistances, sortByDistance, sortByRelevance, } from '../services/foodResources';
import './ListResultsPage.css';


export default function ListResultsPage() {
    const [allResources, setAllResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [foodType, setFoodType] = useState('All Food');
    const [day, setDay] = useState('');
    const [sortBy, setSortBy] = useState('distance');
    const [searchParams, setSearchParams] = useSearchParams();
    const searchedZip = searchParams.get('zip') || '';



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

    function handleSearch(zip) {
        setSearchParams({ zip: zip }, { replace: zip === searchedZip});
    }

    let results = findNearZip(allResources, searchedZip, 3); //issue #2(M1)
    results = applyFilters(results, foodType, day); //issue #3 (M1)
    addDistances(results, searchedZip); //issue #4 (M1)
    if (sortBy === 'distance') {
        results = sortByDistance(results);
    } else {
        results = sortByRelevance(results, day);
    }


    return (
        <main>
            <h1>Find Food Near You</h1>

            <ZipSearchBar key={searchedZip} id="page-zip" initialZip={searchedZip} onSearch={handleSearch} />
            <FilterPanel onApply={handleApplyFilters} />
            <SortMenu value={sortBy} onChange={setSortBy} />

            {loading &&  <p>Loading...</p>}
            {loadError && <p>{loadError}</p>}
            {!loading && !loadError && searchedZip === '' && (<p>Enter a ZIP code to find food near you.</p>)}
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
            <ul className="results-grid">
                {results.map((resource) => (
                    <li key={resource.name + resource.address}>
                        <ResourceCard name={resource.name} category={resource.type} address={resource.address} photo={resource.photo}>
                            <p>Status: {resource.status || 'Unknown'}</p>
                            <p>Open: {resource.days.length > 0 ? resource.days.join(', ') : 'Days not listed'}</p>
                            <p>{resource.distance === null ? 'Distance not available' : resource.distance.toFixed(1) + ' mi'}</p>
                        </ResourceCard>
                    </li>
                ))}
            </ul>
        </section>
    );
}
