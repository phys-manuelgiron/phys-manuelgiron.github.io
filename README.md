# Manuel Giron · Physics portfolio

A static physics portfolio for research groups and industry teams. It presents experimental photonics, scientific computing, and Manuel's interests in high energy physics and quantum field theory.

## Run locally

```sh
npm run dev
```

Open <http://localhost:3000>. No installation or build is required; the server uses Node.js built-ins.

## Files and content

- `index.html`: biography, research map, projects, publications, education, and contact information. Research content is available without JavaScript.
- `styles.css`: responsive layout, illustration controls, and print/reduced-motion styles.
- `theme.js` / `theme.css`: early theme selection, the day/night toggle, saved preference, and shared colors for the portfolio and web CV.
- `script.js`: light-field interaction, research-map hover cards, scattering animation, and citation copying.
- `physics.js`: deterministic wave-field and geometric ray–particle collision calculations.
- `cv.html` / `cv.css`: the web and print versions of the CV.
- `public/Manuel-Giron-CV.pdf`: downloadable CV, generated from `cv.html` using Chrome print-to-PDF with A4 page size, CSS margins, and no browser headers/footers. Regenerate after editing the CV.
- `public/light-field.svg` / `public/scattering.svg`: static illustration fallbacks.
- `public/monogram.svg`: favicon.

The original CAD viewer and sample models are retained but not loaded by the portfolio. The source Word résumé remains local and is excluded from Git. The public CV omits the phone number and placeholder URL. The conceptual biosensing cavity is omitted because no project work was completed.

## Research accuracy

Edit the static HTML directly and keep contributions and publication statuses accurate. The Applied Optics article links to its verified DOI, [10.1364/AO.606352](https://doi.org/10.1364/AO.606352). The photonic-glazing metrics are simulation-derived. The avian-feather laser manuscript is in preparation. NanoFlorida is listed as a poster presentation without an invented title. The research map separates completed/current work from HEP/QFT interests.

## Illustrations

### Living light field

A qualitative two-dimensional scalar field uses one or two coherent point sources. For each source it evaluates `A(r) cos(kr - omega*t)`, with `A(r) = 0.95 / sqrt(1 + r/100)`, `k = 2*pi/wavelength`, and `omega = k * 12` for a fixed illustrative propagation speed. Source amplitudes are normalized by source count. The wavelength slider changes both spatial scale and oscillation rate while keeping propagation speed fixed; these are illustrative rather than calibrated optical units. Warm and green colors show opposite signs of field amplitude, not optical intensity. This regularized model illustrates superposition rather than a full Maxwell solution.

Drag a source or focus it and use arrow keys to reposition it. Play/pause, reset, wavelength, and a second-source toggle are provided.

### Scattering experiment

48 rays travel through visible, non-overlapping circular particles. The density slider changes particle count (up to 55), and the radius slider changes particle size (4–13 illustrative units). Geometry is seeded; **New sample** changes the seed. Each path follows the nearest ray–circle intersection, then reflects about the surface normal. Collision flashes occur at those exact points. The counters report right, left, and top/bottom exits. A 192-collision guard leaves any unresolved rays classified as inside.

Pulses repeat while the scene is visible, with controls for replay and pause. Sliders regenerate the sample and immediately show new paths. This geometric reflection model explains visible cause and effect; it is not a quantitative model of biological particle scattering, interference, optical gain, or measured timing.

### Research map

Three spaced points sit on a dotted grid. Hovering, focusing, or tapping a point reveals its own card and section link. Escape or a click outside dismisses it. Mobile cards expand beneath their point. Closed cards are inert, so keyboard navigation does not enter invisible links. Without JavaScript, CSS hover/focus still reveals the cards.

### Motion, previews, and access

The scripts are ordered, deferred classic scripts, with the model exposed as `globalThis.PortfolioPhysics`. They work both over HTTP and when `index.html` is opened directly as a local file. Versioned script/style URLs prevent stale assets from mixing between deployments. Controls are visible from the initial HTML and disabled only until their illustration initializes; missing JavaScript no longer makes all sliders disappear.

Both illustrations stop requesting frames offscreen and in hidden tabs. Reduced motion starts the field paused and shows complete scattering paths immediately. The field's time slider, wavelength control, source toggle, click-to-place, and keyboard/drag source movement work while paused. Static SVG fallbacks remain available without canvas. The optional web fonts have system/Georgia fallbacks.

## Day and night mode

The header toggle switches between day and night colors. With no saved choice, the site follows the OS color preference and responds to system changes. A manual selection is stored locally and shared with the web CV; switching still works if storage is unavailable. The light-field canvas and its static fallback use the active palette. CV printing uses light colors regardless of the selected screen theme.

## Hosting

Serve the repository root as static files. GitHub Pages uses **Deploy from a branch → main → / (root)**. No `gh-pages` dependency or build directory is required; the local deployment scripts that predate the redesign are not used.

Canonical repository: `phys-manuelgiron/phys-manuelgiron.github.io`. GitHub redirects its former `pays-manuelgiron.github.io` address. The user-site address is <https://phys-manuelgiron.github.io/>. Relative assets also support a project-site path.

## Verification

Run the model checks with `node --test tests/physics.test.mjs`. Check JavaScript syntax with `node --check script.js` and `node --check physics.js`. Verify conservation of simulated ray counts, straight transmission at zero density, exact particle-surface collisions/reflection, deterministic seeds, and finite wave fields. Preview desktop/mobile widths, keyboard and touch interaction, hover-card links and dismissal, source movement, pause/resume, density resets, reduced motion, no-JavaScript rendering, citation copying, and CV downloads. Optional external fonts have system/Georgia fallbacks.
