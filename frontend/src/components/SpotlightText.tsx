import { useEffect, useRef } from 'react'
import { useLang } from '@/i18n'

/**
 * Giant-name spotlight: one huge "林中月" sits in the background,
 * nearly invisible; a soft radial mask follows the cursor and
 * reveals the part of the name underneath it.
 */
export default function SpotlightText() {
  const revealRef = useRef<HTMLDivElement>(null)
  const { t } = useLang()

  useEffect(() => {
    const el = revealRef.current
    if (!el) return
    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    let x = tx, y = ty
    let raf = 0
    const RADIUS = 300

    const apply = () => {
      const mask = `radial-gradient(${RADIUS}px circle at ${x}px ${y}px, black 0%, transparent 100%)`
      el.style.maskImage = mask
      el.style.webkitMaskImage = mask
    }
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY }
    const loop = () => {
      raf = requestAnimationFrame(loop)
      x += (tx - x) * 0.08
      y += (ty - y) * 0.08
      apply()
    }
    window.addEventListener('mousemove', onMove)
    apply()
    loop()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  const bigText = (className: string, style?: React.CSSProperties) => (
    <div className="absolute inset-0 flex items-center justify-center select-none" aria-hidden>
      <span
        className={`whitespace-nowrap font-display font-bold leading-none tracking-[0.02em] ${className}`}
        style={{ fontSize: 'min(34vw, 34rem)', ...style }}
      >
        {t.hero.name}
      </span>
    </div>
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* ghost layer — faint outline, barely visible */}
      {bigText('text-transparent', { WebkitTextStroke: '1px rgba(255,255,255,0.06)' })}
      {/* reveal layer — lit up only inside the cursor spotlight */}
      <div ref={revealRef} className="absolute inset-0">
        {bigText('text-moon-gradient opacity-70')}
      </div>
    </div>
  )
}
