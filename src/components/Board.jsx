import { useEffect, useRef } from 'react'
import { categoryForScore, industrySoLevel, textColorFor } from '../lib/data'

function JobTile({ job, meta, lens, match, selected, onClick }) {
  const categories = meta.scoring.categories
  const soLevels = meta.scoring.second_order_levels || {}
  const channels = meta.second_order_channels || {}
  const soLens = lens === 'so'
  const color = soLens
    ? (soLevels[job.second_order_risk]?.color ?? '#999')
    : categories[job.category].color
  const fg = textColorFor(color)
  // Stripes mark demand-side risk in the fate lens; redundant under the SO lens.
  const stripes =
    !soLens && job.second_order_risk === 'high'
      ? fg === '#ffffff'
        ? 'stripes-light'
        : 'stripes-dark'
      : ''
  const jobChans = job.second_order_channels || []
  const title = soLens
    ? `${job.name} — ${job.second_order_risk} indirect exposure${
        jobChans.length ? ': ' + jobChans.map((c) => channels[c]?.label ?? c).join(', ') : ''
      }`
    : `${job.name} — ${job.score} (${categories[job.category].label})${
        job.second_order_risk === 'high' ? ' · high demand-side risk' : ''
      }`
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
      title={title}
      aria-label={title + '. Click for details.'}
    >
      {job.name}
      {!soLens && job.second_order_risk === 'high' && <span aria-hidden> ⚠</span>}
      {soLens ? (
        jobChans.length > 0 && (
          <span className="ml-1.5 font-normal" aria-hidden>
            {jobChans.map((c) => channels[c]?.glyph ?? '').join('')}
          </span>
        )
      ) : (
        <span className="ml-1.5 font-normal opacity-75">{job.score}</span>
      )}
    </button>
  )
}

export default function Board({
  industries,
  meta,
  lens,
  isMatch,
  selectedJobId,
  focusId,
  onSelectJob,
  onFocus,
  revealMatches,
}) {
  const categories = meta.scoring.categories
  const soLevels = meta.scoring.second_order_levels || {}
  const soLens = lens === 'so'
  const sectionRefs = useRef({})

  // Opening a section (strip click, header, or #i= deep link) scrolls it under
  // the sticky toolbar.
  useEffect(() => {
    if (!focusId) return
    sectionRefs.current[focusId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [focusId])

  const toggle = (id) => onFocus(focusId === id ? null : id)

  return (
    <div className="space-y-3">
      {industries.map((ind) => {
        const soLevel = industrySoLevel(ind)
        const color = soLens
          ? (soLevels[soLevel]?.color ?? '#999')
          : categories[categoryForScore(ind.overall_score, categories)].color
        const allJobs = [...ind.jobs].sort((a, b) => b.score - a.score)
        const matches = ind.jobs.filter(isMatch).length
        // While searching, sections with hits reveal just those tiles; the
        // accordion otherwise shows one industry at a time.
        const opened = focusId === ind.id
        const expanded = revealMatches ? matches > 0 || opened : opened
        const jobs = revealMatches && !opened ? allJobs.filter(isMatch) : allJobs
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
                  {soLens
                    ? Object.entries(soLevels).map(([key, lvl]) => {
                        const n = ind.jobs.filter((j) => j.second_order_risk === key).length
                        if (!n) return null
                        return (
                          <span
                            key={key}
                            style={{ backgroundColor: lvl.color, flexGrow: n }}
                            className="h-full"
                          />
                        )
                      })
                    : Object.entries(categories).map(([key, c]) => {
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
              {soLens ? (
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: color, color: textColorFor(color) }}
                  title={`${soLevels[soLevel]?.label ?? soLevel} (aggregated from jobs)`}
                >
                  {soLevel}
                </span>
              ) : (
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: color, color: textColorFor(color) }}
                  title={`Overall score ${ind.overall_score}`}
                >
                  {ind.overall_score}
                </span>
              )}
              <span className="shrink-0 text-neutral-400" aria-hidden>
                {expanded ? '−' : '+'}
              </span>
            </button>

            {expanded && (
              <div className="border-t border-neutral-100 px-4 pb-4 pt-3">
                {opened && ind.summary && (
                  <p className="mb-3 max-w-3xl text-sm leading-relaxed text-neutral-600">
                    {ind.summary}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {jobs.map((job) => (
                    <JobTile
                      key={job.id}
                      job={job}
                      meta={meta}
                      lens={lens}
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
