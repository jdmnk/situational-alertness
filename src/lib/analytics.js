// PostHog EU, configured cookieless (persistence: 'memory') so no consent
// banner is needed; anonymous events only. The project key is public by
// design (it can only ingest events, not read data).
//
// posthog-js is ~75KB gzipped, so it's dynamically imported to keep it out
// of the main bundle; events fired before it loads are queued.
const KEY = 'phc_v7qk5xmHTBgGMsuhSZYQTMtNY75Ec7zeDk9cyw5kjj9v'
const enabled = KEY.startsWith('phc_') && !KEY.includes('REPLACE')

let client = null
const queue = []

export function initAnalytics() {
  if (!enabled) return
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init(KEY, {
      api_host: 'https://eu.i.posthog.com',
      defaults: '2025-05-24',
      capture_pageview: true, // initial load only — hash changes fire on every filter keystroke
      autocapture: false,
      person_profiles: 'identified_only',
      persistence: 'memory',
    })
    client = posthog
    queue.splice(0).forEach(([event, props]) => client.capture(event, props))
  })
}

export function track(event, props) {
  if (!enabled) return
  if (client) client.capture(event, props)
  else queue.push([event, props])
}
