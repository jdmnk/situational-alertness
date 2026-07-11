import { categoryForScore, textColorFor } from '../lib/data'

export default function MobileMap({
  industries,
  meta,
  isMatch,
  selectedJobId,
  focusId,
  onSelectJob,
  onFocus,
}) {
  const categories = meta.scoring.categories

  return (
    <div className="space-y-2">
      {industries.map((ind) => {
        const cat = categoryForScore(ind.overall_score, categories)
        const color = categories[cat].color
        const expanded = focusId === ind.id
        return (
          <div key={ind.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <button
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
              onClick={() => onFocus(expanded ? null : ind.id)}
              aria-expanded={expanded}
            >
              <span
                className="inline-block h-8 w-2 shrink-0 rounded-full"
                style={{ background: color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{ind.name}</span>
                {/* proportion bar of the five fates within this industry */}
                <span className="mt-1 flex h-1.5 w-full overflow-hidden rounded-full" aria-hidden>
                  {Object.entries(categories).map(([key, c]) => {
                    const n = ind.jobs.filter((j) => j.category === key).length
                    if (!n) return null
                    return (
                      <span
                        key={key}
                        style={{ backgroundColor: c.color, flexGrow: n }}
                        className="h-full"
                      />
                    )
                  })}
                </span>
              </span>
              <span className="shrink-0 text-xs font-bold text-neutral-500">
                {ind.overall_score}
              </span>
              <span className="shrink-0 text-neutral-400">{expanded ? '−' : '+'}</span>
            </button>

            {expanded && (
              <div className="flex flex-wrap gap-1.5 border-t border-neutral-100 px-3 py-3">
                {ind.jobs.map((job) => {
                  const c = categories[job.category].color
                  const fg = textColorFor(c)
                  const match = isMatch(job)
                  const stripes =
                    job.second_order_risk === 'high'
                      ? fg === '#ffffff'
                        ? 'stripes-light'
                        : 'stripes-dark'
                      : ''
                  return (
                    <button
                      key={job.id}
                      onClick={() => onSelectJob(job.id, ind.id)}
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${stripes}`}
                      style={{
                        backgroundColor: c,
                        color: fg,
                        opacity: match ? 1 : 0.25,
                        outline:
                          job.confidence === 'low'
                            ? `2px dotted ${fg === '#ffffff' ? 'rgba(255,255,255,.75)' : 'rgba(0,0,0,.4)'}`
                            : selectedJobId === job.id
                              ? '2px solid #1c1b19'
                              : undefined,
                        outlineOffset: '-2px',
                      }}
                    >
                      {job.name}
                      {job.second_order_risk === 'high' && ' ⚠'}
                      <span className="ml-1 opacity-75">{job.score}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
