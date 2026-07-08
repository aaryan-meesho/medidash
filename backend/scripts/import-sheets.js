import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '../src/db/seed-hospitals.json');

const CSV_URL = process.env.GOOGLE_SHEETS_CSV_URL;
const INSURER = process.env.SHEET_INSURER;

if (!CSV_URL) {
  console.error('Missing GOOGLE_SHEETS_CSV_URL. Set it to the sheet\'s "Publish to web" CSV link.');
  process.exit(1);
}

if (!INSURER) {
  console.error('Missing SHEET_INSURER. Set it to the insurer name every row in this sheet belongs to.');
  process.exit(1);
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
  return lines.slice(1).map(parseCsvLine);
}

async function main() {
  const res = await fetch(CSV_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet: HTTP ${res.status}`);
  }
  const csvText = await res.text();
  const rows = parseCsv(csvText);

  const hospitals = [];
  let skipped = 0;

  for (const row of rows) {
    // Expected columns: Hospital Name, Address, Pincode, (blank), Lat, Long
    const [name, address, , , latRaw, lngRaw] = row;
    const lat = Number(latRaw);
    const lng = Number(lngRaw);

    if (!name?.trim() || !address?.trim() || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      skipped++;
      continue;
    }

    hospitals.push({
      name: name.trim(),
      address: address.trim(),
      lat,
      lng,
      insurer: INSURER,
    });
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(hospitals, null, 2));
  console.log(`Imported ${hospitals.length} hospitals into ${OUTPUT_PATH}`);
  console.log(`Skipped ${skipped} row(s) missing a name, address, or valid lat/long.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
