import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let x = -100, y = -100, rx = -100, ry = -100
    let raf = 0

    const onMove = (e: MouseEvent) => { x = e.clientX; y = e.clientY }
    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      ring.classList.toggle('is-hover', !!el.closest('a, button, [role="button"], .tilt-card'))
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      rx += (x - rx) * 0.14
      ry += (y - ry) * 0.14
      dot.style.transform = `translate(${x - 3}px, ${y - 3}px)`
      ring.style.transform = `translate(${rx - ring.offsetWidth / 2}px, ${ry - ring.offsetHeight / 2}px)`
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    loop()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  )
}
