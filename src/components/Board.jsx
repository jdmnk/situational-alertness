import { useEffect, useRef, useState } from 'react'
import { categoryForScore, textColorFor } from '../lib/data'

function JobTile({ job, categories, match, selected, onClick }) {
  const color = categories[job.category].color
  const fg = textColorFor(color)
  const stripes =
    job.second_order_risk === 'high'
      ? fg === '#ffffff'
        ? 'stripes-light'
        : 'stripes-dark'
      : ''
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-left text-[13px] font-semibold leading-snug transition hover:brightness-110 ${stripes}`}
      style={{
        backgroundColor: color,
        color: fg,
        opacity: match ? 1 : 0.18,
        outline:
          job.confidence === 'low'
            ? `2px dotted ${fg === '#ffffff' ? 'rgba(255,255,255,.75)' : 'rgba(0,0,0,.4)'}`
            : undefined,
        outlineOffset: job.confidence === 'low' ? '-3px' : undefined,
        boxShadow: selected ? '0 0 0 3px var(--paper), 0 0 0 5px #1c1b19' : undefined,
      }}
      title={`${job.name} — ${job.score} (${categories[job.category].label})${
        job.second_order_risk === 'high' ? ' · high demand-side risk' : ''
      }`}
      aria-label={`${job.name}, score ${job.score}, ${categories[job.category].label}, timeline ${job.timeline}. Click for details.`}
    >
      {job.name}
      {job.second_order_risk === 'high' && <span aria-hidden> ⚠</span>}
      <span className="ml-1.5 font-normal opacity-75">{job.score}</span>
    </button>
  )
}

export default function Board({
  industries,
  meta,
  isMatch,
  selectedJobId,
  focusId,
  onSelectJob,
  onFocus,
  accordion,
}) {
  const categories = meta.scoring.categories
  const [collapsed, setCollapsed] = useState(() => new Set())
  const sectionRefs = useRef({})

  // Desktop: a strip/hash navigation target scrolls its section into view.
  useEffect(() => {
    if (accordion || !focusId) return
    sectionRefs.current[focusId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [focusId, accordion])

  const isExpanded = (id) => (accordion ? focusId === id : !collapsed.has(id))

  const toggle = (id) => {
    if (accordion) {
      onFocus(isExpanded(id) ? null : id)
    } else {
      setCollapsed((prev) => {
        const next = new Set(prev)
        next.has(id) ? next.delete(id) : next.add(id)
        return next
      })
    }
  }

  return (
    <div className="space-y-3">
      {industries.map((ind) => {
        const cat = categoryForScore(ind.overall_score, categories)
        const color = categories[cat].color
        const jobs = [...ind.jobs].sort((a, b) => b.score - a.score)
        const matches = ind.jobs.filter(isMatch).length
        const expanded = isExpanded(ind.id)
        return (
          <section
            key={ind.id}
            ref={(el) => (sectionRefs.current[ind.id] = el)}
            className={`scroll-mt-24 overflow-hidden rounded-xl border border-neutral-200 bg-white transition-opacity ${
              matches === 0 ? 'opacity-40' : ''
            }`}
          >
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
              onClick={() => toggle(ind.id)}
              aria-expanded={expanded}
            >
              <span
                className="h-9 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-base font-bold">{ind.name}</span>
                  <span className="text-xs text-neutral-400">
                    {matches === ind.jobs.length
                      ? `${ind.jobs.length} jobs`
                      : `${matches}/${ind.jobs.length} match filters`}
                  </span>
                </span>
                <span
                  className="mt-1.5 flex h-1.5 w-full max-w-xs overflow-hidden rounded-full"
                  aria-hidden
                >
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
              <span
                className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
                style={{ backgroundColor: color, color: textColorFor(color) }}
                title={`Overall score ${ind.overall_score} — ${categories[cat].label}`}
              >
                {ind.overall_score}
              </span>
              <span className="shrink-0 text-neutral-400" aria-hidden>
                {expanded ? '−' : '+'}
              </span>
            </button>

            {expanded && (
              <div className="border-t border-neutral-100 px-4 pb-4 pt-3">
                {!accordion && ind.summary && (
                  <p className="mb-3 max-w-3xl text-sm leading-relaxed text-neutral-600">
                    {ind.summary}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {jobs.map((job) => (
                    <JobTile
                      key={job.id}
                      job={job}
                      categories={categories}
                      match={isMatch(job)}
                      selected={selectedJobId === job.id}
                      onClick={() => onSelectJob(job.id, ind.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
