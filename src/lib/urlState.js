// Shareable view state lives in the URL hash:
//   #j=<selected job>&l=<color layer>&q=<search>
// Fields are omitted when they hold their default value.

export const DEFAULT_STATE = {
  job: null, // selected job id (detail panel)
  layer: 'fate', // color layer: fate | indirect | timeline | confidence
  q: '', // job-name search
}

const LAYER_KEYS = ['fate', 'indirect', 'timeline', 'confidence']

export function parseHash(hash) {
  const p = new URLSearchParams((hash || '').replace(/^#/, ''))
  return {
    job: p.get('j') || null,
    layer: LAYER_KEYS.includes(p.get('l')) ? p.get('l') : 'fate',
    q: p.get('q') || '',
  }
}

export function serializeHash(state) {
  const parts = []
  if (state.job) parts.push('j=' + encodeURIComponent(state.job))
  if (state.layer !== 'fate') parts.push('l=' + state.layer)
  if (state.q) parts.push('q=' + encodeURIComponent(state.q))
  return parts.join('&')
}
