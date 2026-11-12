//This contains all the app will need to load, search, filter, sort food resources

//City of Seattle's Emergency Food and Meals data
//The city allows for a small amount of requests without a key, so it is not needed for now

import ZIP_CENTERS from '../data/zipCenters.json'
const API_URL = 'https://data.seattle.gov/resource/kkzf-ntnu.json?$select=*,:id';

export async function loadResources() {
    const response = await fetch(API_URL);

    if (!response.ok){
        throw new Error ("Unable to load search results. Please try again");
    }

    const rows = await response.json();
    return rows.map(toResource);
}

export function toResource(row) {
    return {
      id: row[':id'],
      name: row.location,
      agency: row.agency,
      type: row.food_resource_type ?? '',
      status: row.operational_status,
      whoTheyServe: row.who_they_serve,
      address: row.address,
      zip: getZip(row.address),
      lat: Number(row.latitude),
      lng: Number(row.longitude),
      phone: cleanPhone(row.phone_number),
      website: getWebsite(row.website),
      days: getDays(row.days_hours),
      photo: null,
      distance: null,
    };
}

function getWebsite(website) {
    if (!website || typeof website.url !== 'string') {
        return null;
    }
    const url = website.url;
    if (url.indexOf('https://') === 0 || url.indexOf('http://') === 0) {
        return url;
    }
    return null;
}

function cleanPhone(phone) {
    if (!phone || phone === 'N/A') {
        return null;
    }
    return phone;
}

export function getZip(address) {
    if (!address) {
        return null;
    }

    const words = address.trim().split(' ');
    const lastWord = words[words.length -1];
    const firstFive = lastWord.slice(0,5);

    if (isFiveDigits(firstFive)) {
        return firstFive;
    }
    return null;
}

export function isFiveDigits(text) {
    if (text.length !== 5) {
        return false;
    }

    for (const character of text) {
        if (character < '0' || character > '9') {
            return false;
        }
    }
    return true;
}

export function findByZip(resource, zip) {
    return resource.filter((resource) => resource.zip === zip);
}

export function getDays(daysText) {
    if (!daysText) {
        return [];
    }
    
    const days = daysText.split(',').map((day) => day.trim());
    return days.filter((day) => day !== 'Unknown');
}

//Matches resource to food type based on the API.
//Raw food -> Food Bank
//Cooked food -> Meal
function matchesType(resource, selectedType) {
    if (selectedType === 'Raw Food') {
        return resource.type.includes('Food Bank');
    }
    if (selectedType === 'Cooked Food') {
        return resource.type.includes('Meal');
    }
    return true;
}

//Is the reosurce open on the selected day
function matchesDay(resource, selectedDay) {
    if (!selectedDay) {
        return true;
    }
    return resource.days.includes(selectedDay);
}

//Only keeps resources that match both of the filters
export function applyFilters(resources, selectedType, selectedDay) {
    return resources.filter(
        (resource) =>
            matchesType(resource, selectedType) && matchesDay(resource, selectedDay)
    );
}

export function milesBetween(pointA, pointB) {
  const northSouthMiles = (pointA.lat - pointB.lat) * 69;
  const eastWestMiles = (pointA.lng - pointB.lng) * 46.5;
  return Math.sqrt(northSouthMiles ** 2 + eastWestMiles ** 2);
}

export function addDistances(resources, searchedZip) {
  const center = ZIP_CENTERS[searchedZip];
  for (const resource of resources) {
    if (center) {
      resource.distance = milesBetween(center, resource);
    } else {
      resource.distance = null;
    }
  }
}

export function sortByDistance(resources) {
  return [...resources].sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

function getTodayName() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'America/Los_Angeles',
  });
}

function relevanceScore(resource, selectedDay) {
  const dayWanted = selectedDay || getTodayName();
  let score = 0;
  if (resource.days.includes(dayWanted)) {
    score = score + 2;
  }
  if (resource.status === 'Open') {
    score = score + 1;
  }
  return score;
}

export function sortByRelevance(resources, selectedDay) {
  return [...resources].sort((a, b) => {
    const scoreA = relevanceScore(a, selectedDay);
    const scoreB = relevanceScore(b, selectedDay);
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher score first.
    }
    return (a.distance || 0) - (b.distance || 0); // Same score: nearer first.
  });
}

export function findNearZip(resources, zip, maxMiles) {
  const center = ZIP_CENTERS[zip];
  if (!center) {
    return findByZip(resources, zip);
  }
  return resources.filter(
    (resource) => resource.zip === zip || milesBetween(center, resource) <= maxMiles);
}


