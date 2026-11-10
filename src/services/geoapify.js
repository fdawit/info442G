import {
  hasCoordinates,
  isZip,
  isDigit,
  isValidDistance,
  firstFiveCharacters
} from "../utils/benefitLogic.js";

function getZipcode(value) {
  const postalCode = String(value || "");

  if (postalCode.length === 5 && isZip(postalCode)) {
    return postalCode;
  }

  if (postalCode.length !== 10 || postalCode[5] !== "-") {
    return "";
  }

  const zipcode = firstFiveCharacters(postalCode);

  if (!isZip(zipcode)) {
    return "";
  }

  for (let i = 6; i < postalCode.length; i++) {
    if (!isDigit(postalCode[i])) {
      return "";
    }
  }

  return zipcode;
}

export async function geocode(text, zipOnly, apiKey) {
  if (!apiKey) {
    throw new Error("Geoapify API key is missing.");
  }

  const parameters = new URLSearchParams({
    text,
    filter: "countrycode:us",
    format: "json",
    limit: "5",
    apiKey
  });

  if (zipOnly) {
    parameters.set("type", "postcode");
  }

  const response = await fetch(
    "https://api.geoapify.com/v1/geocode/search?" + parameters
  );

  if (!response.ok) {
    throw new Error("Address lookup failed: HTTP " + response.status);
  }

  const data = await response.json();

  if (!Array.isArray(data.results)) {
    throw new Error("The address response was not valid.");
  }

  const matches = data.results.map((row) => {
    return {
      label: row.formatted || text,
      zipcode: getZipcode(row.postcode),
      latitude: row.lat,
      longitude: row.lon,
      country: row.country_code,
      resultType: row.result_type
    };
  });

  return matches.filter((row) => {
    let correctType;

    if (zipOnly) {
      correctType = row.resultType === "postcode";
    } else {
      correctType = row.resultType === "building" ||
        row.resultType === "amenity" ||
        row.resultType === "street";
    }

    return row.country === "us" && correctType &&
      hasCoordinates(row) && isZip(row.zipcode);
  });
}

export async function getWalkingDistances(origin, locations, apiKey) {
  if (!apiKey) {
    throw new Error("Geoapify API key is missing.");
  }

  const targets = locations.filter(hasCoordinates);

  if (targets.length === 0) {
    return {};
  }

  const parameters = new URLSearchParams({ apiKey });

  const response = await fetch(
    "https://api.geoapify.com/v1/routematrix?" + parameters,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "walk",
        type: "short",
        units: "metric",
        sources: [
          { location: [origin.longitude, origin.latitude] }
        ],
        targets: targets.map((location) => {
          return {
            location: [location.longitude, location.latitude]
          };
        })
      })
    }
  );

  if (!response.ok) {
    throw new Error("Walking distance failed: HTTP " + response.status);
  }

  const data = await response.json();
  const routeRow = data.sources_to_targets && data.sources_to_targets[0];

  if (!Array.isArray(routeRow)) {
    throw new Error("The distance response was not valid.");
  }

  const distances = {};

  targets.forEach((location) => {
    distances[location.id] = null;
  });

  routeRow.forEach((cell, index) => {
    if (!cell) {
      return;
    }

    let targetIndex = index;

    if (Number.isInteger(cell.target_index)) {
      targetIndex = cell.target_index;
    }

    const location = targets[targetIndex];

    if (location && isValidDistance(cell.distance)) {
      distances[location.id] = cell.distance;
    }
  });

  return distances;
}