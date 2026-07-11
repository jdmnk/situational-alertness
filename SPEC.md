# AI Economic Impact Map — Build Specification

**Handoff document for a coding agent. Read fully before building.**
Version 0.1 · 2026-07-11 · Data: `data.json` (same folder)

---

## 1. What we're building

An interactive single-page website that visualizes how AI affects the economy, top-down: **economy → industries → specific jobs**, color-coded by impact severity, including the jobs that are insulated or growing (green branches), not just the displaced ones (red branches).

The site's thesis, which the visualization must communicate without a wall of text: AI impact is not binary "replaced or safe." There are five distinct fates (displaced / transformed / second-order pressured / insulated / growing), driven by identifiable mechanisms, on different timelines — and some of the biggest risks are *demand-side* (your customers losing income), not automation-side.

## 2. Visualization design

### Primary view: zoomable hierarchy
The requested "top-down branch" concept maps best to one of these (implement the first; the second is an acceptable fallback):

1. **Zoomable icicle / partition chart (recommended)** — root node "Economy" at top, industries as the first row (width ∝ workforce share or job count), jobs as the second row, each cell colored by category. Click an industry to zoom into its jobs. Icicles handle 15 industries × 4-10 jobs far better than node-link trees (no edge spaghetti, color reads as area).
2. **Collapsible tree (d3 tree/dendrogram)** — matches the "branch" mental model literally; acceptable if icicle proves cluttered on mobile.

Do NOT use a static sunburst as primary (labels become unreadable at the leaf level).

### Color coding (from `meta.scoring.categories` in data.json)
- `displaced` #c0392b (red) — score 70-100
- `transformed` #e67e22 (orange) — 45-69
- `pressured` #f1c40f (yellow) — 30-44 — *second-order/demand-side pressure*
- `insulated` #27ae60 (green) — 10-29
- `growing` #145a32 (dark green) — 0-9

Color by **category**, not raw score (categories encode judgment beyond the number). Show the score in the detail panel. Add a persistent legend explaining the five fates in one line each.

### Secondary encoding: second-order risk
Each job has `second_order_risk` (low/medium/high). Encode **high** as a hatched/striped overlay or a small ⚠ badge on the cell — this is the site's most novel insight (e.g. chef: green cell, hatched — automation-proof, demand-exposed). Explain in legend: "striped = safe from automation, exposed to customers losing income."

### Detail panel (on click/tap of a job)
Show: job name, industry, score + category chip, timeline chip, second-order risk, the `note` (one-sentence reasoning), mechanism tags (human-readable labels from `meta.mechanisms`), and source links (resolve `sources` ids against the Sources section below / `sources` object).

### Filters & interactions
- Filter by category (toggle the five fates)
- Filter by timeline (now / 1-3y / 3-7y / 7-15y)
- Sort industries by overall_score (worst-hit first) or alphabetical
- Search box for job names
- URL state (selected node, filters) in the hash so views are shareable

### Mobile
Must work on phones: icicle becomes vertically stacked (industries as rows, tap to expand jobs as a list of colored chips). Detail panel becomes a bottom sheet.

## 3. Page structure

1. **Hero** — one-paragraph framing: what the map shows, the five fates, "updated {meta.updated}".
2. **The map** (the visualization, full-width, dominant).
3. **How to read this** — legend + the three key ideas in ~4 sentences: (a) verification speed determines automation order, (b) artifact-production vs outcome-ownership determines who within a job is exposed, (c) striped cells = demand-side risk: automation-proof jobs whose customers are automation-exposed.
4. **Methodology** — collapsible; content from §5 below, honest about editorial judgment.
5. **Sources** — the annotated list from §6, rendered as cards or a list.
6. **Footer** — disclaimer: editorial estimates, not career advice or predictions; version; link to the JSON ("download the data").

## 4. Technical requirements

