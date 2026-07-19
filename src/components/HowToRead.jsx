import { textColorFor } from '../lib/data'
import { LAYERS } from '../lib/layers'

const FATE_LINES = {
  displaced: 'most of the job’s current economic value is at risk of AI substitution.',
  transformed: 'the job survives but its content compresses and shifts toward oversight.',
  pressured: 'safe from automation itself, but squeezed by second-order and demand-side effects.',
  insulated: 'protected — for now — by physical work, human premium, or accountability rules.',
  growing: 'demand for this work is created or expanded by AI.',
}

const LAYER_LINES = {
  fate: 'the default view — the five fates above.',
  indirect:
    'ignores automation of the job itself and colors purely by second-wave exposure — the “safe” trades and service jobs light up.',
  timeline:
    'when the main effect becomes clearly visible in employment or wages — red = already here.',
  confidence:
    'how well-supported each score is — the honesty layer. Bright = data, dark = framework judgment.',
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
            The layers
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-300">
            {Object.entries(LAYERS).map(([key, layer]) => (
              <li key={key}>
                <strong className="text-neutral-100">{layer.label}</strong> — {LAYER_LINES[key]}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-neutral-500">
            A dotted cell border marks a low-confidence score (extrapolation, not data),
            whatever the active layer.
          </p>
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
                The second-order layer is the second-wave story.
              </strong>{' '}
              A job can be automation-proof while its customers, colleagues-to-be, or funders
              are automation-exposed. A barista&rsquo;s risk isn&rsquo;t a robot — it&rsquo;s a
              neighborhood that can no longer afford coffee. Green in one layer, red in the
              other: the map&rsquo;s most important pattern.
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}
