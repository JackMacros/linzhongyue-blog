import { useRef, type MouseEvent, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

/** Card with 3D tilt + light glare following the cursor. */
export default function TiltCard({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.setProperty('--gx', `${px * 100}%`)
    el.style.setProperty('--gy', `${py * 100}%`)
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 7}deg) rotateY(${(px - 0.5) * 9}deg) translateZ(0)`
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
    el.style.transform = 'perspective(900px) rotateX(0) rotateY(0)'
    setTimeout(() => { if (el) el.style.transition = '' }, 600)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt-card relative ${className}`}
    >
      <div className="glare" />
      {children}
    </div>
  )
}
