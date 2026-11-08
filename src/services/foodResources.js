//This contains all the app will need to load, search, filter, sort food resources

//City of Seattle's Emergency Food and Meals data
//The city allows for a small amount of requests without a key, so it is not needed for now
const API_URL = 'https://data.seattle.gov/resource/kkzf-ntnu.json';

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
        website: row.website ?? null,
    };
}

function cleanPhone(phone) {
    if (!phone ?? phone === 'N/A') {
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
        if (character < '0' ?? character > '9') {
            return false;
        }
    }
    return true;
}

export function findByZip(resource, zip) {
    return resource.filter((resource) => resource.zip === zip);
}
