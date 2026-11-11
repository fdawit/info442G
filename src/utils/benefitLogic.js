export const CATEGORY_OPTIONS = [
  { value: "all", label: "All categories" },
  { value: "food_nutrition", label: "Food and nutrition benefits" },
  { value: "produce_market", label: "Produce and market benefits" },
  { value: "meal_delivery", label: "Meal delivery" }
];

export const FOOD_OPTIONS = [
  { value: "produce", label: "Fresh produce" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "baby_food", label: "Baby formula or baby food" },
  { value: "halal", label: "Halal" }
];

export const HOUSEHOLD_OPTIONS = [
  { value: "pregnancy", label: "Pregnant or had a baby in the last year" },
  { value: "child_under5", label: "Child under 5" },
  { value: "school_child", label: "Child in school (K-12)" },
  { value: "senior", label: "Age 60 or older" }
];

export const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday"
];

export function isDigit(value) {
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return digits.indexOf(value) !== -1;
}

export function isValidDistance(value) {
  return Number.isFinite(value) && value >= 0;
}

function isTime(value) {
  const time = String(value);

  if (time.length !== 5 || time[2] !== ":") {
    return false;
  }

  const positions = [0, 1, 3, 4];

  for (let i = 0; i < positions.length; i++) {
    if (!isDigit(time[positions[i]])) {
      return false;
    }
  }

  const hour = Number(time[0] + time[1]);
  const minute = Number(time[3] + time[4]);
  return hour <= 23 && minute <= 59;
}

export function isZip(value) {
  if (typeof value !== "string") {
    return false;
  }

  const zip = value.trim();

  if (zip.length !== 5) {
    return false;
  }
  for (let i = 0; i < zip.length; i++) {
    if (!isDigit(zip[i])) {
      return false;
    }
  }

  return true;
}

export function hasCoordinates(value) {
  return typeof value.latitude === "number" &&
    typeof value.longitude === "number" &&
    value.latitude >= -90 &&
    value.latitude <= 90 &&
    value.longitude >= -180 &&
    value.longitude <= 180;
}

export function compareDistance(first, second) {
  const firstIsValid = isValidDistance(first);
  const secondIsValid = isValidDistance(second);

  if (!firstIsValid && !secondIsValid) {
    return 0;
  }

  if (!firstIsValid) {
    return 1;
  }

  if (!secondIsValid) {
    return -1;
  }

  return first - second;
}

export function matchesHours(locationId, hours, weekday, time) {
  if (!weekday) {
    return !time;
  }

  const row = hours.find((item) => {
    return item.location_id === locationId &&
      item.weekday === Number(weekday);
  });

  if (!row) {
    return false;
  }

  if (!time) {
    return true;
  }

  if (!isTime(time)) {
    return false;
  }

  return time >= row.opens_at.slice(0, 5) &&
    time < row.closes_at.slice(0, 5);
}

export function selectBenefits(data, filters, distances) {
  const choices = [...filters.foodNeeds, ...filters.householdTags];

  const selectedTags = choices.filter((tag, index) => {
    return choices.indexOf(tag) === index;
  });

  const programs = data.programs.filter((program) => {
    return filters.category === "all" ||
      program.category === filters.category;
  });

  const results = [];

  programs.forEach((program) => {
    const links = data.links.filter((link) => {
      return link.program_id === program.id;
    });

    const locations = links.map((link) => {
      return data.locations.find((location) => {
        return location.id === link.location_id;
      });
    }).filter((location) => {
      return location && matchesHours(
        location.id,
        data.hours,
        filters.weekday,
        filters.time
      );
    }).map((location) => {
      const distance = distances[location.id];
      let distanceMeters = null;

      if (isValidDistance(distance)) {
        distanceMeters = distance;
      }

      return {
        ...location,
        distanceMeters
      };
    });

    locations.sort((a, b) => {
      const distanceOrder = compareDistance(
        a.distanceMeters,
        b.distanceMeters
      );
      if (distanceOrder !== 0) {
        return distanceOrder;
      }

      return a.name.localeCompare(b.name);
    });

    if (locations.length > 0) {
      const matchedTags = selectedTags.filter((tag) => {
        return program.match_tags.indexOf(tag) !== -1;
      });

      results.push({
        ...program,
        locations,
        relevanceScore: matchedTags.length,
        distanceMeters: locations[0].distanceMeters
      });
    }
  });

  results.sort((a, b) => {
    if (filters.sortBy === "relevance" && a.relevanceScore !== b.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }

    const distanceOrder = compareDistance(
      a.distanceMeters,
      b.distanceMeters
    );

    if (distanceOrder !== 0) {
      return distanceOrder;
    }

    const nameOrder = a.name.localeCompare(b.name);

    if (nameOrder !== 0) {
      return nameOrder;
    }
    return a.id.localeCompare(b.id);
  });

  return results;
}