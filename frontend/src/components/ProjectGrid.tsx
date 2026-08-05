import Reveal from '@/components/Reveal'
import TiltCard from '@/components/TiltCard'
import { parseTechStack } from '@/api/client'
import type { PortfolioProject } from '@/api/types'
import type { Lang } from '@/i18n'

interface Props {
  projects: PortfolioProject[]
  lang: Lang
  viewProjectLabel: string
}

function projectHref(value?: string) {
  const href = value?.trim()
  if (!href) return null
  if (/^https?:\/\//i.test(href) || href.startsWith('/')) return href
  return `https://${href}`
}

export default function ProjectGrid({ projects, lang, viewProjectLabel }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {projects.map((project, index) => {
        const href = projectHref(project.projectUrl)
        const card = (
          <TiltCard className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-teal-300/40">
            <p className="font-mono2 text-xs tracking-widest text-white/40">{String(index + 1).padStart(2, '0')}</p>
            <h3 className="mt-3 font-display text-xl font-medium transition-colors group-hover:text-teal-200">{project.name}</h3>
            <p className="mt-1 text-sm text-teal-300/80">{lang === 'zh' ? project.subtitleZh : project.subtitleEn}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/55">{lang === 'zh' ? project.descriptionZh : project.descriptionEn}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {parseTechStack(project.techStack).map((tech) => (
                <span key={tech} className="rounded-md bg-white/[0.05] px-2 py-0.5 font-mono2 text-[10px] text-white/60">
                  {tech}
                </span>
              ))}
            </div>
            {href && (
              <span className="mt-auto pt-6 font-mono2 text-xs uppercase tracking-[0.18em] text-teal-300 transition-transform group-hover:translate-x-1">
                {viewProjectLabel} →
              </span>
            )}
          </TiltCard>
        )

        return (
          <Reveal key={project.id} delay={index * 0.1} className="h-full">
            {href ? (
              <a
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                aria-label={`${viewProjectLabel}：${project.name}`}
                className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                {card}
              </a>
            ) : card}
          </Reveal>
        )
      })}
    </div>
  )
}
