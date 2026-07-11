// Data helpers. All category colors/labels come from meta.scoring.categories
// in data.json — nothing here hardcodes them.

export function validateData(d) {
  if (!d || typeof d !== 'object') return 'data.json did not parse to an object'
  if (!d.meta?.scoring?.categories)
    return 'data.json is missing meta.scoring.categories'
  if (!d.meta?.mechanisms) return 'data.json is missing meta.mechanisms'
  if (!Array.isArray(d.industries) || d.industries.length === 0)
    return 'data.json has no industries array'
  for (const ind of d.industries) {
    if (!ind.id || !ind.name || typeof ind.overall_score !== 'number' || !Array.isArray(ind.jobs))
      return `industry "${ind.id || ind.name || '?'}" is malformed`
    for (const job of ind.jobs) {
      if (!job.id || !job.name || typeof job.score !== 'number' || !job.category)
        return `job "${job.id || job.name || '?'}" in "${ind.id}" is malformed`
      if (!d.meta.scoring.categories[job.category])
        return `job "${job.id}" has unknown category "${job.category}"`
    }
  }
  return null
}

// Industries only carry a numeric overall_score; derive their category from
// the ranges declared in meta.scoring.categories (e.g. "70-100").
export function categoryForScore(score, categories) {
  for (const [key, cat] of Object.entries(categories)) {
    const m = /^(\d+)\s*-\s*(\d+)/.exec(cat.range || '')
    if (m && score >= +m[1] && score <= +m[2]) return key
  }
  const keys = Object.keys(categories)
  return keys[keys.length - 1]
}

export function textColorFor(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '')
  if (!m) return '#fff'
  const n = parseInt(m[1], 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.55 ? '#1c1b19' : '#ffffff'
}

export const TIMELINES = ['now', '1-3y', '3-7y', '7-15y']
export const TIMELINE_LABELS = {
  now: 'Now',
  '1-3y': '1–3 years',
  '3-7y': '3–7 years',
  '7-15y': '7–15 years',
}

export const RISK_LABELS = { low: 'Low', medium: 'Medium', high: 'High' }

export function mechanismLabel(key) {
  return key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

export function findJob(industries, jobId) {
  for (const ind of industries) {
    const job = ind.jobs.find((j) => j.id === jobId)
    if (job) return { job, industry: ind }
  }
  return null
}
