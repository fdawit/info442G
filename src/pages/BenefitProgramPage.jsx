//Item page for the results

import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import ResourceMap from '../components/ResourceMap';
import placeholderImage from '../assets/placeholder-food.svg';
import { loadProgramDetails } from '../services/benefits';
import { DAYS } from '../utils/benefitLogic';
import './BenefitProgramPage.css';

//This is a placeholder for certain info that we do not have yet
const PLACEHOLDER_TEXT = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores consequatur ullam, ea ratione a quod voluptas harum alias, illo non blanditiis quia soluta aut in perspiciatis omnis quasi explicabo et!'

export default function BenefitProgramPage() {
    const { programId } = useParams();
    const [searchParams] = useSearchParams();
    const locationId = searchParams.get('location');
    const backParameters = new URLSearchParams(searchParams);
    backParameters.delete('location');
    const backTo = '/benefits-results?' + backParameters.toString();
    const [response, setResponse] = useState(null);

    useEffect(() => {
        let active = true;
        loadProgramDetails(programId, locationId)
            .then((details) => {
                if (active) {
                    setResponse({ programId: programId, details: details });
                }
            })
            .catch(() => {
                if (active) {
                    setResponse({ programId: programId, failed: true });
                }
            });
        return () => {
            active = false;
        };
    }, [programId, locationId]);

    const backLink = <Link to={backTo}>Back to results</Link>;

    if (!response || response.programId !== programId) {
        return <main>{backLink}<p>Loading...</p></main>;
    }
    if (response.failed) {
        return <main>{backLink}<p role="alert">Unable to load program details. Please try again.</p></main>;
    }
    if (!response.details) {
        return <main>{backLink}<h1>Program not found</h1><p>We could not find that program.</p></main>;
    }

    const { program, organization, location, hours } = response.details;

    return(
        <main className="benefit-program">
            {backLink}
            <div className="benefit-program-layout">
                <div className="benefit-program-content">
                    <img className="benefit-program-photo" src={placeholderImage} alt="" />

                    <h1>{program.name || 'Name not available'}</h1>
                    <p>Offered by: {organization && organization.name ? organization.name : 'Not available'}</p>

                    <h2>Details</h2>
                    <p>{program.description || 'Not available'}</p>

                    <h2>How to apply</h2>
                    <p>{PLACEHOLDER_TEXT}</p>

                    <h2>Required documents</h2>
                    <p>{PLACEHOLDER_TEXT}</p>

                    <h2>Who can get it</h2>
                    <p>{PLACEHOLDER_TEXT}</p>
                </div>
                <div className="benefit-program-sidebar">
                    <h2>Location</h2>
                    <LocationMap location={location} />
                    <p>{location && location.address ? location.address : 'Address not available'}</p>

                    <h2>Hours</h2>
                    <HoursList hours={hours} />

                    <h2>Contact</h2>
                    <ul className="benefit-program-contact">
                        <li>
                            Website:{' '}
                            {program.website ? (
                                <a href={program.website} target="_blank" rel="noreferrer">{program.website}</a>
                            ) : 'Not available'}
                        </li>
                        <li>
                            Phone:{' '}
                            {program.phone ? <a href={'tel:' + program.phone}>{program.phone}</a> : 'Not available'}
                        </li>
                        <li>
                            Email:{' '}
                            {program.email ? <a href={'mailto:' + program.email}>{program.email}</a> : 'Not available'}
                        </li>
                    </ul>
                </div>
            </div>
        </main>
    );
}

function LocationMap({ location }) {
    const hasPlace = location && typeof location.latitude === 'number' && typeof location.longitude === 'number';
    if (!hasPlace) {
        return <p>Map not available</p>;
    }

    const place = { id: location.id, name: location.name, address: location.address, lat: location.latitude, lng: location.longitude };
    const search = location.address || location.latitude + ',' + location.longitude;
    const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(search);

    return (
        <div>
            <div className="benefit-program-map" onClick={() => window.open(googleMapsUrl, '_blank', 'noreferrer')}>
                <ResourceMap center={place} results={[place]} />
            </div>
            <p><a href={googleMapsUrl} target="_blank" rel="noreferrer">Open in Google Maps</a></p>
        </div>
    );
}

function HoursList({ hours }) {
    if (hours.length === 0) {
        return <p>Not available</p>;
    }
    return (
        <ul className="benefit-program-hours">
            {DAYS.map((day, index) => {
                const row = hours.find((item) => item.weekday === index + 1);
                return (
                    <li key={day}>
                        {day}: {row ? formatTime(row.opens_at) + ' to ' + formatTime(row.closes_at) : 'Closed'}
                    </li>
                );
            })}
        </ul>
    );
}

function formatTime(time) {
    const hour = Number(time.slice(0, 2));
    const minutes = time.slice(3, 5);

    let suffix = 'AM';

    if (hour >= 12) {
        suffix = 'PM';
    }

    let hour12 = hour % 12;

    if (hour12 === 0) {
        hour12 = 12;
    }
    
    return hour12 + ':' + minutes + ' ' + suffix;
}
