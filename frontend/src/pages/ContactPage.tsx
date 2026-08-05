import { useLang } from '@/i18n'
import Reveal from '@/components/Reveal'
import MagneticButton from '@/components/MagneticButton'
import { useSiteContent } from '@/api/SiteContentContext'

export default function ContactPage() {
  const { t, lang } = useLang()
  const { data } = useSiteContent()
  const profile = data?.profile
  const email = profile?.email || t.contactPage.email
  const heading = profile ? (lang === 'zh' ? profile.contactHeadingZh : profile.contactHeadingEn) : t.contactPage.heading
  const description = profile ? (lang === 'zh' ? profile.contactDescriptionZh : profile.contactDescriptionEn) : t.contactPage.desc
  const socialLinks = data?.socialLinks ?? []
  return (
    <div className="mx-auto max-w-7xl px-6 pb-28 pt-36 md:px-10 md:pt-48">
      <Reveal><p className="mb-8 font-mono2 text-xs uppercase tracking-[0.3em] text-teal-300">{t.contactPage.title}</p><h1 className="whitespace-pre-line font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-8xl">{heading}</h1></Reveal>
      <Reveal delay={0.15}><p className="mt-8 max-w-lg leading-relaxed text-white/55 md:text-lg">{description}</p></Reveal>
      <Reveal delay={0.25} className="mt-14"><MagneticButton href={`mailto:${email}`} className="group rounded-full border border-teal-300/40 bg-teal-300/5 px-10 py-5 font-display text-lg text-teal-200 transition-colors hover:bg-teal-300/15 md:text-xl">{t.contactPage.cta}<span className="ml-3 inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span></MagneticButton><p className="mt-4 font-mono2 text-sm text-white/40">{email}</p></Reveal>
      <Reveal delay={0.35} className="mt-24"><p className="mb-6 font-mono2 text-xs uppercase tracking-[0.25em] text-white/40">{t.contactPage.socialsTitle}</p><div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">{socialLinks.map((link) => <a key={link.id} href={link.url} target="_blank" rel="noreferrer noopener" className="group flex flex-col gap-1 bg-background p-6 transition-colors hover:bg-white/[0.03]"><span className="font-display text-lg font-medium transition-colors group-hover:text-teal-200">{link.platform} <span className="inline-block text-white/30 transition-transform duration-300 group-hover:translate-x-1">↗</span></span><span className="font-mono2 text-xs text-white/40">{link.handle}</span></a>)}</div></Reveal>
    </div>
  )
}
