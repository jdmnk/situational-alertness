# AI Economic Impact Map (sitprep)

An interactive single-page site that maps how AI affects the economy, top-down:
**economy → industries → jobs**, each colored by one of five fates —
displaced / transformed / second-order pressured / insulated / growing — with
mechanisms, timelines, and demand-side (second-order) risk made visible.

Built from [`SPEC.md`](SPEC.md). Scores are editorial estimates, not
measurements — see the Methodology section on the site.

## Stack

- React + [d3-hierarchy](https://github.com/d3/d3-hierarchy) (partition layout; React renders, D3 computes)
- Tailwind CSS 4, Vite
- Static — no backend, no trackers

## Data

All content lives in [`public/data.json`](public/data.json) (industries, jobs,
scores, category colors, mechanism dictionary) and
[`public/sources.json`](public/sources.json) (annotated sources). The site
fetches both at runtime and validates the shape on load, so the dataset can be
revised without touching code. `meta.version` / `meta.updated` are displayed so
stale data is visible.

## Develop

```sh
npm install
npm run dev      # local dev server
npm run build    # static build in dist/
```

## Deploy

Pushes to `main` deploy to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Disclaimer

Editorial estimates — not career advice, not predictions. The point is the
mechanisms, not the decimals.
