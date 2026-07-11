import { textColorFor } from '../lib/data'

const FATE_LINES = {
  displaced: 'most of the job’s current economic value is at risk of AI substitution.',
  transformed: 'the job survives but its content compresses and shifts toward oversight.',
  pressured: 'safe from automation itself, but squeezed by second-order and demand-side effects.',
  insulated: 'protected — for now — by physical work, human premium, or accountability rules.',
  growing: 'demand for this work is created or expanded by AI.',
}

export default function HowToRead({ categories, meta, rangeNote }) {
  const mechs = meta?.mechanisms || {}
  const channels = meta?.second_order_channels || {}
  return (
    <section id="how-to-read" className="mt-16 scroll-mt-4">
      <h2 className="font-serif text-2xl font-bold">How to read this</h2>

      <div className="mt-5 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            The five fates
          </h3>
          <ul className="mt-3 space-y-2">
            {Object.entries(categories).map(([key, cat]) => (
              <li key={key} className="flex items-start gap-2.5 text-sm">
                <span
                  className="mt-0.5 inline-flex h-5 w-14 shrink-0 items-center justify-center rounded text-[10px] font-bold"
                  style={{ backgroundColor: cat.color, color: textColorFor(cat.color) }}
                >
                  {(cat.range || '').split(' ')[0]}
                </span>
                <span>
                  <strong className="capitalize">{key}</strong> — {FATE_LINES[key] || cat.label}
                </span>
              </li>
            ))}
          </ul>
          {rangeNote && <p className="mt-2 text-xs text-neutral-400">{rangeNote}</p>}

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            On every tile
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2.5">
              <span
                className="mt-0.5 inline-block h-5 w-14 shrink-0 rounded"
                style={{ backgroundColor: '#27ae60' }}
                aria-hidden
              />
              <span>
                <strong>Fill color + number</strong> — the direct automation fate and score.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-block w-14 shrink-0 text-center text-sm" aria-hidden>
                📄⚡
              </span>
              <span>
                <strong>Small icons</strong> — <em>why</em>, directly:{' '}
                {Object.values(mechs)
                  .map((m) => `${m.glyph} ${m.label.toLowerCase()}`)
                  .join(' · ')}
                .
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span
                className="mt-0.5 inline-flex h-5 w-14 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ backgroundColor: '#c0392b', color: '#fff' }}
                aria-hidden
              >
                💸🔀
              </span>
              <span>
                <strong>Badge</strong> — <em>why, indirectly</em>: green/yellow/red for how hard
                the second wave hits, icons for the channel:{' '}
                {Object.values(channels)
                  .map((c) => `${c.glyph} ${c.label.toLowerCase()}`)
                  .join(' · ')}
                .
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span
                className="mt-0.5 inline-block h-5 w-14 shrink-0 rounded bg-neutral-300"
                style={{ outline: '2px dotted rgba(0,0,0,.45)', outlineOffset: '-3px' }}
                aria-hidden
              />
              <span>
                <strong>Dotted border</strong> — low-confidence score: extrapolation, not data.
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Three ideas behind the map
          </h3>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-neutral-700">
            <li>
              <strong>Verification speed determines automation order.</strong> Work whose output
              is cheaply checkable (code compiles, tests pass) automates first; work needing
              real-world or system-level verification automates last. That predicts the observed
              order: software → documents → decisions → atoms.
            </li>
            <li>
              <strong>Artifact production vs. outcome ownership</strong> determines who within a
              job is exposed. Producing artifacts from specs is exposed; owning outcomes —
              deciding, verifying, being accountable — is amplified.
            </li>
            <li>
              <strong>The badges are the second-wave story.</strong> A job can be
              automation-proof while its customers, colleagues-to-be, or funders are
              automation-exposed. A barista&rsquo;s risk isn&rsquo;t a robot — it&rsquo;s a
              neighborhood that can no longer afford coffee. Green tile, red badge: the
              map&rsquo;s most important pattern.
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}
