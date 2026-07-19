import { useMemo, useState } from 'react'
import { categoryForScore, textColorFor } from '../lib/data'

// The Living Tree. Above the ground line: the canopy — boughs are industries
// (thickness ∝ jobs mapped), and the open bough carries its jobs as readable
// leaf cards colored by automation fate. Below the ground line: the roots —
// the five second-order channels, thickness ∝ jobs they reach. Hovering a
// leaf lights the roots that feed on it; hovering a root dims every leaf it
// doesn't touch. One bough open at a time.

const W = 1200
const GROUND = 468
const TRUNK_TOP = GROUND - 112
const TX = 600
const ROOT_Y = GROUND + 96
const H = GROUND + 172

// Collapsed canopy: three arcs of labeled boughs.
const ARC_ROWS = [
  { y: 64, n: 7 },
  { y: 168, n: 6 },
  { y: 268, n: 6 },
]
// When a bough is open, the others gather into two low compact rows.
const COMPACT_ROWS = [
  { y: 356, n: 9 },
  { y: 402, n: 9 },
]
const ROOT_XS = [178, 388, 600, 812, 1022]

const spread = (n, i, pad = 96) => pad + ((W - 2 * pad) * (n === 1 ? 0.5 : i / (n - 1)))

function boughPath(x, y, width) {
  // an organic curve from the trunk crown to (x, y)
  const cx1 = TX + (x - TX) * 0.15
  const cy1 = TRUNK_TOP - 30
  const cx2 = x - (x - TX) * 0.25
  const cy2 = y + 55
  return { d: `M${TX},${TRUNK_TOP} C ${cx1},${cy1} ${cx2},${cy2} ${x},${y}`, width }
}

