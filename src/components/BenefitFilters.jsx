import { useState } from 'react';
import Dropdown from './Dropdown';
import { CATEGORY_OPTIONS, DAYS } from '../utils/benefitLogic';

const DAY_OPTIONS = [
    { value: '', label: 'Any day' }, ...DAYS.map((day, index) => ({ value: String(index + 1), label: day })),
];

export default function BenefitFilters({ appliedCategory, appliedDay, onApply }) {
    const [category, setCategory] = useState(appliedCategory);
    const [day, setDay] = useState(appliedDay);

    function handleClear() {
        setCategory('all');
        setDay('');
        onApply('all', '');
    }

    return (
        <div className="benefit-filters">
        <Dropdown
            id="benefit-category"
            label="Resource type"
            value={category}
            options={CATEGORY_OPTIONS}
            onChange={setCategory}
        />
        <Dropdown
            id="benefit-day"
            label="Open on"
            value={day}
            options={DAY_OPTIONS}
            onChange={setDay}
        />
        <button className="benefit-apply" type="button" onClick={() => onApply(category, day)}>Apply</button>
        <button type="button" onClick={handleClear}>Clear</button>
        </div>
    );
}
