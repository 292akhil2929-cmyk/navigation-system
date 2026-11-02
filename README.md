# MADA — road-first navigation
Android Chrome prototype with online driving routes, GPS progress, early exit/fork reminders, live place suggestions, full directions, saved pins and a mirrored HUD.

## Use on Android
1. Open the Vercel deployment in Chrome.
2. Type at least three characters. Quick suggestions appear after a short pause; choose one by touch or with Arrow keys and Enter. Search submits a deeper search across both address indexes.
3. Choose a destination and use **Find route from my GPS**, or set a start point manually.
4. Allow precise location after the location disclosure. **Find route** calculates a complete route. **Full route** expands every direction.
5. **Start GPS guidance** tracks position. **Preview this route** simulates movement along the real calculated route.
6. HUD view supports mirroring. **End preview/guidance** and browser Back end the session.

Keep Chrome foregrounded. Screen Wake Lock is requested where available; it does not make browser background navigation reliable. Add to home screen is available through Chrome. Test the app parked or with a passenger before any on-road evaluation.

## Search and destinations
Quick suggestions use Photon and saved pins only. No autocomplete request is sent to Nominatim. Requests are debounced, cancelled on input changes, cached for five minutes, and limited to roughly one automatic Photon request per second per active browser.

Submitted search combines Nominatim and Photon, removes duplicate places and ranks name/address tokens. Partial matches are labelled. Building-code queries exclude other codes. Missing buildings can be selected on the map or imported from exact coordinates / supported Google Maps pin links. A camera-centre-only Maps link is not accepted as an exact destination.

Named pins are optionally saved on this device, searchable and removable. Exact saved-name queries resolve locally. No shared directory or GPS tracking-history database is maintained. Open-data coverage differs from Google Maps; there is no claim of complete or perfect results.

## GPS and route behaviour
- Uses precise browser Geolocation on HTTPS, subject to user permission and device reception.
- Routes are calculated from a GPS start or a selected map location.
- Full geometry and all manoeuvre steps are available.
- Progress projects reliable GPS fixes onto nearby route segments.
- Stale or inaccurate fixes suppress spoken guidance.
- Three reliable off-route fixes trigger recalculation, at most once per 30 seconds.
- Early preparation distance is clamp(speed in m/s × selected lead time, 700 m, 3000 m).
- An early exit cue never hides an intervening manoeuvre.

Preparation timing is experimental and is not a lane-change clearance. There is no live traffic, full offline routing, exact lane detection, Bluetooth HUD connection, or automotive-grade optical projection.

## Personal-test infrastructure
Routing uses the public OSRM demo at router.project-osrm.org. Map tiles are requested only for viewed areas from OpenStreetMap; no tile bulk download is implemented. Search uses Photon and Nominatim. These public services have no availability guarantee and must be replaced with supported/self-hosted infrastructure before commercial use.

Nominatim is used only for submitted searches, not autocomplete. Address results are cached for one hour in server memory with at least 1.2 seconds between upstream requests per function instance. This is NOT a global shared limiter. Keep this to one active personal tester; multi-user testing requires a supported provider and shared rate limiter.
Policy: https://operations.osmfoundation.org/policies/nominatim/
Photon policy and features: https://github.com/komoot/photon

## Privacy
Typing sends query text to Photon after a pause. Submitted searches pass through Vercel to Nominatim and directly to Photon. Search queries may appear in hosting logs and temporary caches. Route coordinates go directly to OSRM. Viewed map tiles go to OpenStreetMap. GPS progress is processed on the phone. Settings and explicitly saved named pins stay in browser storage. Short Maps links pass through Vercel to supported Google redirect endpoints only; Google pages are not scraped. No analytics are installed.

## Configuration
VITE_ROUTING_URL: optional OSRM-compatible routing endpoint.
NOMINATIM_SEARCH_URL: optional server-side compatible address-search endpoint.
Do not commit credentials.

## Development and checks
npm install
npm test
npm run build

Tests run before each Vercel build. Code changes are committed through GitHub and deployed from that source. See VERIFICATION.md for checks and physical-device limitations.

## Sources and licences
- OpenStreetMap contributors: https://www.openstreetmap.org/copyright (ODbL), visible map attribution retained.
- Leaflet (BSD-2-Clause), OSRM (BSD-2-Clause), Photon (Apache-2.0).
- Radix Dialog/Switch following inspected shadcn patterns (MIT). Connected shadcn Command inspected for combobox structure; the small asynchronous suggestion list uses explicit combobox/listbox keyboard semantics.
- Lucide icons (ISC), React/Vite (MIT).
- Space Grotesk, DM Sans and IBM Plex Mono via Google Fonts (SIL Open Font License).
