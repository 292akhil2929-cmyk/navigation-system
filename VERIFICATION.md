# Verification — 2 November 2026
## Verified
- Vercel production builds execute the navigation unit suite before bundling.
- 12 navigation tests pass: distance, bounded preparation distance, route/geometry scaling, GPS projection, passed-exit handling, arrival distance, simulated interpolation, route-loop jump restriction, coordinate validation, missing route errors, exit/roundabout instructions, and intervening-manoeuvre priority.
- Real OSRM driving route: Dubai Marina Mall → Dubai Mall, approximately 25.1 km, 12 steps; locations snap within 100 m of mapped roads.
- Real route to a searched Museum of the Future destination, approximately 26 km.
- Photon search returns the requested UAE landmark.
- Route preview updates distances and manoeuvres; immediate turns remain ahead of later preparation cues.
- Preview pause, end, HUD, mirror, settings slider and speech toggle exercised.
- Portrait at 390×844, narrow-phone width 320, and landscape HUD at 844×390 checked. No horizontal overflow in inspected phone states.
- HUD mirror transform verified; landscape graphics visually inspected.
- Screen Wake Lock activated during simulation.
- Location disclosure shown before requesting GPS; cancelling returns without starting location guidance.
- Fullscreen denied by test environment; visible fallback message supplied.
- No application errors observed in captured browser console logs.

## Not yet verified
- Physical Android GPS accuracy, permission-denied recovery, sustained on-road map matching, automatic rerouting after a real missed turn, speech output on a phone, Android install prompt, and heat/battery behaviour.
- No external Bluetooth device or optical HUD has been tested.
- No live traffic, exact lane detection, or full offline navigation is implemented.
- Preparation timing is an experimental heuristic. This is a personal-testing prototype, not a validated driving aid.

## Preview and search fix verification
- 21 unit tests pass, including coordinate parsing, destination versus map-camera coordinates, URL allowlists, and building/street metadata.
- On a 390×844 phone viewport, End preview moved from below the screen (top approximately 1,141px) to the persistent header (top approximately 14px).
- Ending normal preview, ending HUD preview, and browser Back all return to the planner without leaving the app.
- Imported coordinates generated a real route. A map click placed a selectable exact pin and loaded normal map tiles.
- R02 International City Dubai returned R02 Building, Street 14, International City in the deployed interface.
- Al Marjan Building Al Mankhool Dubai did not return a dependable exact open-data match. Full Google search parity remains unavailable.
- Maps-link endpoint accepts explicit destination coordinates, blocks unsupported hosts, and rejects camera-centre-only links.

## Combined-index update
- 27 tests cover route logic, location imports, index deduplication, building-code exclusion, neighbourhood ranking, saved-pin validation, and coordinate-search isolation.
- R02 International City Dubai returns R02 Building as a name/address match, with its complete available address and source visible on the phone layout.
- A disposable named test pin was saved through the UI and retained after reload. Exact saved-name search resolves locally; the test pin is removed after verification.
- Full Google search parity is not claimed. Al Marjan in Al Mankhool remains dependent on open-data availability or a user-verified pin.
