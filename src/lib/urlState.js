// Shareable view state lives in the URL hash:
//   #i=<focused industry>&j=<selected job>&c=cat1,cat2&t=now,1-3y&s=alpha&q=text
// Fields are omitted when they hold their default value.

export const DEFAULT_STATE = {
  industry: null, // focused industry id (open accordion section)
  job: null, // selected job id (detail panel)
  cats: null, // null = all categories active, else array of active keys
  times: null, // null = all timelines active
  sort: 'score', // 'score' (worst-hit first) | 'alpha'
  q: '', // job-name search
  lens: 'fate', // 'fate' (automation fate) | 'so' (second-order exposure)
  chans: null, // null = all second-order channels, else array of active keys
}

export function parseHash(hash) {
  const p = new URLSearchParams((hash || '').replace(/^#/, ''))
  return {
    industry: p.get('i') || null,
    job: p.get('j') || null,
    cats: p.get('c') ? p.get('c').split(',').filter(Boolean) : null,
    times: p.get('t') ? p.get('t').split(',').filter(Boolean) : null,
    sort: p.get('s') === 'alpha' ? 'alpha' : 'score',
    q: p.get('q') || '',
    lens: p.get('l') === 'so' ? 'so' : 'fate',
    chans: p.get('x') ? p.get('x').split(',').filter(Boolean) : null,
  }
}

export function serializeHash(state) {
  // Built by hand so ids/category keys (safe tokens) stay readable in the URL.
  const parts = []
  if (state.industry) parts.push('i=' + encodeURIComponent(state.industry))
  if (state.job) parts.push('j=' + encodeURIComponent(state.job))
  if (state.cats) parts.push('c=' + state.cats.map(encodeURIComponent).join(','))
  if (state.times) parts.push('t=' + state.times.map(encodeURIComponent).join(','))
  if (state.sort !== 'score') parts.push('s=' + state.sort)
  if (state.q) parts.push('q=' + encodeURIComponent(state.q))
  if (state.lens !== 'fate') parts.push('l=' + state.lens)
  if (state.chans) parts.push('x=' + state.chans.map(encodeURIComponent).join(','))
  return parts.join('&')
}
