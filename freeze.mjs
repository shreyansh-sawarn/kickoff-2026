import fs from 'fs';

const baseUrl = "https://kickoff-2026-api.fly.dev/api/v1";
const endpoints = [
  "news?limit=50",
  "matches",
  "scorers",
  "assists",
  "yellow-cards",
  "red-cards",
  "minutes",
  "standings"
];

async function run() {
  if (!fs.existsSync('packages/api/src/data')) {
    fs.mkdirSync('packages/api/src/data');
  }

  for (let ep of endpoints) {
    const filename = ep.split('?')[0] + '.json';
    console.log(`Fetching ${ep}...`);
    try {
        const res = await fetch(`${baseUrl}/${ep}`);
        const data = await res.json();
        fs.writeFileSync(`packages/api/src/data/${filename}`, JSON.stringify(data, null, 2));
        console.log(`Saved ${filename}`);
    } catch(e) {
        console.error(`Failed ${ep}`, e);
    }
  }
}

run();
