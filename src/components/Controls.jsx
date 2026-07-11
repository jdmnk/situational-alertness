import { textColorFor, TIMELINES, TIMELINE_LABELS } from '../lib/data'

export default function Controls({
  meta,
  categories,
  view,
  catActive,
  timeActive,
  chanActive,
  onToggleCat,
  onToggleChan,
  onUpdate,
}) {
  const soLevels = meta.scoring.second_order_levels || {}
  const channels = meta.second_order_channels || {}
  const soLens = view.lens === 'so'

  const toggleTime = (t) => {
    const active = new Set(view.times ?? TIMELINES)
    active.has(t) ? active.delete(t) : active.add(t)
    const arr = TIMELINES.filter((x) => active.has(x))
    onUpdate({ times: arr.length === TIMELINES.length ? null : arr })
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
        {/* Lens switch */}
        <div
          className="flex overflow-hidden rounded-full border border-neutral-300 text-xs font-semibold"
          role="group"
          aria-label="Map lens"
        >
          <button
            onClick={() => onUpdate({ lens: 'fate' })}
            aria-pressed={!soLens}
            className={`px-3 py-1 transition ${!soLens ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-800'}`}
          >
            Automation fate
          </button>
          <button
            onClick={() => onUpdate({ lens: 'so' })}
            aria-pressed={soLens}
            className={`px-3 py-1 transition ${soLens ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-800'}`}
          >
            Second-order lens
          </button>
        </div>

        {soLens ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
            {Object.entries(soLevels).map(([key, lvl]) => (
              <span key={key} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: lvl.color }}
                  aria-hidden
                />
                {key}
              </span>
            ))}
            <span className="text-neutral-400">
              indirect exposure — automation of the job itself is ignored here
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by fate">
            {Object.entries(categories).map(([key, cat]) => {
              const active = catActive(key)
              return (
                <button
                  key={key}
                  onClick={() => onToggleCat(key)}
                  aria-pressed={active}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    active ? '' : 'bg-neutral-200 text-neutral-400 line-through'
                  }`}
                  style={active ? { backgroundColor: cat.color, color: textColorFor(cat.color) } : undefined}
                  title={cat.label}
                >
                  {key}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by timeline">
          {TIMELINES.map((t) => {
            const active = timeActive(t)
            return (
              <button
                key={t}
                onClick={() => toggleTime(t)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? 'border-neutral-800 bg-neutral-800 text-white'
                    : 'border-neutral-300 bg-transparent text-neutral-400 line-through'
                }`}
              >
                {TIMELINE_LABELS[t]}
              </button>
            )
          })}
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
          <label className="flex items-center gap-2 text-xs text-neutral-600">
            Sort
            <select
              value={view.sort}
              onChange={(e) => onUpdate({ sort: e.target.value })}
              className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs"
            >
              <option value="score">Worst-hit first</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </label>
          <input
            type="search"
            value={view.q}
            onChange={(e) => onUpdate({ q: e.target.value })}
            placeholder="Search jobs…"
            aria-label="Search job names"
            className="w-44 rounded-md sm:w-56 border border-neutral-300 bg-white px-2.5 py-1 text-sm placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Channel filter, only meaningful under the second-order lens */}
      {soLens && (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by second-order channel">
          <span className="text-xs text-neutral-400">Channels:</span>
          {Object.entries(channels).map(([key, ch]) => {
            const active = chanActive(key)
            return (
              <button
                key={key}
                onClick={() => onToggleChan(key)}
                aria-pressed={active}
                title={ch.description}
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                  active
                    ? 'border-neutral-800 bg-white text-neutral-800'
                    : 'border-neutral-300 bg-transparent text-neutral-400 line-through'
                }`}
              >
                {ch.glyph} {ch.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
