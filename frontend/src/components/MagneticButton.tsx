import { useRef, type ReactNode, type MouseEvent } from 'react'

interface Props {
  children: ReactNode
  className?: string
  href?: string
  onClick?: () => void
}

/** Button/link whose content is magnetically attracted toward the cursor. */
export default function MagneticButton({ children, className = '', href, onClick }: Props) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null)

  const onMove = (e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    el.style.transform = `translate(${dx * 0.3}px, ${dy * 0.35}px)`
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
    el.style.transform = 'translate(0, 0)'
    setTimeout(() => { if (el) el.style.transition = '' }, 500)
  }

  const shared = { onMouseMove: onMove, onMouseLeave: onLeave, className: `inline-block will-change-transform ${className}` }
  return href ? (
    <a ref={ref as any} href={href} onClick={onClick} {...shared}>{children}</a>
  ) : (
    <button ref={ref as any} onClick={onClick} {...shared}>{children}</button>
  )
}
