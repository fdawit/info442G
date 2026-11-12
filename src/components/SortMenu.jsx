//Lets the user pick how results are ordered from distance or relevance

import Dropdown from './Dropdown'

const SORT_OPTIONS = [
  { value: 'distance', label: 'Distance' },
  { value: 'relevance', label: 'Relevance' },
];

export default function SortMenu({ value, onChange }) {
    return (
        <Dropdown id="sort-select" label="Sort by" value={value} options={SORT_OPTIONS} onChange={onChange}/>
    );
}