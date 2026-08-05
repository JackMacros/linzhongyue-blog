import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router'
import { useLang } from '@/i18n'
import Reveal from '@/components/Reveal'
import StackMarquee from '@/components/StackMarquee'
import ProjectGrid from '@/components/ProjectGrid'
import { useSiteContent } from '@/api/SiteContentContext'

export default function AboutPage() {
  const { t, lang } = useLang()
  const location = useLocation()
  const { data } = useSiteContent()
  const profile = data?.profile
  const projects = data?.projects ?? []
  const experiences = data?.experiences ?? []
  const skillGroups = useMemo(() => {
    const grouped = new Map<string, string[]>()
    for (const skill of data?.skills ?? []) {
      const group = lang === 'zh' ? skill.groupZh : skill.groupEn
      grouped.set(group, [...(grouped.get(group) ?? []), skill.name])
    }
    return [...grouped.entries()].map(([group, items]) => ({ group, items }))
  }, [data?.skills, lang])
  const displaySkills = skillGroups.length ? skillGroups : t.about.skills
  const marqueeRows = displaySkills.map((group) => group.items.join(' · '))
  const stats = profile ? [1, 2, 3, 4].map((index) => ({
    n: profile[`stat${index}Value` as keyof typeof profile] as string,
    label: profile[`stat${index}Label${lang === 'zh' ? 'Zh' : 'En'}` as keyof typeof profile] as string,
  })) : t.about.stats

  useEffect(() => {
    if (location.hash !== '#projects') return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [location.hash])

  return (
    <div className="pb-28 pt-36 md:pt-44">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="relative min-h-[430px] md:min-h-[460px]">
          <Reveal>
            <h1 className="font-display text-4xl font-medium tracking-tight md:text-6xl">{t.about.title}</h1>
            <p className="mt-4 font-mono2 text-sm uppercase tracking-[0.2em] text-teal-300">{profile ? (lang === 'zh' ? profile.roleZh : profile.roleEn) : t.about.role}</p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 flex justify-center md:absolute md:right-8 md:top-0 md:mt-0 lg:right-14">
            <div className="relative h-52 w-52 rounded-full border border-teal-300/35 bg-gradient-to-br from-teal-400/20 via-white/[0.04] to-violet-400/20 p-2 shadow-[0_24px_80px_rgba(45,212,191,0.13)] transition duration-500 hover:-translate-y-2 hover:border-teal-300/60 hover:shadow-[0_30px_100px_rgba(45,212,191,0.2)] md:h-60 md:w-60 lg:h-72 lg:w-72">
              <div className="relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-[#111118]">
                {profile?.avatarUrl ? <img src={profile.avatarUrl} alt={profile.displayNameZh} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center font-display text-6xl text-white/35">{profile?.displayNameZh?.slice(0, 1) || '林'}</div>}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/[0.08]" />
              </div>
              <span className="absolute bottom-5 right-5 h-4 w-4 rounded-full border-[3px] border-[#0a0a10] bg-teal-300 shadow-[0_0_18px_rgba(94,234,212,0.8)] md:bottom-6 md:right-6" />
            </div>
          </Reveal>

          <div className="mt-12 space-y-5 md:mt-24 md:max-w-[calc(100%-18rem)] lg:max-w-3xl">
            <Reveal delay={0.1}><p className="leading-relaxed text-white/60 md:text-lg">{profile ? (lang === 'zh' ? profile.aboutParagraph1Zh : profile.aboutParagraph1En) : t.about.p1}</p></Reveal>
            <Reveal delay={0.2}><p className="leading-relaxed text-white/60 md:text-lg">{profile ? (lang === 'zh' ? profile.aboutParagraph2Zh : profile.aboutParagraph2En) : t.about.p2}</p></Reveal>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-8 border-y border-white/10 py-10 md:grid-cols-4">
          {stats.map((stat, index) => <Reveal key={`${stat.label}-${index}`} delay={index * 0.1}><p className="font-display text-4xl font-medium text-glow-gradient md:text-5xl">{stat.n}</p><p className="mt-2 text-sm text-white/50">{stat.label}</p></Reveal>)}
        </div>

        <section id="projects" className="mt-24 scroll-mt-28">
          <Reveal><h2 className="mb-12 font-display text-2xl font-medium tracking-tight md:text-4xl">{t.about.projectsTitle}</h2></Reveal>
          <ProjectGrid projects={projects} lang={lang} viewProjectLabel={t.home.viewProject} />
        </section>

        <div className="mt-24 grid gap-12 md:grid-cols-[240px_1fr]">
          <Reveal><h2 className="font-display text-2xl font-medium tracking-tight md:text-4xl">{t.about.timelineTitle}</h2></Reveal>
          <div className="relative border-l border-white/10 pl-8">
            {(experiences.length ? experiences : t.about.timeline.map((item, index) => ({ id: index, periodZh: item.year, periodEn: item.year, roleZh: item.title, roleEn: item.title, organizationZh: '', organizationEn: '', descriptionZh: item.desc, descriptionEn: item.desc }))).map((item, index) => {
              const role = lang === 'zh' ? item.roleZh : item.roleEn
              const organization = lang === 'zh' ? item.organizationZh : item.organizationEn
              return <Reveal key={item.id} delay={index * 0.1} className="relative pb-10 last:pb-0"><span className="absolute -left-[37px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-teal-300 bg-background" /><p className="font-mono2 text-xs tracking-widest text-teal-300/80">{lang === 'zh' ? item.periodZh : item.periodEn}</p><h3 className="mt-2 font-display text-lg font-medium md:text-xl">{role}{organization ? ` · ${organization}` : ''}</h3><p className="mt-1.5 text-sm leading-relaxed text-white/55">{lang === 'zh' ? item.descriptionZh : item.descriptionEn}</p></Reveal>
            })}
          </div>
        </div>
      </div>

      <section className="mt-24 border-y border-white/10 py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10"><Reveal><div className="mb-12 flex flex-wrap items-baseline gap-x-6 gap-y-2"><h2 className="font-display text-2xl font-medium tracking-tight md:text-4xl">{t.about.skillsTitle}</h2><div className="flex gap-4 font-mono2 text-[11px] uppercase tracking-[0.2em] text-white/40">{displaySkills.map((group) => <span key={group.group} className="text-teal-300/70">{group.group}</span>)}</div></div></Reveal></div>
        <Reveal delay={0.15}><StackMarquee rows={marqueeRows} /></Reveal>
      </section>
    </div>
  )
}
