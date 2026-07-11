import {
  mechanismLabel,
  RISK_LABELS,
  textColorFor,
  TIMELINE_LABELS,
} from '../lib/data'

function Chip({ color, children }) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={color ? { backgroundColor: color, color: textColorFor(color) } : undefined}
    >
      {children}
    </span>
  )
}

export default function DetailPanel({ selected, meta, sources, onClose, variant }) {
  const wrapperClass =
    variant === 'sheet'
      ? 'slide-up fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-neutral-200 bg-white p-5 shadow-[0_-8px_30px_rgba(0,0,0,.15)]'
      : 'slide-in fixed right-0 top-0 z-50 h-full w-[26rem] max-w-[92vw] overflow-y-auto bg-white p-6 shadow-2xl'

  if (!selected) return null

  const { job, industry } = selected
  const categories = meta.scoring.categories
  const cat = categories[job.category]
  const srcMap = sources?.sources || {}

  return (
    <aside className={wrapperClass} aria-label={`Details for ${job.name}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold leading-snug">{job.name}</h3>
          <p className="text-xs text-neutral-500">{industry.name}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close details"
          className="rounded-md px-2 py-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Chip color={cat.color}>
          {job.score} · {cat.label}
        </Chip>
        <Chip>
          <span className="rounded-full border border-neutral-300 px-2 py-0.5">
            {TIMELINE_LABELS[job.timeline] || job.timeline}
          </span>
        </Chip>
      </div>

      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">Second-order (indirect) risk</dt>
          <dd className="font-semibold">
            {RISK_LABELS[job.second_order_risk] || job.second_order_risk}
            {job.second_order_risk === 'high' && ' ⚠'}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">Confidence</dt>
          <dd className="font-semibold">
            {job.confidence}
            {job.confidence === 'low' && (
              <span className="ml-1 font-normal text-neutral-400">(extrapolated)</span>
            )}
          </dd>
        </div>
      </dl>

      <p className="mt-4 border-l-2 border-neutral-300 pl-3 text-sm leading-relaxed text-neutral-700">
        {job.note}
      </p>

      {job.second_order_channels?.length > 0 && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            How this job gets hit indirectly
          </h4>
          <ul className="mt-2 space-y-2">
            {job.second_order_channels.map((c) => {
              const ch = meta.second_order_channels?.[c]
              if (!ch) return null
              return (
                <li key={c} className="text-sm">
                  <span className="font-semibold">
                    {ch.glyph} {ch.label}
                  </span>
                  <span className="block text-xs leading-snug text-neutral-600">
                    {ch.description}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {job.mechanisms?.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Mechanisms
          </h4>
          <ul className="mt-2 space-y-2">
            {job.mechanisms.map((m) => {
              const mech = meta.mechanisms[m]
              return (
                <li key={m} className="text-sm">
                  <span className="font-semibold">
                    {mech?.glyph && <span aria-hidden>{mech.glyph} </span>}
                    {mech?.label ?? mechanismLabel(m)}
                  </span>
                  {mech?.description && (
                    <span className="block text-xs leading-snug text-neutral-500">
                      {mech.description}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {job.sources?.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Sources
          </h4>
          <ul className="mt-2 space-y-1">
            {job.sources.map((id) => {
              const s = srcMap[id]
              if (!s)
                return (
                  <li key={id} className="text-xs text-neutral-400">
                    {id}
                  </li>
                )
              return (
                <li key={id} className="text-sm">
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline decoration-blue-300 underline-offset-2 hover:decoration-blue-700"
                    >
                      {s.title}
                    </a>
                  ) : (
                    <span>{s.title}</span>
                  )}
                  {s.year && <span className="ml-1 text-xs text-neutral-400">({s.year})</span>}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </aside>
  )
}
