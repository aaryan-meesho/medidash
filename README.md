# MediDash

Find nearby cashless network hospitals for your health insurer. Pick an insurer,
share your location (or let it fall back to Bangalore), and see the nearest in-network
hospitals as a list and on a map, sorted by distance.

Rebuilt for the hackathon's required stack — React.js frontend, Node.js backend,
SQLite storage, one Docker image — based on the concept from the reference
`InsurApp Hospital Finder` project (originally Next.js + PostgreSQL).

## Data Source

The seed data (`backend/src/db/seed-hospitals.json`) is a real ICICI Lombard
network hospital list for Bangalore, imported from a Google Sheet. To refresh it
after the sheet changes:

```bash
cd backend
GOOGLE_SHEETS_CSV_URL="<published CSV link>" SHEET_INSURER="ICICI Lombard" npm run import:sheets
```

The sheet must have `Hospital Name, Address, Pincode, (blank), Lat, Long` columns
in that order (adjust `scripts/import-sheets.js` if your columns differ). Rows
missing a name, address, or valid lat/long are skipped and counted in the script's
output. The import writes a local JSON snapshot rather than fetching live at
container startup, so judging doesn't depend on Google Sheets being reachable.

## Folder Structure

- `frontend/` — React app (Vite), insurer picker + results list + Leaflet map.
- `backend/` — Node/Express API, `controller -> service -> repository` for hospitals.
- `db/` — SQLite database file lives here once the backend runs (auto-created + seeded).
- `Dockerfile` — builds the frontend, then packages frontend + backend into one image.

## API

- `GET /api/health` — liveness check.
- `GET /api/insurers` — distinct insurer names, sorted ascending.
- `GET /api/hospitals?lat=&lng=&insurer=&minLat=&maxLat=&minLng=&maxLng=` —
  nearest hospitals. `lat`/`lng` are required. Bounds only apply when all four
  are valid numbers. Returns top 10 (unbounded) or top 50 (bounded) by distance.
  Errors are `{ "error": "..." }` with status 400 (bad input) or 500 (server error).

## Local Development (no Docker needed)

Requires Node.js 22+.

```bash
# backend, in one terminal
cd backend
npm install
npm run dev        # http://localhost:8090

# frontend, in another terminal
cd frontend
npm install
npm run dev         # http://localhost:9080, proxies /api to :8090
```

Open http://localhost:9080 in your browser.

## Building & Running the Submission Image

Docker is only needed for the final judging submission, not for day-to-day dev.

```bash
docker build -t medidash .
docker run -p 9080:9080 -p 8090:8090 medidash
```

Then open http://localhost:9080.
