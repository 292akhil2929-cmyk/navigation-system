# MADA — road-first navigation
Android Chrome phone prototype: real online routes, GPS progress, early exit/fork reminders, route simulation, and mirrored HUD display.

## Try it
Open the Vercel URL in Android Chrome. Choose a start point (or grant precise location), choose a destination, and select Find route. Preview this route uses a real calculated route but **simulated movement**. Start GPS guidance uses live location and recalculates from your actual position if needed. Chrome menu → Add to home screen provides a standalone launch.

Keep the app foregrounded. Screen Wake Lock is requested where supported; check the screen-awake indicator. Background location is not supported reliably by this browser prototype. Test parked or with a passenger operating the phone before any on-road evaluation.

## Implemented
- Photon place search, bounded to UAE-region coordinates.
- OSRM driving routes with manoeuvres, mapped lane hints when supplied.
- GPS projection onto route geometry; stale/inaccurate location suppresses spoken guidance.
- Off-route handling: three reliable deviating fixes trigger recalculation, at most once per 30 seconds.
- Early exit/fork preparation: clamp(speed metres/second × configurable 30–100 seconds, 700 m, 3000 m). This is a heuristic, not a validated driving threshold.
- Preview controls, optional speech, mirror display, fullscreen, accessible settings.
- Unit tests run before each Vercel production build.

## Limits
No live traffic, exact lane detection, full offline navigation, Bluetooth HUD hardware support, or automotive-grade optical projection. End-of-road and fork preparation cues are junction advice, not verified highway exit identification. Public routing/geocoding/map services are best-effort; this deployment is for small-scale personal testing, **not commercial production**. OSM data may omit exits, entrances, restrictions or lane information. Follow actual road signs. Avoid last-minute corrections; missed turns should be rerouted.

No country/tile download or service worker bulk caching. Internet is required. There is no pretend offline switch.

## Privacy
No analytics, account, GPS history, server database or saved route. Only reminder settings are stored in localStorage. Route coordinates are sent directly to OSRM; search terms to Photon; viewed map tiles to OpenStreetMap. Hosting access logs may be maintained by Vercel. Location is requested only after an explanatory dialog and user action. Never commit credentials.

## Providers and licences
- Map data: [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), ODbL; visible map attribution retained.
- Map renderer: Leaflet (BSD-2-Clause).
- Routing: [OSRM](https://project-osrm.org/), public demo at router.project-osrm.org. Replace with supported/self-hosted infrastructure for commercial use.
- Search: [Photon](https://github.com/komoot/photon), public demo at photon.komoot.io.
- UI: Radix Dialog/Switch following shadcn component patterns, inspected through connected shadcn MCP (MIT).
- Icons: Lucide (ISC); React (MIT); Vite (MIT).
- Fonts: Space Grotesk, DM Sans, IBM Plex Mono via Google Fonts (SIL Open Font License).

Set VITE_ROUTING_URL to an OSRM-compatible endpoint to replace the routing service.

## Checks
npm install
npm test
npm run build

Source is authored through GitHub API and deployed from the GitHub commit to Vercel. No local application checkout is required.

## Update: preview exit and building search
Persistent End preview buttons are available in the normal and HUD views. Browser/Android Back exits the simulated session. Coordinate and map-pin selection allow destinations missing from the search index. Supported Google Maps coordinate links can be imported; camera-centre-only links are deliberately rejected.

Address search now uses Nominatim first, then Photon. R02 Building in International City was verified in the deployed UI. Al Marjan Building in Al Mankhool was not reliably resolved; do not confuse it with another Marjan Building. This does not reproduce the Google Places database.

Nominatim use is limited to user-triggered searches for one active personal tester: no autocomplete, a one-hour in-memory result cache, and at least 1.2 seconds between upstream requests per function instance. This is NOT a shared global rate limiter; do not open multi-user/public-scale testing until a supported service and global limiter are installed. Provider URL is configurable with NOMINATIM_SEARCH_URL. See https://operations.osmfoundation.org/policies/nominatim/ . Address queries pass through Vercel, may appear in hosting logs, and are temporarily cached; no GPS tracking history is stored. Maps-link requests pass through Vercel and Google short-link redirects only; Google pages are not scraped.

## Combined free search and personal pins
Nominatim and Photon are now queried together on submitted searches, with a five-minute browser-memory search cache. Results are deduplicated, ranked by building name/address tokens, and labelled when partial. Explicit building codes exclude mismatched codes. Textual matches are not a guarantee of correct entrances or current business data. Names do not gain invented coordinates.

Missing locations can be given a name and optionally saved on this device after choosing an exact map pin or importing coordinates. Saving is off by default. Saved pins are searchable, removable, and retained after reload; exact saved-name queries resolve locally. They are not uploaded as a shared listings database. Users should include neighbourhoods in saved names to distinguish buildings. The privacy settings describe this local storage.
