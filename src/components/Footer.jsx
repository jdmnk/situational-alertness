export default function Footer({ meta }) {
  return (
    <footer className="mt-20 border-t border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-500 sm:px-6">
        <p>
          These are <strong>editorial estimates</strong>, not career advice and not predictions.
          They will be wrong in places; the point is the mechanisms, not the decimals.
        </p>
        <p className="mt-3">
          v{meta.version} · updated {meta.updated} ·{' '}
          <a href="data.json" className="underline underline-offset-2 hover:text-neutral-800">
            download the data (JSON)
          </a>{' '}
          ·{' '}
          <a
            href="sources.json"
            className="underline underline-offset-2 hover:text-neutral-800"
          >
            sources (JSON)
          </a>{' '}
          ·{' '}
          <a
            href="https://github.com/jdmnk/situational-alertness"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-neutral-800"
          >
            source on GitHub
          </a>
        </p>
        <p className="mt-3 text-xs text-neutral-400">
          Anonymous visit counts via PostHog EU — cookieless, no cross-site tracking, no
          personal data stored.
        </p>
      </div>
    </footer>
  )
}
