import { getSupabase } from "../lib/supabaseClient.js";
import { geocode, getWalkingDistances } from "./geoapify.js";
import {
  isZip,
  isDigit,
  hasCoordinates
} from "../utils/benefitLogic.js";

function getRows(result) {
  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    return [];
  }

  return result.data;
}

function looksLikeZip(value) {
  for (let i = 0; i < value.length; i++) {
    const character = value[i];

    if (!isDigit(character) &&
        character !== "-" &&
        character.trim() !== "") {
      return false;
    }
  }

  return true;
}

export async function loadBenefits(zip) {
  if (!isZip(zip)) {
    throw new Error("Enter a five-digit ZIP code.");
  }

  const client = getSupabase();
  const zipcode = zip.trim();

  const locationResult = await client.from("benefit_locations")
    .select("*").eq("zipcode", zipcode).eq("searchable", true);

  const data = {
    locations: getRows(locationResult),
    programs: [],
    links: [],
    hours: []
  };

  if (data.locations.length === 0) {
    return data;
  }

  const locationIds = data.locations.map((location) => {
    return location.id;
  });

  const linkResult = await client.from("benefit_program_locations")
    .select("*").in("location_id", locationIds);

  data.links = getRows(linkResult);

  if (data.links.length === 0) {
    return data;
  }

  const programIds = [];

  data.links.forEach((link) => {
    if (programIds.indexOf(link.program_id) === -1) {
      programIds.push(link.program_id);
    }
  });

  const programResult = await client.from("benefit_programs")
    .select("*").in("id", programIds);

  data.programs = getRows(programResult);

  const hourResult = await client.from("benefit_opening_hours")
    .select("*").in("location_id", locationIds);

  data.hours = getRows(hourResult);

  return data;
}

export async function searchBenefits(input) {
  const query = input.trim();

  if (!query) {
    throw new Error("Enter a ZIP code or a street address.");
  }

  if (looksLikeZip(query) && !isZip(query)) {
    throw new Error("ZIP codes must contain exactly five digits.");
  }

  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
  let zip = query;
  let origin = null;
  const warnings = [];

  if (!isZip(query)) {
    const addressMatches = await geocode(query, false, apiKey);

    const matches = addressMatches.filter((match) => {
      return match.resultType === "building" ||
        match.resultType === "amenity";
    });

    const unique = [];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      let duplicate = false;

      for (let j = 0; j < unique.length; j++) {
        const saved = unique[j];

        if (saved.latitude === match.latitude &&
            saved.longitude === match.longitude &&
            saved.zipcode === match.zipcode) {
          duplicate = true;
        }
      }

      if (!duplicate) {
        unique.push(match);
      }
    }

    if (unique.length !== 1) {
      throw new Error(
        "Use a complete street address, including city, state and ZIP, or enter a five-digit ZIP code."
      );
    }

    origin = unique[0];
    zip = origin.zipcode;
  }

  const data = await loadBenefits(zip);
  let distances = {};

  if (data.locations.length > 0 && !origin) {
    try {
      const result = await getSupabase().from("zip_code_areas")
        .select("*").eq("zipcode", zip).maybeSingle();

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.data && hasCoordinates(result.data)) {
        origin = {
          ...result.data,
          label: "ZIP " + zip + " representative point"
        };
      } else {
        const matches = await geocode(zip, true, apiKey);

        const match = matches.find((item) => {
          return item.zipcode === zip;
        });

        if (!match) {
          throw new Error("The ZIP reference point could not be found.");
        }

        origin = {
          ...match,
          label: "ZIP " + zip + " representative point"
        };
      }
    } catch (error) {
      warnings.push(error.message);
    }
  }

  let missingCoordinates = false;

  data.locations.forEach((location) => {
    if (!hasCoordinates(location)) {
      missingCoordinates = true;
    }
  });

  if (missingCoordinates) {
    warnings.push(
      "Some locations have no coordinates. Their distances are unavailable."
    );
  }

  if (origin && data.locations.length > 0) {
    try {
      distances = await getWalkingDistances(
        origin, data.locations, apiKey
      );
    } catch (error) {
      warnings.push(error.message);
    }
  }

  let originLabel = "ZIP " + zip;

  if (origin) {
    originLabel = origin.label;
  }

  return {
    zip,
    originLabel,
    data,
    distances,
    warnings
  };
}