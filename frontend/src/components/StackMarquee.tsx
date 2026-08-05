/** Infinite marquee rows of tech keywords (v1 style), alternating outline/solid. */
export default function StackMarquee({ rows }: { rows: string[] }) {
  return (
    <div className="space-y-6">
      {rows.map((row, i) => (
        <div key={i} className="relative flex overflow-hidden" style={{ opacity: 1 - i * 0.22 }}>
          <div
            className="animate-marquee flex shrink-0 whitespace-nowrap"
            style={{ animationDuration: `${26 + i * 8}s`, animationDirection: i % 2 ? 'reverse' : 'normal' }}
          >
            {[0, 1].map((k) => (
              <span
                key={k}
                className={`mx-4 font-display text-5xl font-medium tracking-tight md:text-7xl ${
                  i % 2 ? 'text-outline' : 'text-white/75'
                }`}
              >
                {row}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
