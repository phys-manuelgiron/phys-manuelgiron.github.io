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
- `script.js`: light-field interaction, research-map tabs, scattering animation, and citation copying.
- `physics.js`: deterministic wave-field and stochastic ray-transport calculations.
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

A pulse follows 48 rays through a rectangular sample. Free-flight lengths follow an exponential distribution with mean `1600/density`, and each scattering event draws an isotropic direction in two dimensions. Zero density gives straight transmission. A seeded random generator makes a sample reproducible until **New sample** is selected; changing density uses the same seed. Background dots indicate relative density rather than individual collision targets.

Counts distinguish rays leaving the right, left, and top/bottom boundaries. Animation advances along cumulative path distance at an illustrative speed. This is a scattering-only transport model: it does not simulate interference, optical gain, random-laser thresholds, or measured timing. A 512-event guard bounds computation; any ray that reaches the guard must remain identified as inside/unresolved rather than counted as an exit.

### Motion and access

Both illustrations stop requesting animation frames when offscreen or in a hidden tab. Reduced-motion mode starts the field paused and shows scattering outcomes immediately. Native buttons, sliders, and keyboard-operable map tabs provide equivalent access without dragging. No-JavaScript and unavailable-canvas fallbacks remain visible; all three map descriptions are readable without JavaScript.

## Hosting

Serve the repository root as static files. GitHub Pages uses **Deploy from a branch → main → / (root)**. No `gh-pages` dependency or build directory is required; the local deployment scripts that predate the redesign are not used.

Canonical repository: `phys-manuelgiron/phys-manuelgiron.github.io`. GitHub redirects its former `pays-manuelgiron.github.io` address. The user-site address is <https://phys-manuelgiron.github.io/>. Relative assets also support a project-site path.

## Verification

Run the model checks with `node --test tests/physics.test.mjs`. Check JavaScript syntax with `node --check script.js` and `node --check physics.js`. Verify conservation of simulated ray counts, straight transmission at zero density, deterministic seeds, and finite wave fields. Preview desktop/mobile widths, keyboard and touch interaction, tab selection, source movement, pause/resume, density resets, reduced motion, no-JavaScript rendering, citation copying, and CV downloads. Optional external fonts have system/Georgia fallbacks.
