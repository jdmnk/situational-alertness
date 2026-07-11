import { useCallback, useEffect, useMemo, useState } from 'react'
import { findJob, validateData } from './lib/data'
import { DEFAULT_STATE, parseHash, serializeHash } from './lib/urlState'
import Hero from './components/Hero'
import Controls from './components/Controls'
import Icicle from './components/Icicle'
import MobileMap from './components/MobileMap'
import DetailPanel from './components/DetailPanel'
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

  const categories = data?.meta.scoring.categories
  const allCatKeys = useMemo(() => (categories ? Object.keys(categories) : []), [categories])

  const sortedIndustries = useMemo(() => {
    if (!data) return []
    const list = [...data.industries]
    if (view.sort === 'alpha') list.sort((a, b) => a.name.localeCompare(b.name))
    else list.sort((a, b) => b.overall_score - a.overall_score)
    return list
  }, [data, view.sort])

  const catActive = useCallback(
    (c) => !view.cats || view.cats.includes(c),
    [view.cats],
  )
  const timeActive = useCallback(
    (t) => !view.times || view.times.includes(t),
    [view.times],
  )
  const isMatch = useCallback(
    (job) =>
      catActive(job.category) &&
      timeActive(job.timeline) &&
      (!view.q || job.name.toLowerCase().includes(view.q.toLowerCase())),
    [catActive, timeActive, view.q],
  )

  const toggleCat = useCallback(
    (c) => {
      setView((v) => {
        const active = new Set(v.cats ?? allCatKeys)
        active.has(c) ? active.delete(c) : active.add(c)
        const arr = allCatKeys.filter((k) => active.has(k))
        return { ...v, cats: arr.length === allCatKeys.length ? null : arr }
      })
    },
    [allCatKeys],
  )

  const selectJob = useCallback(
    (jobId, industryId) =>
      setView((v) => ({
        ...v,
        job: jobId,
        industry: jobId ? (industryId ?? v.industry) : v.industry,
      })),
    [],
  )

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Something broke loading the map</h1>
        <p className="mt-4 text-neutral-600">{error}</p>
        <p className="mt-2 text-sm text-neutral-500">
          The dataset lives in <code>data.json</code> — if it was just edited, check its shape.
        </p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-neutral-400">
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
          <Controls
            categories={categories}
            view={view}
            catActive={catActive}
            timeActive={timeActive}
            onToggleCat={toggleCat}
            onUpdate={update}
          />
          {isMobile ? (
            <MobileMap
              industries={sortedIndustries}
              meta={data.meta}
              isMatch={isMatch}
              selectedJobId={view.job}
              focusId={view.industry}
              onSelectJob={selectJob}
              onFocus={(id) => update({ industry: id })}
            />
          ) : (
            <div className="grid grid-cols-[1fr_320px] gap-6">
              <Icicle
                industries={sortedIndustries}
                meta={data.meta}
                focusId={view.industry}
                selectedJobId={view.job}
                isMatch={isMatch}
                onFocus={(id) => update({ industry: id })}
                onSelectJob={selectJob}
              />
              <DetailPanel
                selected={selected}
                meta={data.meta}
                sources={sources}
                onClose={() => selectJob(null)}
                variant="side"
              />
            </div>
          )}
        </section>

        <HowToRead categories={categories} />
        <Methodology />
        <Sources sources={sources} />
      </main>

      <Footer meta={data.meta} />

      {isMobile && selected && (
        <DetailPanel
          selected={selected}
          meta={data.meta}
          sources={sources}
          onClose={() => selectJob(null)}
          variant="sheet"
        />
      )}
    </div>
  )
}