export default function LivingTree({
  industries,
  meta,
  focusId,
  selectedJobId,
  isMatch,
  q,
  onFocus,
  onSelectJob,
}) {
  const categories = meta.scoring.categories
  const channels = meta.second_order_channels || {}
  const chanKeys = Object.keys(channels)
  const [hoverChans, setHoverChans] = useState(null) // channels lit by a hovered leaf
  const [hoverRoot, setHoverRoot] = useState(null) // channel key hovered underground

  const chanCounts = useMemo(() => {
    const c = {}
    industries.forEach((ind) =>
      ind.jobs.forEach((j) => (j.second_order_channels || []).forEach((x) => (c[x] = (c[x] || 0) + 1))),
    )
    return c
  }, [industries])

  const open = focusId ? industries.find((i) => i.id === focusId) : null
  const others = open ? industries.filter((i) => i.id !== focusId) : industries

  // positions for the not-open boughs; zigzag within each row so wide labels
  // never collide with their neighbors
  const positions = []
  const rows = open ? COMPACT_ROWS : ARC_ROWS
  let k = 0
  rows.forEach((row) => {
    for (let i = 0; i < row.n && k < others.length; i++, k++) {
      positions.push({ ind: others[k], x: spread(row.n, i), y: row.y + (i % 2) * (open ? 0 : 30) })
    }
  })

  const shortName = (ind) => ind.name.split(' (')[0].split(',')[0].split(' & ')[0]

  // leaf card grid for the open bough
  const CARD_W = 272
  const CARD_H = 46
  const openJobs = open ? [...open.jobs].sort((a, b) => b.score - a.score) : []
  const gridCols = [TX - CARD_W - 12, TX + 12]
  const gridTop = 34
  const boughNode = { x: TX, y: gridTop + Math.ceil(openJobs.length / 2) * (CARD_H + 8) + 16 }

  const selJob = selectedJobId
    ? industries.flatMap((i) => i.jobs).find((j) => j.id === selectedJobId)
    : null
  const litChans = hoverChans ?? (selJob ? selJob.second_order_channels || [] : [])

  const indFate = (ind) => categoryForScore(ind.overall_score, categories)

  const searching = q.trim().length > 0

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="tree" aria-label="The living tree: industries as boughs, jobs as leaves, second-order channels as roots">
      {/* ambient captions */}
      <text x={30} y={24} className="tree-caption">CANOPY — DIRECT AUTOMATION</text>
      <text x={30} y={GROUND + 40} className="tree-caption">ROOTS — THE SECOND WAVE</text>
      <text x={W - 30} y={24} textAnchor="end" className="tree-hint">
        {open ? 'hover a leaf — its roots light up · hover a root — see what it feeds on' : 'click a branch to open its jobs'}
      </text>

      {/* ground */}
      <line x1={26} y1={GROUND} x2={W - 26} y2={GROUND} stroke="#3a3a44" strokeWidth={2} />
      {Array.from({ length: 70 }, (_, i) => (
        <circle key={i} cx={30 + ((i * 977) % 1140)} cy={GROUND + 5 + ((i * 367) % 26)} r={1.1} fill="#26262e" />
      ))}

      {/* trunk */}
      <path
        d={`M${TX - 17},${GROUND} C ${TX - 13},${GROUND - 55} ${TX - 8},${GROUND - 82} ${TX - 6},${TRUNK_TOP}
            L${TX + 6},${TRUNK_TOP} C ${TX + 8},${GROUND - 82} ${TX + 13},${GROUND - 55} ${TX + 17},${GROUND} Z`}
        fill="#4a4038"
      />

      {/* roots */}
      {chanKeys.map((c, i) => {
        const x = ROOT_XS[i % ROOT_XS.length]
        const n = chanCounts[c] || 0
        const lit = litChans.includes(c)
        const dimmed = litChans.length > 0 && !lit
        const label = `${channels[c].label} · ${n}`
        const wpx = label.length * 6.6 + 20
        return (
          <g
            key={c}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHoverRoot(c)}
            onMouseLeave={() => setHoverRoot(null)}
          >
            <path
              d={`M${TX},${GROUND + 2} C ${TX},${GROUND + 42} ${x},${GROUND + 26} ${x},${ROOT_Y - 12}`}
              fill="none"
              stroke={lit ? '#e6b33d' : '#57493d'}
              strokeWidth={3 + n * 0.3}
              strokeLinecap="round"
              opacity={lit ? 1 : dimmed ? 0.3 : 0.6}
              style={{ transition: 'stroke .25s, opacity .25s' }}
            />
            <rect x={x - wpx / 2} y={ROOT_Y - 6} width={wpx} height={24} rx={12}
              fill="#1d1d24" stroke={lit || hoverRoot === c ? '#e6b33d' : '#2a2a33'} />
            <text x={x} y={ROOT_Y + 10} textAnchor="middle" fontSize={11.5}
              fill={lit || hoverRoot === c ? '#e6b33d' : '#9a978f'}>
              {label}
            </text>
            <title>{channels[c].description}</title>
          </g>
        )
      })}

      {/* canopy (re-keyed per state so it fades in on change) */}
      <g key={focusId || 'all'} className="canopy-enter">
        {/* the open bough's branch, drawn first so compact labels sit above it */}
        {open && (
          <>
            <path d={boughPath(boughNode.x, boughNode.y, 0).d} fill="none" stroke="#4a4038"
              strokeWidth={5 + open.jobs.length * 0.5} strokeLinecap="round" pointerEvents="none" />
            <circle cx={boughNode.x} cy={boughNode.y} r={5.5} fill="#6b5d4f" pointerEvents="none" />
          </>
        )}

        {/* closed boughs */}
        {positions.map(({ ind, x, y }) => {
          const fate = indFate(ind)
          const color = categories[fate].color
          const matches = searching ? ind.jobs.filter(isMatch).length : ind.jobs.length
          const dim = searching && matches === 0
          const bp = boughPath(x, y + 14, open ? 2 : 2.5 + ind.jobs.length * 0.55)
          const name = shortName(ind)
          return (
            <g key={ind.id} style={{ opacity: dim ? 0.3 : 1, transition: 'opacity .25s' }}>
              <path d={bp.d} fill="none" stroke="#4a4038" strokeWidth={bp.width}
                strokeLinecap="round" opacity={open ? 0.5 : 1} pointerEvents="none" />
              <circle cx={x} cy={y + 14} r={open ? 3 : 4.5} fill="#6b5d4f" pointerEvents="none" />
              {/* the label itself is the button — branch paths never steal clicks */}
              <g
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                onClick={() => onFocus(ind.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onFocus(ind.id)}
                aria-label={`Open ${ind.name}, overall score ${ind.overall_score}, ${ind.jobs.length} jobs`}
              >
                <rect x={x - 72} y={y - (open ? 20 : 26)} width={144} height={open ? 24 : 40}
                  fill="transparent" />
                <text x={x} y={y - (open ? 6 : 10)} textAnchor="middle" fontSize={open ? 10.5 : 12.5}
                  fontWeight={700} fill={dim ? '#6d6b64' : '#e8e6e1'} pointerEvents="none">
                  {name} <tspan fill={color} fontWeight={800}>{ind.overall_score}</tspan>
                </text>
                {!open && (
                  <text x={x} y={y + 4} textAnchor="middle" fontSize={9.5} fill="#6d6b64"
                    fontFamily="ui-monospace, Menlo, monospace" pointerEvents="none">
                    {searching ? `${matches}/${ind.jobs.length} match` : `${ind.jobs.length} jobs`}
                  </text>
                )}
                <title>{ind.summary}</title>
              </g>
            </g>
          )
        })}

        {/* the open bough's label and its leaves */}
        {open && (
          <>
            <text
              x={TX} y={boughNode.y + 26} textAnchor="middle" fontSize={13.5} fontWeight={700}
              fill="#e8e6e1" style={{ cursor: 'pointer' }} role="button" tabIndex={0}
              onClick={() => onFocus(null)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onFocus(null)}
              aria-label={`Close ${open.name}`}
            >
              {open.name.split(' (')[0]}{' '}
              <tspan fill={categories[indFate(open)].color} fontWeight={800}>{open.overall_score}</tspan>
              <tspan fill="#6d6b64" fontSize={10.5}> · close ✕</tspan>
            </text>

            {openJobs.map((job, idx) => {
              const col = idx % 2
              const row = Math.floor(idx / 2)
              const cx = gridCols[col]
              const cy = gridTop + row * (CARD_H + 8)
              const color = categories[job.category].color
              const fg = textColorFor(color)
              const match = isMatch(job)
              const selected = selectedJobId === job.id
              const rootTouched = hoverRoot && !(job.second_order_channels || []).includes(hoverRoot)
              const chans = job.second_order_channels || []
              const sub = chans.length
                ? chans.map((c) => channels[c]?.label.toLowerCase() ?? c).join(' · ')
                : `indirect: ${job.second_order_risk}`
              // stem: from bough node to the card's inner edge
              const sx = col === 0 ? cx + CARD_W : cx
              return (
                <g
                  key={job.id}
                  style={{
                    opacity: !match || rootTouched ? 0.22 : 1,
                    transition: 'opacity .25s',
                  }}
                >
                  <path
                    d={`M${boughNode.x},${boughNode.y} C ${boughNode.x},${cy + CARD_H / 2} ${(sx + boughNode.x) / 2},${cy + CARD_H / 2} ${sx},${cy + CARD_H / 2}`}
                    fill="none" stroke="#4a4038" strokeWidth={1.8} pointerEvents="none"
                  />
                  <g
                    role="button"
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectJob(job.id, open.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectJob(job.id, open.id)}
                    onMouseEnter={() => setHoverChans(chans)}
                    onMouseLeave={() => setHoverChans(null)}
                    onFocus={() => setHoverChans(chans)}
                    onBlur={() => setHoverChans(null)}
                    aria-label={`${job.name}, score ${job.score}, ${categories[job.category].label}. Click for details.`}
                  >
                  <rect
                    x={cx} y={cy} width={CARD_W} height={CARD_H} rx={9} fill={color}
                    stroke={selected ? '#f4f2ee' : job.confidence === 'low' ? (fg === '#ffffff' ? 'rgba(255,255,255,.65)' : 'rgba(0,0,0,.4)') : 'none'}
                    strokeWidth={selected ? 2.5 : 2}
                    strokeDasharray={!selected && job.confidence === 'low' ? '3 4' : undefined}
                  />
                  <text x={cx + 11} y={cy + 19} fontSize={12} fontWeight={700} fill={fg}>
                    {job.name.length > 36 ? job.name.slice(0, 35) + '…' : job.name}
                  </text>
                  <text x={cx + 11} y={cy + 35} fontSize={9.5} fill={fg} opacity={0.82}>
                    {job.score} · {sub.length > 44 ? sub.slice(0, 43) + '…' : sub}
                  </text>
                  <title>{job.note}</title>
                  </g>
                </g>
              )
            })}
          </>
        )}
      </g>
    </svg>
  )
}
