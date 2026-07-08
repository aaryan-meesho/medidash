# MediDash — Improvement Roadmap

A snapshot of what's built, what's faked for the demo, and what would need to
change before this is more than a hackathon preview. Grouped by area, roughly
ordered by priority within each group. Updated after the UI redesign pass
(custom dropdowns, contextual spotlight onboarding tour, map/list sync,
Directions integration) — see inline notes on what changed.

## 1. Data Quality (highest priority — this is a healthcare app)

- **Replace demo-only fields with real data.** Tags (Multispeciality/24x7/
  Emergency/etc.), the "Cashless" badge, "Last verified" date, and open-now
  status are all deterministic placeholders generated client-side
  (`frontend/src/demoMetadata.js`) — none of it is sourced from a real
  provider feed. This is disclosed in-app (Important Note banner) but must be
  replaced before real users rely on it for admission decisions. Note: the
  dedicated Trust & Safety disclosure modal was since removed (see §4) — the
  Important Note banner is now the *only* place this is disclosed, and only
  after a search runs.
- **Support multiple insurers properly.** The seed importer
  (`backend/scripts/import-sheets.js`) tags an entire sheet with one insurer
  name, and the DB only seeds when the `hospitals` table is empty
  (`backend/src/db/index.js`). Adding a second insurer's sheet today would
  require a manual DB wipe+reseed. Needs an upsert/merge import path keyed on
  something stable (e.g. name+address+insurer) instead of "seed once."
- **Recover the ~2.5% of rows with no coordinates.** The last import skipped
  8 of 334 sheet rows for missing/invalid lat/long. Geocoding those from
  address + pincode (Nominatim or a paid geocoder) would recover them instead
  of silently dropping them.
- **De-dupe and validate.** No check currently exists for duplicate hospital
  entries, stale addresses, or out-of-range coordinates from sheet typos.
- **Track dataset freshness at the collection level**, not just a fake
  per-hospital date — e.g. "network list last synced: <date>" from the
  actual import run.

## 2. Backend / API

- **Automated tests.** There are currently none — `hospitals.service.js`'s
  distance/sort/limit logic and the controller's validation (400 on bad
  lat/lng, bounds-only-when-all-four-valid) are exactly the kind of pure
  logic that's cheap to unit test and easy to regress silently.
- **Save/bookmark hospitals was removed entirely**, not just left client-side
  — there's no way to save a hospital for later at all right now. If it comes
  back, decide up front whether it's `localStorage`-only (simple, but lost on
  cache clear / not synced across devices) or backed by a lightweight
  session/account concept server-side.
- **A real hospital-detail endpoint.** "View details" currently just re-shows
  data already on the card. A `GET /api/hospitals/:id` with richer content
  (specialities, hours, photos) would make that feature worth clicking.
- **Rate limiting / input hardening** before any public deployment beyond
  judging — the API currently trusts all query params after basic type
  validation.

## 3. Frontend / UX

- **Real location search.** The location bar uses the public Nominatim API
  directly from the browser with no debouncing, caching, or usage-policy
  compliance — fine for a demo, but Nominatim's public instance rate-limits
  aggressively. For production, either self-host Nominatim or move to a
  licensed geocoder, and add proper debounced autocomplete instead of
  single-shot search-on-submit.
- **Marker clustering / list virtualization.** Bounded map search allows up
  to 50 results, and the hospital list now renders *all* of them at once in a
  fixed-height scrolling container (no more "View more" cap) — good for
  scroll continuity, but 50 unclustered map pins will overlap in dense areas,
  and 50 full cards is a lot of DOM for a low-end phone. Leaflet clustering
  plugins and/or list virtualization (e.g. render only visible rows) would
  both help if the per-query limit ever goes up.
- **Dead filter state.** `App.jsx`'s `activeFilters` still tracks `openNow`,
  `within2km`, `twentyFourSeven`, and `emergency`, and `applyFilters` still
  checks all four — but `FilterBar.jsx` only renders chips for
  Multispeciality and Cashless now, so those four flags can never become
  `true` again. Either remove the dead keys/logic or bring back chips for
  them.
