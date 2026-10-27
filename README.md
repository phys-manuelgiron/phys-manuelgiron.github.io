# Manuel Giron · Physics portfolio

A static, accessible research portfolio for industry teams and summer research programs. The visual direction, **From light to fields**, connects experimental photonics and scientific computing with an interest in high energy physics and quantum field theory.

## Run locally

```sh
npm run dev
```

Open <http://localhost:3000>. No installation or build is required; the server uses Node.js built-ins.

## Content and files

- `index.html`: biography, research, publication list, education, and verified contact links. All content is available without JavaScript.
- `styles.css`: responsive layout, typography, and print/reduced-motion styles.
- `script.js`: the free-field illustration, citation copying, and navigation enhancement.
- `cv.html` / `cv.css`: the web and print versions of the CV.
- `public/Manuel-Giron-CV.pdf`: downloadable CV, generated from `cv.html` using Chrome's print-to-PDF with A4 page size, CSS margins, and no browser headers/footers. Regenerate after editing the CV.
- `public/monogram.svg`: the site's favicon.

The original CAD viewer and sample model files are retained in the repository, but are not loaded by the portfolio.

## Updating the portfolio

Edit the static HTML directly. Keep research contributions and publication statuses accurate. The Applied Optics article links to its verified DOI, [10.1364/AO.606352](https://doi.org/10.1364/AO.606352). Optical-glazing metrics are simulation-derived. The avian-feather laser manuscript is in preparation; NanoFlorida is listed as a poster presentation without an invented title.

The source résumé remains a local document and is excluded from version control. The public CV omits the phone number and placeholder portfolio URL, and adds the stated HEP/QFT interests alongside established experience.

## Scientific illustration

The figure is an educational classical Klein–Gordon wave packet in 1+1 dimensions, separate from research data. It sums 81 Gaussian-weighted plane waves using `omega = sqrt(k² + m²)` at fixed `t = 3.2`, central `k = 4`, width `0.85`, and natural units `c = hbar = 1`. The solid trace is the real field; the dashed trace is the magnitude of its complex representation. The mass slider uses native keyboard controls. There is no continuous animation.

The initial SVG contains the same computed packet at `m = 1.2` as a fallback. If the model changes, update both the generated fallback paths in `index.html` and the JavaScript calculation.

## Hosting

Serve the repository root as static files. For GitHub Pages, use **Settings → Pages → Deploy from a branch**, selecting `main` and `/ (root)`. No `gh-pages` package, build directory, or framework is required. The local deployment scripts that predate this redesign are not needed for this workflow.

Use the URL GitHub Pages reports; the configured Git remote currently names `phys-manuelgiron/pays-manuelgiron.github.io`, so do not assume that pushing automatically publishes at the root user-site URL. Relative asset links also support a project-site path.

## Verification

Validate local links and HTML structure, check JavaScript syntax with `node --check script.js`, and preview desktop and mobile sizes. Verify the slider, native keyboard operation, citation success/failure feedback, anchor navigation, reduced motion, and no-JavaScript readability. External font loading is optional; system and Georgia fallbacks are defined.
