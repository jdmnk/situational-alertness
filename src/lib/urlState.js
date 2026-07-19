// Shareable view state lives in the URL hash:
//   #j=<selected job>&q=<search>
// Fields are omitted when they hold their default value.

export const DEFAULT_STATE = {
  job: null, // selected job id (detail panel)
  q: '', // job-name search
}

export function parseHash(hash) {
  const p = new URLSearchParams((hash || '').replace(/^#/, ''))
  return {
    job: p.get('j') || null,
    q: p.get('q') || '',
  }
}

export function serializeHash(state) {
  const parts = []
  if (state.job) parts.push('j=' + encodeURIComponent(state.job))
  if (state.q) parts.push('q=' + encodeURIComponent(state.q))
  return parts.join('&')
}
