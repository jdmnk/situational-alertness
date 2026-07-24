import { categoryForScore } from '../lib/data'

// The Report Card: one small chart per industry, one line per job. The name
// column shows the curated short display name (`short` in data.json); the
// full name lives in the tooltip and the detail drawer. Automation risk is a
// fate-colored 0-100 bar; the second wave is a level bar with its channels
// written out. Rows without a material channel show an empty bar and an em
// dash. Industries sorted worst-hit first, jobs worst-first.

const LVL = { low: 0.18, medium: 0.55, high: 0.92 }

const shortInd = (s) => s.split(' (')[0].split(',')[0]

function Row({ job, industry, meta, match, selected, onSelect }) {
  const categories = meta.scoring.categories
  const soLevels = meta.scoring.second_order_levels || {}
  const channels = meta.second_order_channels || {}
  const chans = job.second_order_channels || []
  const waveWords = chans.length
    ? chans.map((c) => channels[c]?.label.toLowerCase() ?? c).join(' · ')
    : '—'
  const secondWaveDescription = chans.length
    ? `second wave ${job.second_order_risk} via ${waveWords}`
    : 'no material second-wave channel identified'
  const title =
    `${job.name} — automation ${job.score} (${categories[job.category].label}), ` +
    secondWaveDescription +
    (job.confidence === 'low' ? ' · low-confidence score' : '') +
    `. ${job.note}`
  return (
    <button
      className={`rc-row rc-cols ${match ? '' : 'rc-dim'}`}
      onClick={() => onSelect(job.id, industry.id)}
      title={title}
      aria-label={title}
      style={selected ? { background: '#2b2b36' } : undefined}
    >
      <span className={`rc-name ${job.confidence === 'low' ? 'rc-lowconf' : ''}`}>
        {job.short ?? job.name}
      </span>
      <span className="rc-num">{job.score}</span>
      <span className="rc-track">
        <span
          className="rc-fill"
          style={{ width: `${job.score}%`, backgroundColor: categories[job.category].color }}
        />
      </span>
      <span className="rc-track">
        <span
          className="rc-fill"
          style={{
            width: chans.length ? `${LVL[job.second_order_risk] * 100}%` : 0,
            backgroundColor: soLevels[job.second_order_risk]?.color ?? '#999',
          }}
        />
      </span>
      <span className={`rc-chn ${chans.length ? '' : 'rc-quiet'}`}>{waveWords}</span>
    </button>
  )
}

export default function ReportCard({ industries, meta, isMatch, selectedJobId, onSelectJob }) {
  const categories = meta.scoring.categories
  const sorted = [...industries].sort((a, b) => b.overall_score - a.overall_score)
  return (
    <div className="rc-grid">
      {sorted.map((ind) => {
        const jobs = [...ind.jobs].sort((a, b) => b.score - a.score)
        const matches = ind.jobs.filter(isMatch).length
        const osColor = categories[categoryForScore(ind.overall_score, categories)].color
        return (
          <section
            key={ind.id}
            className={`rc-panel ${matches === 0 ? 'rc-dim' : ''}`}
            aria-label={`${ind.name}, overall score ${ind.overall_score}`}
          >
            <h3 title={ind.summary}>
              {shortInd(ind.name)}
              <span className="rc-os" style={{ color: osColor }}>
                {ind.overall_score}
              </span>
            </h3>
            <div className="rc-cols rc-colhead" aria-hidden>
              <span>job</span>
              <span className="h-auto">automation risk</span>
              <span className="h-wave">second wave</span>
            </div>
            {jobs.map((job) => (
              <Row
                key={job.id}
                job={job}
                industry={ind}
                meta={meta}
                match={isMatch(job)}
                selected={selectedJobId === job.id}
                onSelect={onSelectJob}
              />
            ))}
          </section>
        )
      })}
    </div>
  )
}
