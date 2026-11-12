import { useState } from "react";
import { searchBenefits } from "../services/benefits.js";
import {
  CATEGORY_OPTIONS,
  FOOD_OPTIONS,
  HOUSEHOLD_OPTIONS,
  DAYS,
  selectBenefits,
  isValidDistance
} from "../utils/benefitLogic.js";

const INITIAL_FILTERS = {
  category: "all",
  weekday: "",
  time: "",
  sortBy: "distance",
  preferences: []
};

function formatDistance(value) {
  if (!isValidDistance(value)) {
    return "Unavailable";
  }

  const miles = value / 1609.344;
  return miles.toFixed(2) + " miles";
}

function ChoiceGroup({ title, options, values, onChange }) {
  function handleChange(event) {
    const value = event.target.value;

    if (event.target.checked) {
      onChange([...values, value]);
    } else {
      const remaining = values.filter((item) => {
        return item !== value;
      });

      onChange(remaining);
    }
  }

  const inputs = options.map((option) => {
    return (
      <label key={option.value}>
        <input
          type="checkbox"
          value={option.value}
          checked={values.indexOf(option.value) !== -1}
          onChange={handleChange}
        />
        <span>{option.label}</span>
      </label>
    );
  });

  return (
    <fieldset>
      <legend>{title}</legend>
      {inputs}
    </fieldset>
  );
}

function BenefitCard({ program }) {
  const category = CATEGORY_OPTIONS.find((option) => {
    return option.value === program.category;
  });

  const nearest = program.locations[0];

  return (
    <article>
      <h3>{program.name}</h3>
      <p>{category.label}</p>
      <p>{nearest.address}</p>
      <p>Walking distance: {formatDistance(program.distanceMeters)}</p>
    </article>
  );
}

export function BenefitsDemoPage() {
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [category, setCategory] = useState(INITIAL_FILTERS.category);
  const [weekday, setWeekday] = useState(INITIAL_FILTERS.weekday);
  const [time, setTime] = useState(INITIAL_FILTERS.time);
  const [sortBy, setSortBy] = useState(INITIAL_FILTERS.sortBy);
  const [preferences, setPreferences] = useState(INITIAL_FILTERS.preferences);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);

  function currentFilters() {
    return {
      category,
      weekday,
      time,
      sortBy,
      preferences
    };
  }

  async function handleSearch(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");
    setSearchResult(null);

    try {
      const result = await searchBenefits(query);
      setSearchResult(result);
      setAppliedFilters(currentFilters());
    } catch (searchError) {
      setError(searchError.message);
    }

    setLoading(false);
  }

  function handleDayChange(event) {
    const value = event.target.value;
    setWeekday(value);

    if (!value) {
      setTime("");
    }
  }

  function handleApply(event) {
    event.preventDefault();

    if (time && !weekday) {
      setError("Choose a day before selecting a time.");
      return;
    }

    setError("");
    setAppliedFilters(currentFilters());
  }

  let results = [];

  if (searchResult) {
    results = selectBenefits(
      searchResult.data,
      appliedFilters,
      searchResult.distances
    );
  }

  let searchButtonText = "Search";

  if (loading) {
    searchButtonText = "Searching...";
  }

  const cards = results.map((program) => {
    return <BenefitCard key={program.id} program={program} />;
  });

  const categoryOptions = CATEGORY_OPTIONS.map((option) => {
    return (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    );
  });

  const dayOptions = DAYS.map((day, index) => {
    return (
      <option key={day} value={index + 1}>
        {day}
      </option>
    );
  });

    return (
    <main>
      <h1>Benefits</h1>

      <form onSubmit={handleSearch}>
        <label htmlFor="benefit-query">ZIP code</label>
        <input
          id="benefit-query"
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {searchButtonText}
        </button>
      </form>

      <form onSubmit={handleApply}>
        <fieldset disabled={loading}>
          <legend>Filters and sorting</legend>

          <p>
            <label>
              Category
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                }}
              >
                {categoryOptions}
              </select>
            </label>
          </p>

          <p>
            <label>
              Day
              <select value={weekday} onChange={handleDayChange}>
                <option value="">Any day</option>
                {dayOptions}
              </select>
            </label>
          </p>

          <p>
            <label>
              Time in Seattle
              <input
                type="time"
                value={time}
                disabled={!weekday}
                onChange={(event) => {
                  setTime(event.target.value);
                }}
              />
            </label>
          </p>

          <p>
            <label>
              Sort by
              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                }}
              >
                <option value="distance">Distance</option>
                <option value="relevance">Relevance</option>
              </select>
            </label>
          </p>

          <ChoiceGroup
            title="Preferences"
            options={[...FOOD_OPTIONS, ...HOUSEHOLD_OPTIONS]}
            values={preferences}
            onChange={setPreferences}
          />

          <button type="submit">Apply</button>
        </fieldset>
      </form>

      {error && <p role="alert">{error}</p>}

      <section aria-live="polite">
        {searchResult && (
          <>
            <h2>Results for ZIP {searchResult.zip}</h2>
            {results.length === 0 && (
              <p>No matching programs. Try another ZIP or change the filters.</p>
            )}
            {cards}
          </>
        )}
      </section>
    </main>
  );
}