- **Custom dropdown accessibility regression.** The Insurer and Sort controls
  were switched from native `<select>` to a hand-built `SelectDropdown`
  (`frontend/src/components/SelectDropdown.jsx`) because the native popup
  couldn't be restyled to match the app and looked broken. That fixed the
  visual mismatch but lost the native element's built-in keyboard/screen-reader
  support — it has click-outside and Escape-to-close, but no arrow-key
  navigation between options or proper `role="listbox"`/`aria-selected`
  wiring yet.
- **Spotlight tour a11y.** `SpotlightTour.jsx` has no focus trap and doesn't
  move keyboard focus into the tooltip or announce step changes to screen
  readers — it's fully mouse-driven right now.
- **Loading states.** "Searching..." text and a bare status line are the only
  loading feedback; skeleton cards / map shimmer would feel more polished.
- **Visual QA in an actual browser.** This environment has no
  screenshot/browser-automation tool, so UI changes are verified by build
  success + manual code review, not by looking at rendered pixels — several
  real layout bugs (a dropdown menu wider than its trigger, markers
  positioned wrong) were only caught because the user pasted screenshots back.
  Worth a real pass in a browser (and on a real phone) before submission.

## 4. Trust & Compliance

- **Disclosure surface shrank during the redesign.** The dedicated "Trust &
  Safety" nav item/modal and the bottom trust-footer ("Cashless confirmed" /
  "Verified regularly" / "Need help?") were both removed as UI clutter. The
  Important Note banner (shown under search results) is now the *only*
  disclosure that the tags/verified-dates/cashless-badge are demo
  placeholders, and it's invisible until a search actually runs. Worth a
  deliberate decision on whether that's enough, not just an accident of
  cleanup.
- **Don't ship demo data as if it were verified.** Beyond disclosure, if this
  ever reaches real users the cashless/tags/verified-date fields need to
  either show real data or be removed rather than displayed as-if-real with a
  caveat.
- **Third-party data flows disclosure.** The app sends the user's coordinates
  to OpenStreetMap tile/Nominatim servers and to Google Maps (Directions
  link). Worth a privacy notice, especially since this handles health-adjacent
  location data.
- **Geolocation failure UX** explains *why* the app fell back to a default
  location (denied/unavailable/timeout) rather than failing silently — worth
  extending the same honesty to other failure paths (e.g. Nominatim being
  down for location search or reverse-geocoding).

## 5. Infra & Deployment

- **The Docker image has still never actually been built**, and a lot more
  frontend surface area (custom dropdowns, the spotlight tour, the map
  redesign) has been layered on top since this was first flagged. Docker
  Desktop isn't installed on this dev machine (needs an interactive admin
  approval this environment couldn't complete headlessly). The
  `Dockerfile`/`start.sh`/`serve-static.js` setup is written and reasoned
  through but **unverified** — build it and smoke-test the container well
  before submission, not at the last minute, given how much has changed.
- **Container health check.** Add a Docker `HEALTHCHECK` hitting
  `/api/health` so a broken container is visibly unhealthy rather than
  silently serving errors.
- **Process supervision.** `start.sh` backgrounds two `node` processes and
  `wait`s on them — fine for a demo, but doesn't restart a crashed process or
  forward signals cleanly. A minimal supervisor (or splitting into two
  containers, if the hackathon format ever allows it) would be more robust.
- **CI.** No automated build/lint/test-on-push exists yet.
- **Repeatable dev environment.** This machine needed a portable Node
  install and a manually-exported corporate CA bundle to get `npm install`
  working (see project memory). Worth documenting in the README as a known
  setup step for the next person, or moving to a devcontainer that bakes
  those in.

## 6. Performance

- Demo-metadata enrichment (`withDemoMetadata`) recomputes tags/dates on
  every fetch — harmless at ~50 hospitals per request, but would need
  memoizing per-hospital-id if the dataset grows much larger.
- `HospitalMap.jsx` builds a new `L.DivIcon` for every marker on every
  render (`numberedIcon(rank)` called inline in the `.map()`) instead of
  memoizing by rank — fine at current result counts, worth revisiting
  alongside the clustering work in §3 if marker counts grow.
- Frontend bundle is ~327KB JS / ~25KB CSS (gzipped ~104KB/9KB) — mostly
  Leaflet. Code-splitting the map behind a dynamic import would shrink the
  initial load for a first-paint-sensitive deployment.
