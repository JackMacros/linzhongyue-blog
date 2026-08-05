import { NavLink } from 'react-router'
import { useLang } from '@/i18n'
import MagneticButton from '@/components/MagneticButton'

export default function Nav() {
  const { t, lang, toggle } = useLang()
  const links = [
    { to: '/', label: t.nav.home },
    { to: '/blog', label: t.nav.blog },
    { to: '/columns', label: t.nav.columns },
    { to: '/about', label: t.nav.about },
    { to: '/contact', label: t.nav.contact },
  ]
  return (
    <header className="fixed top-0 left-0 right-0 z-50 nav-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <NavLink to="/" className="flex items-center gap-2 font-display text-lg font-medium tracking-tight" aria-label="林中月首页">
          <img src="/site-icon.svg" alt="" className="h-7 w-7" />
          <span>LZY<span className="text-teal-300">.</span></span>
        </NavLink>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `font-mono2 text-xs uppercase tracking-[0.2em] transition-colors hover:text-teal-300 ${
                  isActive ? 'text-teal-300' : 'text-white/60'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
        <MagneticButton
          onClick={toggle}
          className="rounded-full border border-white/15 px-4 py-1.5 font-mono2 text-xs tracking-widest text-white/80 transition-colors hover:border-teal-300/60 hover:text-teal-300"
        >
          {lang === 'zh' ? 'EN' : '中文'}
        </MagneticButton>
      </nav>
      {/* mobile nav */}
      <div className="flex justify-center gap-5 pb-3 md:hidden">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `font-mono2 text-[10px] uppercase tracking-[0.15em] ${isActive ? 'text-teal-300' : 'text-white/60'}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </header>
  )
}
