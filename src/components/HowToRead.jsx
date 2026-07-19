import { textColorFor } from '../lib/data'

const FATE_LINES = {
  displaced: 'most of the job’s current economic value is at risk of AI substitution.',
  transformed: 'the job survives but its content compresses and shifts toward oversight.',
  pressured: 'safe from automation itself, but squeezed by second-order and demand-side effects.',
  insulated: 'protected — for now — by physical work, human premium, or accountability rules.',
  growing: 'demand for this work is created or expanded by AI.',
}

export default function HowToRead({ categories, meta, rangeNote }) {
  return (
    <section id="how-to-read" className="mt-16 scroll-mt-4">
      <h2 className="font-serif text-2xl font-bold text-neutral-100">How to read this</h2>

      <div className="mt-5 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            The five fates
          </h3>
          <ul className="mt-3 space-y-2">
            {Object.entries(categories).map(([key, cat]) => (
              <li key={key} className="flex items-start gap-2.5 text-sm text-neutral-300">
                <span
                  className="mt-0.5 inline-flex h-5 w-14 shrink-0 items-center justify-center rounded text-[10px] font-bold"
                  style={{ backgroundColor: cat.color, color: textColorFor(cat.color) }}
                >
                  {(cat.range || '').split(' ')[0]}
                </span>
                <span>
                  <strong className="capitalize text-neutral-100">{key}</strong> —{' '}
                  {FATE_LINES[key] || cat.label}
                </span>
              </li>
            ))}
          </ul>
          {rangeNote && <p className="mt-2 text-xs text-neutral-500">{rangeNote}</p>}

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            The tree
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-300">
            <li>
              <strong className="text-neutral-100">Boughs</strong> — industries; thickness is the
              number of jobs mapped, the colored number is the industry&rsquo;s overall score.
              One bough open at a time.
            </li>
            <li>
              <strong className="text-neutral-100">Leaves</strong> — jobs, colored by fate, with
              score and second-wave channels written on the leaf. Dotted edge = low-confidence
              score. Click for reasoning and sources.
            </li>
            <li>
              <strong className="text-neutral-100">Roots</strong> — the second wave. Each root is
              one channel, thick in proportion to the jobs it reaches. Hover a leaf to light the
              roots that feed on it; hover a root to see which leaves it touches.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Three ideas behind the map
          </h3>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-neutral-300">
            <li>
              <strong className="text-neutral-100">
                Verification speed determines automation order.
              </strong>{' '}
              Work whose output is cheaply checkable (code compiles, tests pass) automates
              first; work needing real-world or system-level verification automates last. That
              predicts the observed order: software → documents → decisions → atoms.
            </li>
            <li>
              <strong className="text-neutral-100">
                Artifact production vs. outcome ownership
              </strong>{' '}
              determines who within a job is exposed. Producing artifacts from specs is
              exposed; owning outcomes — deciding, verifying, being accountable — is amplified.
            </li>
            <li>
              <strong className="text-neutral-100">
                The roots are the second-wave story.
              </strong>{' '}
              A job can be automation-proof while its customers, colleagues-to-be, or funders
              are automation-exposed. A barista&rsquo;s risk isn&rsquo;t a robot — it&rsquo;s a
              neighborhood that can no longer afford coffee. A green leaf with glowing roots:
              the map&rsquo;s most important pattern.
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}
