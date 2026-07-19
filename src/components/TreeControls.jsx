import { textColorFor } from '../lib/data'

export default function TreeControls({ meta, industries, view, onUpdate }) {
  const categories = meta.scoring.categories
  const jobs = industries.flatMap((i) => i.jobs)
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
        {Object.entries(categories).map(([key, cat]) => {
          const n = jobs.filter((j) => j.category === key).length
          return (
            <span key={key} className="inline-flex items-center gap-1.5" title={cat.label}>
              <span
                className="inline-block h-3 w-3 rounded-[3px]"
                style={{ backgroundColor: cat.color }}
                aria-hidden
              />
              {key} <span className="text-neutral-600">{n}</span>
            </span>
          )
        })}
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1 w-4 rounded-full bg-[#e6b33d]" aria-hidden />
          lit roots = the second wave
        </span>
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
