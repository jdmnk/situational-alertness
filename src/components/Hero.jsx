export default function Hero({ meta, industries }) {
  const jobCount = industries.reduce((n, i) => n + i.jobs.length, 0)
  return (
    <header className="mx-auto max-w-6xl px-4 pb-8 pt-12 sm:px-6 sm:pt-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
        {jobCount} jobs · {industries.length} industries · updated {meta.updated} · v{meta.version}
      </p>
      <h1 className="mt-3 max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-5xl">
        {meta.title}
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-neutral-700">
        A top-down map of how AI is reshaping work: the economy, its industries, and specific
        jobs — each colored by one of <strong>five fates</strong>: displaced, transformed,
        second-order pressured, insulated, or growing. AI impact is not a binary
        &ldquo;replaced or safe.&rdquo; Different mechanisms hit different jobs on different
        timelines — and some of the biggest risks are demand-side: not your job being
        automated, but your <em>customers&rsquo;</em> income being automated away.
      </p>
    </header>
  )
}
