//M1(#4) Let's the user pick how the results are ordered

export default function SortMenu({ value, onChange }) {
    return (
        <div>
            <label htmlFor="sort-select">Sort by</label>
            <select id="sort-select" value={value} onChange={(event) =>
            onChange(event.target.value)}>
                <option value="distance">Distance</option>
                <option value="relevance">Relevance</option>
            </select>
        </div>
    );
}