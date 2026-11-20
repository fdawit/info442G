const LOCATION_DENIED = 'Location is turned off. Enter a ZIP code instead.';
const LOCATION_NOT_FOUND = "We could not find your location. Enter a ZIP code instead.";

export default function LocationQuestion({ question, value, message, onChange, onMessage, onSkip }) {
    const usingLocation = Boolean(value && value.location);
        let zipText = '';
        if (value && value.zip) {
            zipText = value.zip;
        }
    
    function handleType(event) {
        onMessage('');
        onChange({ zip: event.target.value });
    }

    function handleUseLocation() {
        onMessage('');
        if (!navigator.geolocation) {
            onMessage(LOCATION_NOT_FOUND);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                onChange({ location: { lat: position.coords.latitude, lng: position.coords.longitude } });
            },
            (problem) => {
                if (problem.code === problem.PERMISSION_DENIED) {
                    onMessage(LOCATION_DENIED);
                } else {
                    onMessage(LOCATION_NOT_FOUND);
                }
            },
            { timeout: 15000 }
        );
    }

    return (
        <fieldset className="choice-question">
            <legend>{question.text}</legend>

            <label htmlFor="q2-zip">ZIP code</label>
            <input
                id="q2-zip"
                type="text"
                inputMode="numeric"
                value={zipText}
                placeholder={usingLocation ? 'Using your location' : ''}
                onChange={handleType}
            />

            <button type="button" onClick={handleUseLocation}>Use my location</button>
            <button type="button" onClick={onSkip}>Skip</button>

            {message && <p className="zip-search-error" role="alert">{message}</p>}
        </fieldset>
    );
}
