import { categoryForScore } from '../lib/data'

// The Report Card: one small butterfly chart per industry. Job names down the
// middle; automation risk grows left (fate-colored, 0-100), the second wave
// grows right (low/medium/high, colored by level) with its channels written
// out. Industries sorted worst-hit first, jobs worst-first within each.
// On narrow screens each row stacks: name, then the two labeled bars.

const LVL = { low: 0.18, medium: 0.55, high: 0.92 }

const shortInd = (s) => s.split(' (')[0].split(',')[0]

function Row({ job, industry, meta, match, selected, onSelect }) {
  const categories = meta.scoring.categories
  const soLevels = meta.scoring.second_order_levels || {}
  const channels = meta.second_order_channels || {}
  const chans = job.second_order_channels || []
  const waveWords = chans.length
    ? chans.map((c) => channels[c]?.label.toLowerCase() ?? c).join(' · ')
    : job.second_order_risk === 'low'
      ? 'quiet'
      : job.second_order_risk
  const title =
    `${job.name} — automation ${job.score} (${categories[job.category].label}), ` +
    `second wave ${job.second_order_risk}` +
    (chans.length ? ` via ${waveWords}` : '') +
    (job.confidence === 'low' ? ' · low-confidence score' : '') +
    `. ${job.note}`
  return (
    <button
      className={`rc-row ${match ? '' : 'rc-dim'}`}
      onClick={() => onSelect(job.id, industry.id)}
      title={title}
      aria-label={title}
      style={selected ? { background: '#2b2b36' } : undefined}
    >
      <span className="rc-auto">
        <span className="rc-num">{job.score}</span>
        <span className="rc-mob-label">automation</span>
        <span className="rc-track">
          <span
            className="rc-fill"
            style={{ width: `${job.score}%`, backgroundColor: categories[job.category].color }}
          />
        </span>
      </span>
      <span className={`rc-name ${job.confidence === 'low' ? 'rc-lowconf' : ''}`}>
        {job.name}
      </span>
      <span className="rc-wave">
        <span className="rc-mob-label">second wave</span>
        <span className="rc-track">
          <span
            className="rc-fill"
            style={{
              width: `${LVL[job.second_order_risk] * 100}%`,
              backgroundColor: soLevels[job.second_order_risk]?.color ?? '#999',
            }}
          />
        </span>
        <span className={`rc-chn ${chans.length ? '' : 'rc-quiet'}`}>{waveWords}</span>
      </span>
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
            <div className="rc-colhead" aria-hidden>
              <span className="l">← automation risk</span>
              <span style={{ textAlign: 'center' }}>job</span>
              <span>second wave →</span>
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
