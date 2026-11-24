//The Benefits Eligibility Results List page
//Shows the programs that fit the user's questionnaire answers as cards
//ZIP search, sorting, and filters all live in the page address, so Back to results on a program page will return ot the same list

import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import ZipSearchBar from '../components/ZipSearchBar';
import SortMenu from '../components/SortMenu';
import ResourceCard from '../components/ResourceCard';
import BenefitFilters from '../components/BenefitFilters';
import { loadSavedAnswers } from '../utils/storage';
import { searchBenefits } from '../services/benefits';
import { selectBenefits, CATEGORY_OPTIONS, isValidDistance } from '../utils/benefitLogic';
import { answerTags, isEligible, startingZip } from '../utils/benefitMatching';
import './BenefitsResultsPage.css';

const PAGE_SIZE = 10;

export default function BenefitsResultsPage() {
    const saved = loadSavedAnswers();

    if (!saved) {
        return (
            <main>
                <h1>Benefits Eligibility Results</h1>
                <p role="alert">Your questionnaire answers have expired.</p>
                <p><Link to="/benefits-check">Retake the eligibility check</Link></p>
            </main>
        );
    }
    return <ResultsList saved={saved} />;
}

function ResultsList({ saved }) {
    const answers = saved.answers;
    const [searchParams, setSearchParams] = useSearchParams();

    let zip = startingZip(answers);
    if (searchParams.has('zip')) {
        zip = searchParams.get('zip');
    }
    const category = searchParams.get('category') || 'all';
    const day = searchParams.get('day') || '';
    let sortBy = searchParams.get('sort');
    if (sortBy !== 'relevance') {
        sortBy = 'distance';
    }

    const [response, setResponse] = useState(null);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const endOfListRef = useRef(null);

    useEffect(() => {
        let active = true;
        searchBenefits(zip)
            .then((result) => {
                if (active) {
                setResponse({ zip: zip, result: result });
                }
            })
            .catch(() => {
                if (active) {
                setResponse({ zip: zip, failed: true });
                }
            });
        return () => {
            active = false;
        };
    }, [zip]);

    const loading = !response || response.zip !== zip;
    const failed = !loading && response.failed;

    let fitting = [];
    let results = [];
    if (!loading && !failed) {
        const data = response.result.data;
        const eligibleData = { ...data, programs: data.programs.filter((p) => isEligible(p, answers)) };
        const preferences = answerTags(answers);
        fitting = selectBenefits(eligibleData, { category: 'all', weekday: '', time: '', sortBy, preferences }, {});
        results = selectBenefits(
            eligibleData,
            { category: category, weekday: day, time: '', sortBy: sortBy, preferences: preferences },
            response.result.distances
        );
    }

    useEffect(() => {
        const endOfList = endOfListRef.current;
        if (!endOfList) {
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setVisibleCount((count) => count + PAGE_SIZE);
            }
        });
        observer.observe(endOfList);
        return () => observer.disconnect();
    }, [results.length, visibleCount]);

    function updateAddress(changes) {
        const parameters = new URLSearchParams(searchParams);
        for (const key of Object.keys(changes)) {
            parameters.set(key, changes[key]);
        }
        setSearchParams(parameters);
        setVisibleCount(PAGE_SIZE);
    }

    const shown = results.slice(0, visibleCount);

    return (
        <main>
            <h1>Benefits Eligibility Results</h1>

            {!saved.incomeAvailable && <p>Income rules could not load, so these results are general.</p>}
            
            <div className="benefit-search-controls">
                <ZipSearchBar
                    key={zip}
                    id="benefits-zip"
                    initialZip={zip}
                    onSearch={(newZip) => updateAddress({ zip: newZip })}
                />

                <BenefitFilters
                    key={category + '|' + day}
                    appliedCategory={category}
                    appliedDay={day}
                    onApply={(newCategory, newDay) => updateAddress({ category: newCategory, day: newDay })}
                />

                <SortMenu value={sortBy} onChange={(newSort) => updateAddress({ sort: newSort })} />
            </div>

            {loading && <p>Loading...</p>}
            {failed && <p role="alert">Unable to load eligibility results. Please try again.</p>}
            
            {!loading && !failed && (
                <section>
                    <h2>{zip ? 'Programs near ' + zip : 'Programs everywhere'}</h2>
                    <p>
                        {results.length} {results.length === 1 ? 'program' : 'programs'} found.</p>

                    {fitting.length === 0 && (
                        <>
                            <p>No programs match your answers.</p>
                            <p><Link to="/benefits-check">Retake the eligibility check</Link></p>
                        </>
                    )}

                    {fitting.length > 0 && results.length === 0 && (
                        <p>No programs match these filters. Please choose a different filter.</p>
                    )}

                    <ul className="benefit-results">
                        {shown.map((program) => (
                            <li key={program.id}>
                                <BenefitCard program={program} query={searchParams.toString()} />
                            </li>
                        ))}
                    </ul>

                    {visibleCount < results.length && <div ref={endOfListRef} className="end-of-list" />}
                </section>
            )}
        </main>
    );
}

function BenefitCard({ program, query }) {
    const nearest = program.locations[0];
    const category = CATEGORY_OPTIONS.find((option) => option.value === program.category);
    
    let distance = 'Distance not available';
    if (isValidDistance(program.distanceMeters)) {
        distance = (program.distanceMeters / 1609.344).toFixed(1) + ' mi walk';
    }

    const link = '/benefits/' + encodeURIComponent(program.id) + '?location=' + encodeURIComponent(nearest.id) + '&' + query;

    return (
        <Link to={link} className="benefit-card-link">
            <ResourceCard
                name={program.name}
                category={category ? category.label : ''}
                address={nearest.address}
                photo={null}
            >
                <p>{distance}</p>
            </ResourceCard>
        </Link>
    );
}
