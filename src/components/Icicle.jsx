import { useEffect, useMemo, useRef, useState } from 'react'
import { hierarchy, partition } from 'd3-hierarchy'
import { categoryForScore, textColorFor } from '../lib/data'

const ROW = { rootTop: 0, rootH: 40, indTop: 44, indH: 60, jobTop: 108, jobH: 148 }
const CHART_H = ROW.jobTop + ROW.jobH

const clamp01 = (x) => Math.max(0, Math.min(1, x))

export default function Icicle({
  industries,
  meta,
  focusId,
  selectedJobId,
  isMatch,
  onFocus,
  onSelectJob,
}) {
  const containerRef = useRef(null)
  const [containerW, setContainerW] = useState(900)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => setContainerW(entries[0].contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const categories = meta.scoring.categories

  const root = useMemo(() => {
    const h = hierarchy({ name: 'Economy', children: industries }, (d) =>
      d.children ? d.children : d.jobs,
    ).count()
    partition().size([1, 1])(h)
    return h
  }, [industries])

  const focusNode = useMemo(() => {
    if (!focusId) return root
    return root.children.find((c) => c.data.id === focusId) ?? root
  }, [root, focusId])

  const kx = 1 / (focusNode.x1 - focusNode.x0)
  const place = (n) => {
    const left = clamp01((n.x0 - focusNode.x0) * kx)
    const right = clamp01((n.x1 - focusNode.x0) * kx)
    return { left, width: Math.max(0, right - left) }
  }

  const jobCount = root.value
  const focusedIndustry = focusId ? industries.find((i) => i.id === focusId) : null

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <div className="text-sm text-neutral-600">
          {focusedIndustry ? (
            <>
              <button
                onClick={() => onFocus(null)}
                className="font-semibold text-neutral-900 underline decoration-neutral-400 underline-offset-2 hover:decoration-neutral-900"
              >
                ← All industries
              </button>
              <span className="mx-2 text-neutral-400">/</span>
              <span className="font-semibold">{focusedIndustry.name}</span>
            </>
          ) : (
            <span>
              Click an industry to zoom in · click a job for details · cell width ∝ number of
              jobs mapped
            </span>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative select-none"
        style={{ height: CHART_H }}
        role="tree"
        aria-label="AI economic impact map: industries and jobs"
      >
        {/* Root */}
        <button
          className="cell-transition absolute flex items-center justify-center rounded-sm bg-neutral-800 text-xs font-semibold text-white hover:bg-neutral-700"
          style={{ left: 0, width: '100%', top: ROW.rootTop, height: ROW.rootH }}
          onClick={() => onFocus(null)}
          title="Economy — click to zoom out"
        >
          Economy · {jobCount} jobs across {industries.length} industries
        </button>

        {/* Industries */}
        {root.children.map((n) => {
          const ind = n.data
          const { left, width } = place(n)
          const pxW = width * containerW
          const cat = categoryForScore(ind.overall_score, categories)
          const color = categories[cat].color
          const fg = textColorFor(color)
          const visible = width > 0.0005
          return (
            <button
              key={ind.id}
              className="cell-transition absolute overflow-hidden rounded-sm text-left hover:brightness-110 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-neutral-900"
              style={{
                left: `calc(${left * 100}% + 1px)`,
                width: `calc(${width * 100}% - 2px)`,
                top: ROW.indTop,
                height: ROW.indH,
                backgroundColor: color,
                color: fg,
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? 'auto' : 'none',
              }}
              tabIndex={visible ? 0 : -1}
              onClick={() => onFocus(focusId === ind.id ? null : ind.id)}
              title={`${ind.name} — overall score ${ind.overall_score}. ${ind.summary || ''}`}
              aria-label={`${ind.name}, overall score ${ind.overall_score}, ${ind.jobs.length} jobs. ${
                focusId === ind.id ? 'Click to zoom out.' : 'Click to zoom in.'
              }`}
            >
              {pxW > 56 && (
                <span className="block truncate px-2 pt-1.5 text-xs font-bold leading-tight">
                  {ind.name}
                </span>
              )}
              {pxW > 56 && (
                <span className="block px-2 text-[10px] opacity-80">{ind.overall_score}</span>
              )}
            </button>
          )
        })}

        {/* Jobs */}
        {root.children.flatMap((indNode) =>
          (indNode.children || []).map((n) => {
            const job = n.data
            const ind = indNode.data
            const { left, width } = place(n)
            const pxW = width * containerW
            const color = categories[job.category].color
            const fg = textColorFor(color)
            const visible = width > 0.0005
            const match = isMatch(job)
            const selected = selectedJobId === job.id
            const stripes =
              job.second_order_risk === 'high'
                ? fg === '#ffffff'
                  ? 'stripes-light'
                  : 'stripes-dark'
                : ''
            return (
              <button
                key={job.id}
                className={`cell-transition absolute overflow-hidden rounded-sm text-left hover:brightness-110 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-neutral-900 ${stripes}`}
                style={{
                  left: `calc(${left * 100}% + 1px)`,
                  width: `calc(${width * 100}% - 2px)`,
                  top: ROW.jobTop,
                  height: ROW.jobH,
                  backgroundColor: color,
                  color: fg,
                  opacity: visible ? (match ? 1 : 0.15) : 0,
                  pointerEvents: visible ? 'auto' : 'none',
                  outline:
                    job.confidence === 'low'
                      ? `2px dotted ${fg === '#ffffff' ? 'rgba(255,255,255,.75)' : 'rgba(0,0,0,.4)'}`
                      : undefined,
                  outlineOffset: job.confidence === 'low' ? '-4px' : undefined,
                  boxShadow: selected ? 'inset 0 0 0 3px #1c1b19, inset 0 0 0 5px #fff' : undefined,
                  zIndex: selected ? 5 : undefined,
                }}
                tabIndex={visible ? 0 : -1}
                onClick={() => onSelectJob(job.id, ind.id)}
                title={`${job.name} — ${job.score} (${categories[job.category].label})${
                  job.second_order_risk === 'high' ? ' · high demand-side risk' : ''
                }`}
                aria-label={`${job.name}, score ${job.score}, ${categories[job.category].label}, timeline ${job.timeline}. Click for details.`}
              >
                {pxW > 64 && (
                  <span className="block px-2 pt-2 text-xs font-bold leading-tight">
                    {job.name}
                    {job.second_order_risk === 'high' && <span title="High demand-side risk"> ⚠</span>}
                  </span>
                )}
                {pxW > 64 && (
                  <span className="block px-2 pt-0.5 text-[10px] opacity-80">{job.score}</span>
                )}
              </button>
            )
          }),
        )}
      </div>
    </div>
  )
}
