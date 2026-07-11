import { categoryForScore, industrySoLevel, textColorFor } from '../lib/data'

// The "economy at a glance" strip: one segment per industry. Fill color =
// overall automation fate; the underline = the industry's indirect
// (second-order) exposure, so both dimensions read at a glance. Width leans
// toward industries with more jobs mapped (flex-grow); full labels wrap onto
// more rows instead of truncating. Clicking a segment opens that section.
export default function EconomyStrip({ industries, meta, focusId, onJump }) {
  const categories = meta.scoring.categories
  const soLevels = meta.scoring.second_order_levels || {}

  return (
    <div className="mb-5">
      <div className="flex flex-wrap gap-1">
        {industries.map((ind) => {
          const color = categories[categoryForScore(ind.overall_score, categories)].color
          const soColor = soLevels[industrySoLevel(ind)]?.color ?? '#999'
          const active = focusId === ind.id
          return (
            <button
              key={ind.id}
              onClick={() => onJump(active ? null : ind.id)}
              className="rounded-md px-3 pb-1.5 pt-2 text-left transition hover:brightness-110"
              style={{
                flexGrow: ind.jobs.length,
                backgroundColor: color,
                color: textColorFor(color),
                borderBottom: `4px solid ${soColor}`,
                boxShadow: active ? '0 0 0 2px var(--paper), 0 0 0 4px #1c1b19' : undefined,
              }}
              aria-pressed={active}
              aria-label={`${active ? 'Close' : 'Open'} ${ind.name}, overall score ${ind.overall_score}, ${ind.jobs.length} jobs`}
              title={`${ind.name} — automation ${ind.overall_score}, indirect exposure ${industrySoLevel(ind)}, ${ind.jobs.length} jobs`}
            >
              <span className="whitespace-nowrap text-xs font-bold">{ind.name}</span>
              <span className="ml-1.5 text-[11px] opacity-80">{ind.overall_score}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-1.5 text-xs text-neutral-400">
        The economy at a glance — fill = the industry&rsquo;s automation fate, underline = how
        hard it gets hit <em>indirectly</em> (customers, worker influx, tax base, offices).
        Wider segments carry more of the mapped jobs; click one to open it below.
      </p>
    </div>
  )
}
