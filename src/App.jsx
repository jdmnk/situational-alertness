import { useCallback, useEffect, useState } from 'react'
import { track } from './lib/analytics'
import { findJob, validateData } from './lib/data'
import { parseHash, serializeHash } from './lib/urlState'
import Hero from './components/Hero'
import Controls from './components/Controls'
import ReportCard from './components/ReportCard'
import DetailPanel from './components/DetailPanel'
import SecondWave from './components/SecondWave'
import HowToRead from './components/HowToRead'
import Methodology from './components/Methodology'
import Sources from './components/Sources'
import Footer from './components/Footer'

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export default function App() {
  const [data, setData] = useState(null)
  const [sources, setSources] = useState(null)
  const [error, setError] = useState(null)
  const [view, setView] = useState(() => parseHash(window.location.hash))
  const isMobile = useMediaQuery('(max-width: 767px)')

  useEffect(() => {
    Promise.all([
      fetch('data.json').then((r) => {
        if (!r.ok) throw new Error(`could not load data.json (HTTP ${r.status})`)
        return r.json()
      }),
      fetch('sources.json')
        .then((r) => (r.ok ? r.json() : { groups: [], sources: {} }))
        .catch(() => ({ groups: [], sources: {} })),
    ])
      .then(([d, s]) => {
        const problem = validateData(d)
        if (problem) throw new Error(`data.json failed validation: ${problem}`)
        setData(d)
        setSources(s)
      })
      .catch((e) => setError(e.message))
  }, [])

  // Keep the hash in sync so any view is shareable.
  useEffect(() => {
    const h = serializeHash(view)
    const target = h ? '#' + h : window.location.pathname + window.location.search
    if (window.location.hash !== (h ? '#' + h : '')) {
      window.history.replaceState(null, '', target)
    }
  }, [view])

  useEffect(() => {
    const onHash = () => setView(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const update = useCallback((patch) => setView((v) => ({ ...v, ...patch })), [])

  const selectJob = useCallback((jobId, industryId) => {
    if (jobId) track('job_selected', { job: jobId, industry: industryId })
    setView((v) => ({ ...v, job: jobId }))
  }, [])

  // Close the detail panel with Escape.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && selectJob(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectJob])

  const isMatch = useCallback(
    (job) => !view.q || job.name.toLowerCase().includes(view.q.toLowerCase()),
    [view.q],
  )

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-neutral-100">Something broke loading the map</h1>
        <p className="mt-4 text-neutral-400">{error}</p>
        <p className="mt-2 text-sm text-neutral-500">
          The dataset lives in <code>data.json</code> — if it was just edited, check its shape.
        </p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-neutral-500">
        Loading the map…
      </div>
    )
  }

  const selected = view.job ? findJob(data.industries, view.job) : null

  return (
    <div className="min-h-screen">
      <Hero meta={data.meta} industries={data.industries} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section id="map" className="scroll-mt-4">
          <div className="sticky top-0 z-30 -mx-4 mb-2 border-b border-neutral-800/80 bg-[#101014]/90 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
            <Controls
              meta={data.meta}
              industries={data.industries}
              view={view}
              onUpdate={update}
            />
          </div>
          <p className="rc-readstrip">
            each row: job · automation risk (0–100, colored by fate) · the second wave (how
            hard it hits indirectly + through what) · industries worst-hit first · full names
            on hover and in the detail panel
          </p>
          <ReportCard
            industries={data.industries}
            meta={data.meta}
            isMatch={isMatch}
            selectedJobId={view.job}
            onSelectJob={selectJob}
          />
        </section>

        <SecondWave meta={data.meta} industries={data.industries} />
        <HowToRead
          categories={data.meta.scoring.categories}
          meta={data.meta}
          rangeNote={data.meta.scoring.range_note}
        />
        <Methodology />
        <Sources sources={sources} />
      </main>

      <Footer meta={data.meta} />

      {selected && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => selectJob(null)}
            aria-hidden
          />
          <DetailPanel
            selected={selected}
            meta={data.meta}
            sources={sources}
            onClose={() => selectJob(null)}
            variant={isMobile ? 'sheet' : 'drawer'}
          />
        </>
      )}
    </div>
  )
}
