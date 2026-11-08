// A zip code box and a search button for issue #2

import { useState } from 'react';
import { isFiveDigits } from '../services/foodResources'

export default function ZipSearchBar({ onSearch }) {
    const [zipText, setZipText] = useState('');
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
        <form onSubmit={handleSubmit}>
            <label htmlFor="zip-input">ZIP code</label>
            <input id="zip-input" type="text" inputMode="numeric" value={zipText} onChange={(event) => setZipText(event.target.value)}/>
            <button type="submit">Search</button>
            {error && <p>{error}</p>}
        </form>
    );
}