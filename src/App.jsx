import { useCallback, useEffect, useMemo, useState } from 'react'
import { track } from './lib/analytics'
import { findJob, validateData } from './lib/data'
import { DEFAULT_STATE, parseHash, serializeHash } from './lib/urlState'
import Hero from './components/Hero'
import Controls from './components/Controls'
import EconomyStrip from './components/EconomyStrip'
import Board from './components/Board'
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
  const chanActive = useCallback(
    (c) => !view.chans || view.chans.includes(c),
    [view.chans],
  )
  const isMatch = useCallback(
    (job) => {
      // Fate categories filter only in the fate lens; channels only in the SO lens.
      if (view.lens === 'so') {
        if (view.chans && !(job.second_order_channels || []).some((c) => view.chans.includes(c)))
          return false
      } else if (!catActive(job.category)) {
        return false
      }
      return (
        timeActive(job.timeline) &&
        (!view.q || job.name.toLowerCase().includes(view.q.toLowerCase()))
      )
    },
    [catActive, timeActive, view.q, view.lens, view.chans],
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
    (jobId, industryId) => {
      if (jobId) track('job_selected', { job: jobId, industry: industryId })
      setView((v) => ({
        ...v,
        job: jobId,
        industry: jobId ? (industryId ?? v.industry) : v.industry,
      }))
    },
    [],
  )

  const focusIndustry = useCallback(
    (id) => {
      if (id) track('industry_zoomed', { industry: id })
      update({ industry: id })
    },
    [update],
  )

  const allChanKeys = useMemo(
    () => Object.keys(data?.meta.second_order_channels || {}),
    [data],
  )
  const toggleChan = useCallback(
    (c) => {
      setView((v) => {
        const active = new Set(v.chans ?? allChanKeys)
        active.has(c) ? active.delete(c) : active.add(c)
        const arr = allChanKeys.filter((k) => active.has(k))
        return { ...v, chans: arr.length === allChanKeys.length ? null : arr }
      })
    },
    [allChanKeys],
  )

  const setLens = useCallback(
    (patch) => {
      if (patch.lens && patch.lens !== view.lens) track('lens_changed', { lens: patch.lens })
      update(patch)
    },
    [update, view.lens],
  )

  // Close the detail panel with Escape.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && selectJob(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectJob])

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
          <div className="sticky top-0 z-30 -mx-4 mb-4 border-b border-neutral-200/70 bg-[#f7f6f3]/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <Controls
              meta={data.meta}
              categories={categories}
              view={view}
              catActive={catActive}
              timeActive={timeActive}
              chanActive={chanActive}
              onToggleCat={toggleCat}
              onToggleChan={toggleChan}
              onUpdate={setLens}
            />
          </div>
          {!isMobile && (
            <EconomyStrip
              industries={sortedIndustries}
              meta={data.meta}
              lens={view.lens}
              focusId={view.industry}
              onJump={focusIndustry}
            />
          )}
          <Board
            industries={sortedIndustries}
            meta={data.meta}
            lens={view.lens}
            isMatch={isMatch}
            selectedJobId={view.job}
            focusId={view.industry}
            onSelectJob={selectJob}
            onFocus={focusIndustry}
            revealMatches={view.q.trim().length > 0}
          />
        </section>

        <SecondWave
          meta={data.meta}
          industries={data.industries}
          onOpenLens={() => {
            setLens({ lens: 'so' })
            document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })
          }}
        />
        <HowToRead categories={categories} rangeNote={data.meta.scoring.range_note} />
        <Methodology />
        <Sources sources={sources} />
      </main>

      <Footer meta={data.meta} />

      {selected && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/25"
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
