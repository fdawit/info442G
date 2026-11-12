// A zip code box and a search button
// Used in the navbar and on the search page

import { useState } from 'react';
import { isFiveDigits } from '../services/foodResources'
import './ZipSearchBar.css'

export default function ZipSearchBar({ id = 'zip-input', initialZip = '', onSearch }) {
    const [zipText, setZipText] = useState(initialZip);
    const [error, setError] =useState('');

    function handleSubmit(event) {
        event.preventDefault()

        const zip = zipText.trim();
        if (!isFiveDigits(zip)) {
            setError('Please enter a 5-digit ZIP code.');
            return;
        }

        setError('')
        onSearch(zip)
    }

    return (
        <form className="zip-search" onSubmit={handleSubmit}>
            <label htmlFor={id}>ZIP code: </label>
            <input id={id} type="text" inputMode="numeric" value={zipText} onChange={(event) => setZipText(event.target.value)}/>
            <button type="submit">Search</button>
            {error && <p className="zip-search-error">{error}</p>}
        </form>
    );
}