- **Stack**: React + D3 (d3-hierarchy for the partition layout; React renders, D3 computes). Tailwind for styling. Single-page, static — no backend.
- **Data loading**: fetch `data.json` at runtime — the JSON is the single source of truth so the dataset can be updated without touching code. Validate shape on load; render a graceful error if malformed.
- **The JSON schema is documented inside the file itself** (`meta` object). Treat `meta.scoring` and `meta.mechanisms` as the dictionary for all labels/colors — no hardcoded category colors in components.
- **Performance**: ~90 leaf nodes; no virtualization needed. Animate zoom transitions (250-400ms).
- **Accessibility**: category conveyed by color AND a text chip; keyboard navigation through cells; sufficient contrast on the yellow category (use dark text).
- **No trackers.** Optional: PostHog EU if analytics wanted later.

### Update workflow (design constraint)
The dataset will be revised (scores re-estimated, jobs added, new sources) roughly quarterly. Therefore:
- All content lives in `data.json` + a `sources.json` (or the sources kept in data.json if preferred — currently they're listed in §6 of this spec; generate a `sources.json` from it during build).
- Add a `meta.version`/`meta.updated` display so stale data is visible.
- Nice-to-have: a "changelog" array in meta rendered as "what changed" — skip for v1 if time-constrained.

## 5. Methodology (render this, honestly)

Scores are **editorial estimates**, not measurements. They synthesize: (a) task-level exposure research (Anthropic Economic Index, Goldman Sachs, IMF — see sources), (b) early empirical employment data (Stanford "Canaries" ADP payroll analysis), and (c) a mechanism framework:

- **Verification speed**: work whose output is cheaply checkable (code compiles, tests pass) automates first; work needing real-world or system-level verification automates last. This predicts the observed order: software → documents → decisions → atoms.
- **Artifact vs. outcome**: within every occupation, producing artifacts from specs is exposed; owning outcomes (deciding, verifying, being accountable) is amplified. Scores describe the occupation's *current median* job content.
- **Accountability shield**: where law, liability, certification, or public trust require a blamable human (pilots, auditors, physicians, judges), displacement lags capability by years — the constraint is institutional, not technical.
- **Second-order / demand-side exposure**: jobs paid from discretionary household income inherit their customers' displacement risk. A barista is automation-proof and customer-exposed. This is scored separately (`second_order_risk`) because it's invisible in task-exposure studies.
- **Jevons offsets**: cheaper output can expand total demand (legal services, software, research), partially offsetting job losses — why some high-task-exposure occupations show flat headcount (e.g., paralegals: ~44% task automation, BLS projects roughly flat employment).

Key honest caveats to display: exposure ≠ displacement (IMF's 60% advanced-economy exposure splits roughly half harmed / half augmented); institutional adoption lags lab capability (Amodei's 90%-of-code prediction came true inside Anthropic, not across the economy); serious institutions disagree by 20x on displacement magnitude (Goldman ~6-9% of US workforce over a decade vs. Amodei 10-20% unemployment scenario) — the disagreement is about *speed of capability growth*, and this map takes no side beyond flagging confidence levels per job.

## 6. Sources (annotated — render on site; also emit as sources.json)

**Empirical usage & labor-market data**
- `aei` — **Anthropic Economic Index** (anthropic.com/economic-index). Millions of anonymized Claude conversations mapped to O*NET tasks/occupations; open dataset. Early finding: ~36% of occupations used AI in ≥25% of tasks (Jan 2025), rising to ~49% by early 2026; usage concentrated in software and technical writing; distinguishes automation vs augmentation usage. THE machine-readable base layer — the open dataset can drive future versions of this site directly.
- `aei-labor` — **Anthropic, "Labor market impacts" research** (anthropic.com/research/labor-market-impacts). Effective-coverage measure; no clear aggregate unemployment signal as of early 2026, but hiring of 22-25yo workers into most-exposed roles slowed ~14% vs counterfactual.
- `stanford-canaries` — **Brynjolfsson, Chandar & Chen, "Canaries in the Coal Mine"** (Stanford Digital Economy Lab, 2025-26 + live Canaries Dashboard). ADP payroll microdata: early-career workers (22-25) in most AI-exposed occupations show ~13% relative employment decline (up to ~20% for young software developers); declines concentrated in *automative* (not augmentative) AI applications; adjustment via employment, not wages. The single best early-warning empirical source; dashboard updates with AEI data.
- `mit-iceberg` — **MIT "Iceberg Index"** (Nov 2025). Simulation: AI can technically perform work of ~11.7% of the US labor market (~$1.2T in wages); visible tech-layoff disruption is only ~2.2% — the rest sits quietly in HR, logistics, office administration.

**Exposure & projection studies**
- `goldman-2023` — **Goldman Sachs, "The Potentially Large Effects of AI on Economic Growth"** (March 2023, Hatzius et al.). ~300M full-time-equivalent jobs exposed globally; ~25% of US work hours automatable; office/admin support highest (46%), legal 44%, architecture/engineering 37%; physical/outdoor occupations least exposed. Exposure ≠ elimination: most affected workers see <half their workload automated.
- `goldman-2026` — **Goldman Sachs update** (June 2026). ~9% of US workforce (~15M workers) displaced across a 10-year transition; explicitly calls a "job apocalypse" unlikely; notes job creation in power and datacenter buildout.
- `imf-2024` — **IMF, "Gen-AI: Artificial Intelligence and the Future of Work"** (Jan 2024). ~40% of global employment exposed; ~60% in advanced economies, of which roughly half may be harmed and half augmented; inequality likely worsens; complementarity index by occupation is machine-readable and reusable.
- `wef-2025` — **World Economic Forum, Future of Jobs Report 2025**. 92M jobs displaced / 170M created by 2030 (net +78M, all drivers not just AI); fastest-declining: data entry clerks, bank tellers, cashiers, administrative assistants; ~40% of employers plan AI-related workforce reduction; 60% of workers need reskilling by 2027.

**Frontier viewpoints (the "what's coming" layer)**
- `amodei-axios` — **Dario Amodei via Axios** (May 2025): AI could eliminate ~50% of entry-level white-collar jobs within 1-5 years, unemployment 10-20%; names finance, law, consulting, tech; "duty to be honest about what is coming."
- `amodei-adolescence` — **Amodei, "The Adolescence of Technology"** (Jan 2026, 20k-word essay): doubles down; AI systems beyond-Nobel capability possible by 2027; policy proposals incl. token tax. Counterpoint noted in-essay coverage: his 90%-of-code prediction was true inside Anthropic, 25-40% across the industry — lab-view vs. diffusion-speed gap.
- `amodei-loving-grace` — **Amodei, "Machines of Loving Grace"** (Oct 2024): the optimistic branch — compressed decades of biology/health progress; useful as the upside scenario source.
- `aschenbrenner` — **Leopold Aschenbrenner, "Situational Awareness"** (June 2024, situational-awareness.ai): the influential fast-takeoff scenario document — AGI ~2027 via compute+algorithmic scaling, intelligence explosion, national-security framing. Use as the "fast timeline" bound; not empirical.
- `kanungo-2026` / `island-2025` — secondary syntheses tracking Amodei's prediction against 2025-26 data (entry-level tech hiring down 30-50%; ~55k US layoffs explicitly AI-attributed in 2025; banks cutting concentrated at analyst level; Anthropic hiring "orchestrators of Claudes"). Use for color, verify numbers against primaries before quoting.
- `framework` — this project's own mechanism framework (§5): scores marked `framework` rest primarily on the verification-speed / accountability / demand-side logic rather than a specific external study. Lowest evidential tier; flagged honestly via the `confidence` field.

**Recommended additions for v2** (not yet incorporated): OECD Employment Outlook AI chapters; Eloundou et al. "GPTs are GPTs" (the original task-exposure paper); Acemoglu's more skeptical macro estimates (useful counterweight); Challenger Gray monthly AI-attributed layoff counts (live tracking); EU AI Act implementation timeline as a regulatory-demand driver.

## 7. Data notes for the builder

- `data.json` currently contains **16 industries, ~90 jobs**. Treat industry `overall_score` as provided (don't recompute from job means — it's workforce-weighted judgment).
- Scores of jobs marked `confidence: low` should render with a subtle uncertainty indicator (e.g., dotted border).
- The `ai-economy` industry is intentionally green-dominant — it's the "what grows" branch the user explicitly wanted visible. Don't sort it out of view.
- Keep all copy on the site in the same register as the notes in the JSON: direct, no hype, no hedging soup.
