import { ContentLayout } from '@/components/content-layout'
import { getPublicProfile } from '@/lib/db/profiles'
import { getAllTechnologies } from '@/lib/db/technologies'
import { GithubIcon, LinkedinIcon, InstagramIcon, TwitterIcon } from '@/components/social-icons'
import { Globe, Mail, ArrowUpRight, GraduationCap, Sparkles, Heart, BookOpen } from 'lucide-react'
import React from 'react'

export const dynamic = 'force-dynamic'

export default async function MePage() {
  const profile = await getPublicProfile()
  const technologies = await getAllTechnologies()

  const name = profile?.name || 'Ankit'
  const headline = profile?.headline || 'Third-year BTech Student & Software Engineer'
  const education = profile?.education || 'Third-year BTech student in Computer Science'
  const bio = profile?.bio || 'Building AI/ML systems and full-stack software applications.'
  const detailedBio = profile?.detailed_bio || 'Interested in software architecture, computer science fundamentals, and building intelligent systems. Passionate about learning by building, writing technical essays, and exploring ideas beyond engineering.'
  const engineeringInterests = profile?.engineering_interests || 'AI/ML Systems, Full-Stack Applications, Software Architecture, CS Fundamentals, Learning by Building, Technical Writing & Documentation'
  const personalInterests = profile?.personal_interests || 'Poetry, Football, Philosophy, & Exploring Ideas Beyond Engineering'
  const avatarUrl = profile?.avatar_url
  const email = profile?.email

  // Configure social links
  const socialLinks: Array<{ label: string; href: string; renderIcon: (size?: number) => React.ReactNode }> = []

  if (email) {
    socialLinks.push({
      label: 'Email',
      href: `mailto:${email}`,
      renderIcon: (size) => <Mail size={size} className="text-foreground" />,
    })
  }

  if (profile?.github) {
    socialLinks.push({
      label: 'GitHub',
      href: profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`,
      renderIcon: (size) => <GithubIcon size={size} />,
    })
  }

  if (profile?.linkedin) {
    socialLinks.push({
      label: 'LinkedIn',
      href: profile.linkedin.startsWith('http') ? profile.linkedin : `https://www.linkedin.com/in/${profile.linkedin}`,
      renderIcon: (size) => <LinkedinIcon size={size} />,
    })
  }

  if (profile?.twitter) {
    socialLinks.push({
      label: 'Twitter / X',
      href: profile.twitter.startsWith('http') ? profile.twitter : `https://x.com/${profile.twitter.replace('@', '')}`,
      renderIcon: (size) => <TwitterIcon size={size} />,
    })
  }

  if (profile?.instagram) {
    socialLinks.push({
      label: 'Instagram',
      href: profile.instagram.startsWith('http') ? profile.instagram : `https://www.instagram.com/${profile.instagram}`,
      renderIcon: (size) => <InstagramIcon size={size} />,
    })
  }

  if (profile?.website) {
    socialLinks.push({
      label: 'Personal Website',
      href: profile.website,
      renderIcon: (size) => <Globe size={size} />,
    })
  }

  // Fallbacks if empty
  if (socialLinks.length <= 1) {
    const existingLabels = new Set(socialLinks.map((s) => s.label))

    if (!existingLabels.has('GitHub')) {
      socialLinks.push({
        label: 'GitHub',
        href: 'https://github.com/Ankitt-02',
        renderIcon: (size) => <GithubIcon size={size} />,
      })
    }
    if (!existingLabels.has('LinkedIn')) {
      socialLinks.push({
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/ankit-swami-161b80301/',
        renderIcon: (size) => <LinkedinIcon size={size} />,
      })
    }
    if (!existingLabels.has('Twitter / X')) {
      socialLinks.push({
        label: 'Twitter / X',
        href: 'https://x.com/AnkitSwami66750',
        renderIcon: (size) => <TwitterIcon size={size} />,
      })
    }
    if (!existingLabels.has('Instagram')) {
      socialLinks.push({
        label: 'Instagram',
        href: 'https://instagram.com',
        renderIcon: (size) => <InstagramIcon size={size} />,
      })
    }
  }

  // Group technologies by category
  const groupedTech: Record<string, typeof technologies> = {}
  technologies.forEach((t) => {
    const cat = t.category || 'General'
    if (!groupedTech[cat]) groupedTech[cat] = []
    groupedTech[cat].push(t)
  })

  // Parse comma-separated interests into tags if applicable
  const engInterestTags = engineeringInterests.split(',').map((s) => s.trim()).filter(Boolean)
  const personalInterestTags = personalInterests.split(',').map((s) => s.trim()).filter(Boolean)

  return (
    <ContentLayout title="Me">
      <div className="space-y-16">
        {/* Profile Header & Identity */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {avatarUrl && (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border border-border/80 bg-card flex-shrink-0 shadow-md">
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-3 max-w-2xl">
              <div className="space-y-1">
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">{name}</h2>
                <p className="text-lg sm:text-xl text-muted-foreground font-medium">{headline}</p>
              </div>

              {education && (
                <div className="flex items-center gap-2 text-xs font-mono text-accent pt-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>{education}</span>
                </div>
              )}

              <p className="text-base text-foreground/85 leading-relaxed font-light pt-2">
                {bio}
              </p>
            </div>
          </div>
        </section>

        {/* About & Learning Philosophy */}
        <section className="space-y-4 pt-8 border-t border-border/40">
          <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            About &amp; Background
          </h3>
          <p className="text-base sm:text-lg text-foreground/90 leading-relaxed font-light max-w-3xl whitespace-pre-wrap">
            {detailedBio}
          </p>
        </section>

        {/* Focus Areas & Passions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border/40">
          {/* Engineering Focus */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Engineering &amp; Systems Focus
            </h3>
            <div className="flex flex-wrap gap-2">
              {engInterestTags.map((interest) => (
                <span
                  key={interest}
                  className="px-3.5 py-1.5 rounded-xl border border-border/60 bg-card text-xs font-mono font-medium text-foreground"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Personal Interests */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              Personal Interests &amp; Passions
            </h3>
            <div className="flex flex-wrap gap-2">
              {personalInterestTags.map((interest) => (
                <span
                  key={interest}
                  className="px-3.5 py-1.5 rounded-xl border border-border/60 bg-card text-xs font-mono font-medium text-foreground"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Technologies Stack */}
        {technologies.length > 0 && (
          <section className="space-y-6 pt-8 border-t border-border/40">
            <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">
              Configured Tech Stack
            </h3>
            <div className="space-y-6">
              {Object.entries(groupedTech).map(([category, items]) => (
                <div key={category} className="space-y-2.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
                    {category}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {items.map((tech) => (
                      <span
                        key={tech.id}
                        className="px-3.5 py-1.5 rounded-xl border border-border/60 bg-card text-xs font-mono font-medium text-foreground"
                      >
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Connect & Socials */}
        <section className="space-y-6 pt-8 border-t border-border/40">
          <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">
            Connect
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl border border-border/60 hover:border-neutral-400 dark:hover:border-neutral-500 bg-card hover:bg-secondary/40 transition-colors duration-150 group flex items-center justify-between"
              >
                <span className="font-medium text-sm text-foreground flex items-center gap-3">
                  {link.renderIcon(18)}
                  {link.label}
                </span>
                <ArrowUpRight size={15} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </ContentLayout>
  )
}
