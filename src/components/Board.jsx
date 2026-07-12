import { useEffect, useRef } from 'react'
import { categoryForScore, industrySoLevel, textColorFor } from '../lib/data'

// One tile, both dimensions, no clicking required:
//   background color + score      = direct automation (how much)
//   small glyphs after score      = the mechanisms (why, direct)
//   spelled-out pill below the name = indirect exposure level + its channels (why, indirect)
function JobTile({ job, meta, match, selected, onClick }) {
  const categories = meta.scoring.categories
  const soLevels = meta.scoring.second_order_levels || {}
  const channels = meta.second_order_channels || {}
  const mechs = meta.mechanisms || {}

  const color = categories[job.category].color
  const fg = textColorFor(color)
  const jobChans = job.second_order_channels || []
  const risk = job.second_order_risk
  const showBadge = jobChans.length > 0 || risk !== 'low'
  const soColor = soLevels[risk]?.color ?? '#999'

  const mechLabels = job.mechanisms.map((m) => mechs[m]?.label ?? m).join(', ')
  const chanLabels = jobChans.map((c) => channels[c]?.label ?? c).join(', ')
  const title =
    `${job.name} — automation ${job.score} (${categories[job.category].label})` +
    (mechLabels ? `. Why: ${mechLabels}` : '') +
    `. Indirect exposure: ${risk}` +
    (chanLabels ? ` via ${chanLabels}` : '')

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start rounded-lg px-3 py-2 text-left text-[13px] font-semibold leading-snug transition hover:brightness-110"
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
      <span>
        {job.name}
        <span className="ml-1.5 font-normal opacity-75">{job.score}</span>
        {job.mechanisms.length > 0 && (
          <span className="ml-1 font-normal opacity-70" aria-hidden>
            {job.mechanisms.map((m) => mechs[m]?.glyph ?? '').join('')}
          </span>
        )}
      </span>
      {showBadge && (
        <span
          className="mt-1.5 inline-block max-w-full rounded-full px-2 py-0.5 text-[10px] font-semibold leading-tight"
          style={{ backgroundColor: soColor, color: textColorFor(soColor) }}
          aria-hidden
        >
          {jobChans.length
            ? jobChans.map((c) => channels[c]?.label.toLowerCase() ?? c).join(' · ')
            : `indirect: ${risk}`}
        </span>
      )}
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
  revealMatches,
}) {
  const categories = meta.scoring.categories
  const soLevels = meta.scoring.second_order_levels || {}
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
        const color = categories[categoryForScore(ind.overall_score, categories)].color
        const soLevel = industrySoLevel(ind)
        const soColor = soLevels[soLevel]?.color ?? '#999'
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
                title={`Overall automation score ${ind.overall_score}`}
              >
                {ind.overall_score}
              </span>
              <span
                className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
                style={{ backgroundColor: soColor, color: textColorFor(soColor) }}
                title={`${soLevels[soLevel]?.label ?? soLevel} (aggregated from jobs)`}
              >
                indirect: {soLevel}
              </span>
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
