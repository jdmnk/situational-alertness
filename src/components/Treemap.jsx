import { useEffect, useMemo, useRef, useState } from 'react'
import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy'
import { textColorFor } from '../lib/data'
import { LAYERS, layerColor } from '../lib/layers'

const HEADER_PX = 19

export default function Treemap({ industries, meta, layer, selectedJobId, isMatch, onSelectJob }) {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(1100)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const height = width < 640 ? 1250 : Math.max(560, Math.round(width * 0.55))

  const root = useMemo(() => {
    const h = hierarchy(
      { children: industries },
      (d) => d.children ?? d.jobs,
    )
      .count()
      .sort((a, b) => b.value - a.value)
    // Within an industry, order jobs worst-first so the reds cluster together.
    h.children?.forEach((ind) =>
      ind.children?.sort((a, b) => b.data.score - a.data.score || b.value - a.value),
    )
    treemap()
      .tile(treemapSquarify)
      .size([width, height])
      .paddingOuter(3)
      .paddingTop(HEADER_PX + 4)
      .paddingInner(2)(h)
    return h
  }, [industries, width, height])

  const layerDef = LAYERS[layer] ?? LAYERS.fate

  return (
    <div ref={containerRef} className="relative w-full select-none" style={{ height }}>
      {/* Industry regions */}
      {root.children?.map((n) => {
        const w = n.x1 - n.x0
        return (
          <div
            key={n.data.id}
            className="absolute rounded-sm border border-neutral-800"
            style={{ left: n.x0, top: n.y0, width: w, height: n.y1 - n.y0 }}
            title={`${n.data.name} — overall automation score ${n.data.overall_score}, ${n.data.jobs.length} jobs`}
          >
            {w > 60 && (
              <div
                className="truncate px-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500"
                style={{ height: HEADER_PX }}
              >
                {n.data.name}
              </div>
            )}
          </div>
        )
      })}

      {/* Job cells */}
      {root.leaves().map((n) => {
        const job = n.data
        const industry = n.parent.data
        const w = n.x1 - n.x0
        const h = n.y1 - n.y0
        const color = layerColor(layer, job, meta)
        const fg = textColorFor(color)
        const match = isMatch(job)
        const selected = selectedJobId === job.id
        const subtitle = layerDef.subtitle(job, meta)
        const levels = layerDef.levels(meta) || {}
        const levelLabel = levels[layerDef.valueOf(job)]?.label ?? layerDef.valueOf(job)
        return (
          <button
            key={job.id}
            className="absolute overflow-hidden rounded-sm text-left transition-[background-color,opacity] duration-300 hover:brightness-110 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            style={{
              left: n.x0,
              top: n.y0,
              width: w,
              height: h,
              backgroundColor: color,
              color: fg,
              opacity: match ? 1 : 0.15,
              outline:
                job.confidence === 'low' && layer !== 'confidence'
                  ? `2px dotted ${fg === '#ffffff' ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.35)'}`
                  : undefined,
              outlineOffset: '-3px',
              boxShadow: selected ? 'inset 0 0 0 2px #101014, inset 0 0 0 4px #fff' : undefined,
              zIndex: selected ? 5 : undefined,
            }}
            onClick={() => onSelectJob(job.id, industry.id)}
            title={`${job.name} — ${levelLabel}. ${job.note}`}
            aria-label={`${job.name}, ${industry.name}. ${levelLabel}. Click for details.`}
          >
            {w > 44 && h > 28 && (
              <span
                className="block overflow-hidden px-1.5 pt-1 text-[11px] font-bold leading-[1.15]"
                style={{ maxHeight: h > 52 ? h - 24 : h - 10 }}
              >
                {job.name}
              </span>
            )}
            {w > 44 && h > 52 && (
              <span className="absolute bottom-1 left-1.5 right-1 block truncate text-[9px] font-medium opacity-75">
                {subtitle}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
