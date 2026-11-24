import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import ZipSearchBar from '../components/ZipSearchBar'
import FilterPanel from '../components/FilterPanel';
import SortMenu from '../components/SortMenu';
import ResourceCard from '../components/ResourceCard';
import ResourceMap from '../components/ResourceMap';
import { loadResources, findNearZip, applyFilters, addDistances, sortByDistance, sortByRelevance, isFiveDigits } from '../services/foodResources';
import './ListResultsPage.css';


export default function ListResultsPage() {
    const [allResources, setAllResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [selectedResource, setSelectedResource] = useState(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchedZip = (searchParams.get('zip') || '').trim();
    const hasValidZip = isFiveDigits(searchedZip);
    let foodType = searchParams.get('type');
    if (foodType !== 'Raw Food' && foodType !== 'Cooked Food') {
        foodType = 'All Food';
    }
    let day = searchParams.get('day') || '';
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (days.indexOf(day) === -1) {
        day = '';
    }
    const isMapView = searchParams.get('view') === 'map';
    let sortBy = searchParams.get("sort");
    if (sortBy !== "relevance") {
        sortBy = "distance";
    }



    //Downloads data once when the page first opens
    useEffect(() => {
        loadResources()
            .then((resources) => setAllResources(resources))
            .catch((error) => setLoadError(error.message))
            .finally(() => setLoading(false));
    }, []);

    function handleApplyFilters(newFoodType, newDay) {
        const parameters = new URLSearchParams(searchParams);
        parameters.set('type', newFoodType);
        parameters.set('day', newDay);
        setSearchParams(parameters, {
            replace: foodType === newFoodType && day === newDay
        });
        setSelectedResource(null);
    }

    function handleSearch(zip) {
        setSelectedResource(null);
        const parameters = new URLSearchParams(searchParams);
        parameters.set("zip", zip);
        setSearchParams(parameters, { replace: zip === searchedZip });
    }

    function handleSort(value) {
        const parameters = new URLSearchParams(searchParams);
        parameters.set("sort", value);
        setSearchParams(parameters);
    }

    function handleView(value) {
        const parameters = new URLSearchParams(searchParams);
        parameters.set("view", value);
        setSearchParams(parameters);
    }

    function handleToggleFilters() {
        setFiltersOpen(!filtersOpen);
    }

    let results = [];
    if (hasValidZip) {
        results = findNearZip(allResources, searchedZip, 3);
        results = applyFilters(results, foodType, day);
        addDistances(results, searchedZip);
        if (sortBy === 'distance') {
            results = sortByDistance(results);
        } else {
            results = sortByRelevance(results, day);
        }
    }


    let pageClass = "food-search-page";
    if (!searchedZip) {pageClass += " food-search-home";}
    if (hasValidZip) {pageClass += " food-search-results";}

    return (
        <main className={pageClass}>
            <h1>{hasValidZip ? "Results for " + searchedZip : "Find Food Near You"}</h1>

            <div className="food-search-controls">
                <div className="food-search-row">
                    <ZipSearchBar key={searchedZip} id="page-zip" initialZip={searchedZip} onSearch={handleSearch} />
                    {hasValidZip && (
                        <button className="food-filter-toggle" type="button" aria-expanded={filtersOpen} aria-controls="filter-options" onClick={handleToggleFilters}>Filters</button>
                    )}
                    <SortMenu value={sortBy} onChange={handleSort} />
                    {hasValidZip && (
                        <div className="food-view-buttons">
                            <button type="button" aria-pressed={!isMapView} onClick={() => handleView("list")}>List</button>
                            <button type="button" aria-pressed={isMapView} onClick={() => handleView("map")}>Map</button>
                        </div>
                    )}
                </div>
                <FilterPanel appliedType={foodType} appliedDay={day} onApply={handleApplyFilters}
                    searchZip={searchedZip} isOpen={filtersOpen} onToggle={handleToggleFilters} showHeader={!hasValidZip} />
            </div>

            {hasValidZip && (
                <div className="food-applied-filters">
                    <span>{foodType}</span>
                    {day && <span>{day}</span>}
                </div>
            )}
            {searchedZip && !hasValidZip && <p role="alert">Please enter 5-digit zip code.</p>}
            {loading &&  <p>Loading...</p>}
            {loadError && <p>{loadError}</p>}
            {!loading && !loadError && searchedZip === '' && (<p className="search-hint">Enter a ZIP code to find food near you.</p>)}
            {!loading && !loadError && hasValidZip && (
                <p className="food-result-count">
                    {results.length} {results.length === 1 ? 'place' : 'places'} found.
                </p>
            )}
            {!loading && !loadError && hasValidZip && (
                <div className={isMapView ? "food-map-results" : "food-list-results"}>
                    <ResultsList results={results} selectedResource={selectedResource} searchQuery={searchParams.toString()} isMapView={isMapView} />
                    {isMapView && <ResourceMap zip={searchedZip} results={results} onSelect={setSelectedResource} selectedResource={selectedResource} searchQuery={searchParams.toString()} />}
                </div>
            )}
        </main>
    );
}

function ResultsList({ results, selectedResource, searchQuery, isMapView }) {

    return (
        <section>
            {results.length === 0 && (
                <p>No resources found. Please try another zip code or change your filters.</p>
            )}
            <ul className="results-grid">
                {results.map((resource, index) => (
                    <li key={resource.id} className={isMapView && resource === selectedResource ? "resource-selected" : ""}>
                        {isMapView && <p>Result {index + 1}</p>}
                        <ResourceCard name={resource.name} category={resource.type} address={resource.address} photo={resource.photo}>
                            <div className="food-card-actions">
                                <p>Distance: {resource.distance === null ? 'Distance not available' : resource.distance.toFixed(1) + ' mi'}</p>
                                <Link className="food-details-link" to={"/resource-details/" + encodeURIComponent(resource.id) + "?" + searchQuery}>View details</Link>
                            </div>
                        </ResourceCard>
                    </li>
                ))}
            </ul>
        </section>
    );
}
