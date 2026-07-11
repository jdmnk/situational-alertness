import { categoryForScore, textColorFor } from '../lib/data'

// The "economy at a glance" bar: one segment per industry, width proportional
// to the number of jobs mapped, colored by the industry's overall fate.
// Clicking a segment scrolls to that industry's section.
export default function EconomyStrip({ industries, meta, onJump }) {
  const categories = meta.scoring.categories
  const total = industries.reduce((n, i) => n + i.jobs.length, 0)

  return (
    <div className="mb-5">
      <div className="flex h-12 w-full gap-px overflow-hidden rounded-lg">
        {industries.map((ind) => {
          const cat = categoryForScore(ind.overall_score, categories)
          const color = categories[cat].color
          return (
            <button
              key={ind.id}
              onClick={() => onJump(ind.id)}
              className="min-w-0 overflow-hidden px-1.5 text-left transition hover:brightness-110"
              style={{
                width: `${(ind.jobs.length / total) * 100}%`,
                backgroundColor: color,
                color: textColorFor(color),
              }}
              title={`${ind.name} — overall score ${ind.overall_score}, ${ind.jobs.length} jobs. Click to jump.`}
              aria-label={`Jump to ${ind.name}, overall score ${ind.overall_score}`}
            >
              <span className="block truncate text-[11px] font-bold leading-tight">
                {ind.name}
              </span>
              <span className="block text-[10px] opacity-80">{ind.overall_score}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-1.5 text-xs text-neutral-400">
        The economy at a glance — width ∝ jobs mapped, color = the industry&rsquo;s overall
        fate. Click a segment to jump to its jobs.
      </p>
    </div>
  )
}
