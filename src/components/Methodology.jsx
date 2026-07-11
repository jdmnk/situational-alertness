export default function Methodology() {
  return (
    <section id="methodology" className="mt-16 scroll-mt-4">
      <details className="group rounded-xl border border-neutral-200 bg-white">
        <summary className="cursor-pointer list-none px-5 py-4 font-serif text-2xl font-bold marker:content-none">
          Methodology
          <span className="ml-3 align-middle text-sm font-normal text-neutral-400 group-open:hidden">
            (click to expand — scores are editorial estimates, not measurements)
          </span>
        </summary>
        <div className="space-y-4 border-t border-neutral-100 px-5 py-5 text-sm leading-relaxed text-neutral-700">
          <p>
            Scores are <strong>editorial estimates, not measurements</strong>. They synthesize
            (a) task-level exposure research (Anthropic Economic Index, Goldman Sachs, IMF),
            (b) early empirical employment data (the Stanford &ldquo;Canaries&rdquo; ADP payroll
            analysis), and (c) a mechanism framework:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Verification speed.</strong> Work whose output is cheaply checkable
              automates first; work needing real-world or system-level verification automates
              last.
            </li>
            <li>
              <strong>Artifact vs. outcome.</strong> Within every occupation, producing
              artifacts from specs is exposed; owning outcomes (deciding, verifying, being
              accountable) is amplified. Scores describe the occupation&rsquo;s{' '}
              <em>current median</em> job content.
            </li>
            <li>
              <strong>Accountability shield.</strong> Where law, liability, certification, or
              public trust require a blamable human — pilots, auditors, physicians, judges —
              displacement lags capability by years. The constraint is institutional, not
              technical.
            </li>
            <li>
              <strong>Second-order / demand-side exposure.</strong> Jobs paid from discretionary
              household income inherit their customers&rsquo; displacement risk. A barista is
              automation-proof and customer-exposed. This is scored separately
              (<code>second_order_risk</code>) because it&rsquo;s invisible in task-exposure
              studies.
            </li>
            <li>
              <strong>Jevons offsets.</strong> Cheaper output can expand total demand (legal
              services, software, research), partially offsetting job losses — which is why
              some high-task-exposure occupations show flat headcount (paralegals: ~44% task
              automation, yet BLS projects roughly flat employment).
            </li>
          </ul>
          <p className="rounded-lg bg-neutral-50 p-4">
            <strong>Honest caveats.</strong> Exposure ≠ displacement: the IMF&rsquo;s 60%
            advanced-economy exposure splits roughly half harmed / half augmented. Institutional
            adoption lags lab capability: Amodei&rsquo;s 90%-of-code prediction came true inside
            Anthropic, not across the economy. And serious institutions disagree by ~20x on
            displacement magnitude — Goldman Sachs sees ~6–9% of the US workforce over a decade;
            Amodei sketches a 10–20% unemployment scenario. The disagreement is about the{' '}
            <em>speed of capability growth</em>, and this map takes no side beyond flagging a
            confidence level per job.
          </p>
        </div>
      </details>
    </section>
  )
}
