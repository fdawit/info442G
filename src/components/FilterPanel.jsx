//This is for issue #3 of API Integration Milestone
//Food type and day filters
//Filters upong user clicking apply

import { useState } from 'react';

const FOOD_TYPES = ['All Food', 'Raw Food', 'Cooked Food'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function FilterPanel({ onApply }) {
    const [foodType, setFoodType] = useState('All Food');
    const [day, setDay] = useState('');

    function handleApply() {
        onApply(foodType, day);
    }

    function handleClear() {
        setFoodType('All Food');
        setDay('');
        onApply('All Food', '');
    }

    return (
        <div>
            <fieldset>
                <legend>Food Type</legend>
                {FOOD_TYPES.map((type) => (
                    <label key={type}>
                        <input type="radio" name="food-type" value={type} checked={foodType === type} onChange={() => setFoodType(type)}/>
                        {type}
                    </label>
            ))}
            </fieldset>

            <label htmlFor="day-select">Open on</label>
            <select id="day-select" value={day} onChange={(event) => setDay(event.target.value)}>
                <option value="">Any Day</option>
                {DAYS.map((dayName) => (
                    <option key={dayName} value={dayName}>
                        {dayName}
                    </option>
            ))}
            </select>

            <button type="button" onClick={handleApply}>Apply</button>
            <button type="button" onClick={handleClear}>Clear</button>
        </div>
    );
}
