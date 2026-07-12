// The color layers of the map: each defines how a job cell gets its color,
// its legend, and its cell subtitle. All colors come from data.json meta.

export const LAYERS = {
  fate: {
    label: 'Automation fate',
    levels: (meta) => meta.scoring.categories,
    valueOf: (job) => job.category,
    subtitle: (job) => `${job.score} · ${job.timeline}`,
  },
  indirect: {
    label: 'Second-order exposure',
    levels: (meta) => meta.scoring.second_order_levels,
    valueOf: (job) => job.second_order_risk,
    subtitle: (job, meta) => {
      const chans = job.second_order_channels || []
      if (!chans.length) return `indirect: ${job.second_order_risk}`
      return chans
        .map((c) => meta.second_order_channels?.[c]?.label.toLowerCase() ?? c)
        .join(' · ')
    },
  },
  timeline: {
    label: 'Timeline',
    levels: (meta) => meta.scoring.timeline_levels,
    valueOf: (job) => job.timeline,
    subtitle: (job) => `${job.timeline} · score ${job.score}`,
  },
  confidence: {
    label: 'Confidence',
    levels: (meta) => meta.scoring.confidence_levels,
    valueOf: (job) => job.confidence,
    subtitle: (job) => `${job.confidence} confidence · ${job.score}`,
  },
}

export const LAYER_KEYS = Object.keys(LAYERS)

export function layerColor(layerKey, job, meta) {
  const layer = LAYERS[layerKey] ?? LAYERS.fate
  const levels = layer.levels(meta) || {}
  return levels[layer.valueOf(job)]?.color ?? '#555'
}
