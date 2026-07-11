import { categoryForScore, textColorFor } from '../lib/data'

// The "economy at a glance" strip: one segment per industry, colored by the
// industry's overall fate, width leaning toward industries with more jobs
// mapped (flex-grow). Segments keep their full label and wrap onto more rows
// instead of truncating. Clicking a segment opens that industry's section.
export default function EconomyStrip({ industries, meta, focusId, onJump }) {
  const categories = meta.scoring.categories

  return (
    <div className="mb-5">
      <div className="flex flex-wrap gap-1">
        {industries.map((ind) => {
          const cat = categoryForScore(ind.overall_score, categories)
          const color = categories[cat].color
          const active = focusId === ind.id
          return (
            <button
              key={ind.id}
              onClick={() => onJump(active ? null : ind.id)}
              className="rounded-md px-3 py-2 text-left transition hover:brightness-110"
              style={{
                flexGrow: ind.jobs.length,
                backgroundColor: color,
                color: textColorFor(color),
                boxShadow: active ? '0 0 0 2px var(--paper), 0 0 0 4px #1c1b19' : undefined,
              }}
              aria-pressed={active}
              aria-label={`${active ? 'Close' : 'Open'} ${ind.name}, overall score ${ind.overall_score}, ${ind.jobs.length} jobs`}
              title={`${ind.name} — overall score ${ind.overall_score}, ${ind.jobs.length} jobs`}
            >
              <span className="whitespace-nowrap text-xs font-bold">{ind.name}</span>
              <span className="ml-1.5 text-[11px] opacity-80">{ind.overall_score}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-1.5 text-xs text-neutral-400">
        The economy at a glance — color = the industry&rsquo;s overall fate, wider segments
        carry more of the mapped jobs. Click one to open it below.
      </p>
    </div>
  )
}
