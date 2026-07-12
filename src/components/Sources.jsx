export default function Sources({ sources }) {
  if (!sources?.groups?.length) return null
  const byGroup = (g) =>
    Object.entries(sources.sources)
      .filter(([, s]) => s.group === g)
      .map(([id, s]) => ({ id, ...s }))

  return (
    <section id="sources" className="mt-16 scroll-mt-4">
      <h2 className="font-serif text-2xl font-bold">Sources</h2>
      <div className="mt-5 space-y-8">
        {sources.groups.map((g) => (
          <div key={g}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {g}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {byGroup(g).map((s) => (
                <article
                  key={s.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
                >
                  <h4 className="text-sm font-bold leading-snug">
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {s.title} ↗
                      </a>
                    ) : (
                      s.title
                    )}
                  </h4>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {[s.publisher, s.year].filter(Boolean).join(' · ')} ·{' '}
                    <code className="text-[10px]">{s.id}</code>
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-400">{s.summary}</p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
