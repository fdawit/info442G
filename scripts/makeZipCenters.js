//Creates a json file from the center of US census zip code gazetteer file
//Will be run from the project's main folder
//in terminal run: node scripts/makeZipCenters.js path/to/file.txt
// This will keep only zip codes starting with 980 or 981, encompassing the Seattle area and saves each one's center point
import fs from 'node:fs';

const inputFile = process.argv[2];

if (!inputFile) {
    console.log('Please provide the census file as so: node scripts/makeZipCenterss.js 2026_Gaz_zcta_national.txt');
    process.exit(1)
}

const lines = fs.readFileSync(inputFile, 'utf8').trim().split('\n');

let separator = '|';

const columnNames = lines[0].split(separator).map((name) => name.trim());
const zipColumn = columnNames.findIndex((name) => name.startsWith('GEOID'));
const latColumn = columnNames.findIndex((name) => name.startsWith('INTPTLAT'));
const lngColumn = columnNames.findIndex((name) => name.startsWith('INTPTLON'));

const centers = {}
for (const line of lines.slice(1)) {
    const cells = line.split(separator).map((cell) => cell.trim());
    const zip = cells[zipColumn];
    if (!zip) {
        continue;
    }
    if (zip.startsWith('980') || zip.startsWith('981')) {
        centers[zip] ={
            lat: Number(cells[latColumn]),
            lng: Number(cells[lngColumn]),
        };
    }
}

fs.writeFileSync('src/data/zipCenters.json', JSON.stringify(centers, null, 2));

console.log('Saved ' + Object.keys(centers).length + ' ZIP codes to src/data/zipCenters.json');
