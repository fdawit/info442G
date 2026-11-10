import { hasCoordinates, isValidDistance } from "../utils/benefitLogic.js";

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