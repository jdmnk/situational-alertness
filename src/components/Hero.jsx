export default function Hero({ meta, industries }) {
  const jobCount = industries.reduce((n, i) => n + i.jobs.length, 0)
  return (
    <header className="mx-auto max-w-6xl px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-100 sm:text-4xl">
        {meta.title}{' '}
        <a
          href="https://github.com/jdmnk/situational-readiness"
          target="_blank"
          rel="noopener noreferrer"
          className="align-middle text-sm font-normal text-neutral-500 underline underline-offset-2 hover:text-neutral-300"
        >
          GitHub
        </a>
      </h1>

      <p className="mt-5 max-w-4xl text-[15px] leading-relaxed text-neutral-400">
        An editorial map of <strong className="text-neutral-200">{jobCount} occupations</strong>{' '}
        across <strong className="text-neutral-200">{industries.length} industries</strong>,
        scored for how AI reshapes them — drawn as a tree.{' '}
        <strong className="text-neutral-200">Boughs</strong> are industries; open one and its
        jobs unfold as <strong className="text-neutral-200">leaves</strong>, colored by fate
        (displaced / transformed / pressured / insulated / growing). Below the ground line, the{' '}
        <strong className="text-neutral-200">roots</strong> are the second wave — the channels
        that hit jobs automation can&rsquo;t touch: customers losing income, displaced workers
        flooding in, tax-base erosion, emptying offices. Hover a leaf and its roots light up.
        Click any leaf for the reasoning, mechanisms, and sources.
      </p>

      <p className="mt-4 max-w-4xl text-[15px] leading-relaxed text-neutral-400">
        <strong className="text-neutral-200">Caveat:</strong> these are editorial estimates
        synthesized from cited research plus a mechanism framework — not measurements, not
        predictions, not career advice. Exposure ≠ displacement: a high score means the
        work changes, not necessarily that the jobs vanish, and serious institutions disagree
        by 20x on magnitude. See{' '}
        <a href="#methodology" className="text-neutral-300 underline underline-offset-2">
          methodology
        </a>{' '}
        for how scores were made and where they&rsquo;re weakest.
      </p>

      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-neutral-600">
        {jobCount} jobs · {industries.length} industries · updated {meta.updated} · v
        {meta.version}
      </p>
    </header>
  )
}
