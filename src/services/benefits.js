import { getSupabase } from "../lib/supabaseClient.js";
import { getWalkingDistances } from "./geoapify.js";
import { isZip, hasCoordinates } from "../utils/benefitLogic.js";

function getRows(result) {
  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    return [];
  }

  return result.data;
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
  const zip = input.trim();

  if (!isZip(zip)) {
    throw new Error("Enter a five-digit ZIP code.");
  }

  const data = await loadBenefits(zip);
  let distances = {};

  if (data.locations.length > 0) {
    try {
      const result = await getSupabase().from("zip_code_areas")
        .select("*").eq("zipcode", zip).maybeSingle();

      if (!result.error && result.data && hasCoordinates(result.data)) {
        distances = await getWalkingDistances(
          result.data,
          data.locations,
          import.meta.env.VITE_GEOAPIFY_API_KEY
        );
      }
    } catch {
      distances = {};
    }
  }

  return { zip, data, distances };
}