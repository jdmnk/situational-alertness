import { textColorFor } from '../lib/data'
import { LAYER_KEYS, LAYERS } from '../lib/layers'

export default function LayerBar({ meta, industries, view, onUpdate }) {
  const jobs = industries.flatMap((i) => i.jobs)
  const layerDef = LAYERS[view.layer] ?? LAYERS.fate
  const levels = layerDef.levels(meta) || {}

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
      <div className="flex items-center gap-1.5" role="group" aria-label="Color layer">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
          Layer
        </span>
        {LAYER_KEYS.map((key) => {
          const active = view.layer === key
          return (
            <button
              key={key}
              onClick={() => onUpdate({ layer: key })}
              aria-pressed={active}
              className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                active
                  ? 'border-neutral-400 bg-neutral-200 text-neutral-900'
                  : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200'
              }`}
            >
              {LAYERS[key].label}
            </button>
          )
        })}
      </div>

      {/* Dynamic legend with counts for the active layer */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
        {Object.entries(levels).map(([key, lvl]) => {
          const n = jobs.filter((j) => layerDef.valueOf(j) === key).length
          if (!n) return null
          return (
            <span key={key} className="inline-flex items-center gap-1.5" title={lvl.label}>
              <span
                className="inline-block h-3 w-3 rounded-[3px]"
                style={{ backgroundColor: lvl.color }}
                aria-hidden
              />
              {key} <span className="text-neutral-600">{n}</span>
            </span>
          )
        })}
      </div>

      <div className="flex flex-1 justify-end">
        <input
          type="search"
          value={view.q}
          onChange={(e) => onUpdate({ q: e.target.value })}
          placeholder="Search jobs…"
          aria-label="Search job names"
          className="w-40 rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-sm text-neutral-200 placeholder:text-neutral-500 sm:w-56"
        />
      </div>
    </div>
  )
}
