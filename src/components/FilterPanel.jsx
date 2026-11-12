//Food type and day filters
//Filters upon user clicking apply

import { useState } from 'react';
import Dropdown from './Dropdown';

const FOOD_TYPES = [{value: 'All Food', label: 'All Food'}, {value: 'Raw Food', label: 'Raw Food'}, {value: 'Cooked Food', label: 'Cooked Food'},];
const DAYS = [{ value: '', label: 'Any day' }, { value: 'Monday', label: 'Monday' }, { value: 'Tuesday', label: 'Tuesday' }, { value: 'Wednesday', label: 'Wednesday' }, { value: 'Thursday', label: 'Thursday' }, { value: 'Friday', label: 'Friday' }, { value: 'Saturday', label: 'Saturday' }, { value: 'Sunday', label: 'Sunday' },];

export default function FilterPanel({ appliedType, appliedDay, onApply }) {
    const [isOpen, setIsOpen] = useState(false);
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

    let summary = appliedType;
    if (appliedDay) {
        summary = summary + ', open ' + appliedDay;
    } else {
        summary = summary + ', any day';
    }

    return (
        <div>
            <button type="button" aria-expanded={isOpen} aria-controls="filter-options" onClick={() => setIsOpen(!isOpen)}> Filters</button>
            <p>Showing: {summary}</p>
                {isOpen && (
                <div id="filter-options">
                    <Dropdown id="food-type-select" label="Resource type" value={foodType} options={FOOD_TYPES} onChange={setFoodType} />
                    <Dropdown id="day-select" label="Availability" value={day} options={DAYS} onChange={setDay} />
                    <button type="button" onClick={handleApply}>Apply</button>
                    <button type="button" onClick={handleClear}>Clear</button>
                </div>
                 )}
        </div>
    );
}
