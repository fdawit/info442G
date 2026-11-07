//foodResources.js
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
