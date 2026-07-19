// The "second wave" explainer: automation's indirect blast radius, the part
// task-exposure studies can't see. Channel definitions and example jobs come
// from the dataset itself.

function ChannelCard({ ch, examples }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <h4 className="text-sm font-bold">
        <span aria-hidden>{ch.glyph}</span> {ch.label}
      </h4>
      <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">{ch.description}</p>
      {examples.length > 0 && (
        <p className="mt-2 text-xs text-neutral-400">
          e.g. {examples.slice(0, 3).join(' · ')}
        </p>
      )}
    </div>
  )
}

export default function SecondWave({ meta, industries }) {
  const channels = meta.second_order_channels || {}
  if (!Object.keys(channels).length) return null

  const examplesFor = (key) =>
    industries
      .flatMap((i) => i.jobs)
      .filter((j) => j.second_order_channels?.includes(key))
      .sort((a, b) => {
        const w = { high: 2, medium: 1, low: 0 }
        return (w[b.second_order_risk] ?? 0) - (w[a.second_order_risk] ?? 0)
      })
      .map((j) => j.name.split(' (')[0])

  return (
    <section id="second-wave" className="mt-16 scroll-mt-4">
      <h2 className="font-serif text-2xl font-bold">The second wave</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-300">
        Task-exposure studies answer one question: can AI do this job? But &ldquo;the robots
        can&rsquo;t do my job&rdquo; is not the same as &ldquo;my job is safe.&rdquo; When AI
        automates desk work, the shock travels outward through the economy along channels that
        never touch the job itself — a plumber faces zero automation and{' '}
        <em>two</em> of them: customers with less to spend, and displaced office workers
        retraining into the trade.
      </p>

      {/* Flow: one cause, five transmission channels */}
      <div className="mt-6">
        <div className="mx-auto max-w-md rounded-xl bg-neutral-800 px-5 py-3 text-center text-sm font-semibold text-white">
          AI automates knowledge work
        </div>
        <div className="mx-auto mt-1 flex justify-center text-neutral-400" aria-hidden>
          <svg width="220" height="28" viewBox="0 0 220 28" fill="none">
            <path d="M110 0 v8 M110 8 H20 M110 8 H200 M20 8 v6 M65 8 v6 M110 8 v6 M155 8 v6 M200 8 v6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16 12 l4 8 4-8 M61 12 l4 8 4-8 M106 12 l4 8 4-8 M151 12 l4 8 4-8 M196 12 l4 8 4-8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <div className="mt-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(channels).map(([key, ch]) => (
            <ChannelCard key={key} ch={ch} examples={examplesFor(key)} />
          ))}
        </div>
      </div>

      <p className="mt-5 max-w-3xl text-sm text-neutral-300">
        On the map above, this is the <strong className="text-neutral-100">right-hand bar</strong>{' '}
        of every row — its length is how hard the second wave hits, and the channel is written
        beside it. Industries whose rows lean right (trades, hospitality, personal services)
        are exactly the ones the &ldquo;robots can&rsquo;t do my job&rdquo; framing misses.
      </p>
    </section>
  )
}
