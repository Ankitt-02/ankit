'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Terminal as TerminalIcon, CornerDownLeft, RefreshCw, FileText } from 'lucide-react'
import { DEVELOPER_STACK } from '@/lib/data/stack'
import type { ProjectWithRelations } from '@/lib/db/types'
import type { ArticleWithRelations } from '@/lib/db/types'
import type { MomentWithRelations } from '@/lib/db/types'
import type { Profile } from '@/lib/db/types'

interface HeroSectionProps {
  name: string
  headline: string
  bio: string
  projects?: ProjectWithRelations[]
  articles?: ArticleWithRelations[]
  moments?: MomentWithRelations[]
  profile?: Profile | null
}

interface CommandLog {
  id: string
  cmd: string
  output: React.ReactNode
}

const WELCOME_LOG: CommandLog = {
  id: 'init-welcome',
  cmd: 'welcome',
  output: (
    <div className="space-y-1.5 text-foreground/90 font-mono text-xs">
      <p className="text-muted-foreground font-medium">Ankit Developer Shell</p>
      <p className="text-muted-foreground text-[11px]">
        Type <span className="text-accent font-semibold">&apos;help&apos;</span> to list commands or <span className="text-accent font-semibold">&apos;cat life.log&apos;</span> for personal moments.
      </p>
    </div>
  ),
}

export function HeroSection({
  name,
  headline,
  bio,
  projects = [],
  articles = [],
  moments = [],
  profile = null,
}: HeroSectionProps) {
  const router = useRouter()
  const [inputVal, setInputVal] = useState('')
  const [logs, setLogs] = useState<CommandLog[]>([WELCOME_LOG])
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalStreamRef = useRef<HTMLDivElement>(null)

  const latestMoment = moments[0]
  const resumeUrl = profile?.resume_url

  // Internal Terminal Stream Scroll ONLY — Never scroll the browser window
  useEffect(() => {
    if (terminalStreamRef.current) {
      terminalStreamRef.current.scrollTop = terminalStreamRef.current.scrollHeight
    }
  }, [logs])

  const handleCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim()
    if (!trimmed) return

    const lower = trimmed.toLowerCase()
    setCmdHistory((prev) => [...prev, trimmed])
    setHistoryIdx(-1)

    // Handle Clear Command — Keep default intro log
    if (lower === 'clear') {
      setLogs([{ ...WELCOME_LOG, id: `welcome-${Date.now()}` }])
      setInputVal('')
      return
    }

    let outputContent: React.ReactNode = null

    // Handle Navigation Commands
    if (lower === 'open projects') {
      router.push('/projects')
      outputContent = <p className="text-emerald-400 text-[11px]">Navigating to /projects...</p>
    } else if (lower === 'open articles') {
      router.push('/articles')
      outputContent = <p className="text-emerald-400 text-[11px]">Navigating to /articles...</p>
    } else if (lower === 'open moments') {
      router.push('/moments')
      outputContent = <p className="text-emerald-400 text-[11px]">Navigating to /moments...</p>
    } else if (lower === 'open me' || lower === 'open about') {
      router.push('/me')
      outputContent = <p className="text-emerald-400 text-[11px]">Navigating to /me...</p>
    } else if (lower === 'help') {
      outputContent = (
        <div className="space-y-2 text-xs font-mono text-foreground/90 pt-1">
          <p className="text-muted-foreground font-semibold">Available Shell Commands:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            <div><span className="text-accent font-bold">about</span> - Developer bio &amp; info</div>
            <div><span className="text-accent font-bold">stack</span> - Technical architecture</div>
            <div><span className="text-accent font-bold">projects</span> - Real published projects</div>
            <div><span className="text-accent font-bold">articles</span> - Real published articles</div>
            <div><span className="text-accent font-bold">moments</span> - Recent timeline entry</div>
            <div><span className="text-accent font-bold">cat life.log</span> - Real personal moment log</div>
            <div><span className="text-accent font-bold">cat build.log</span> - Active engineering focus</div>
            <div><span className="text-accent font-bold">contact</span> - Verified social connections</div>
            <div><span className="text-accent font-bold">open [page]</span> - Navigate directly</div>
            <div><span className="text-accent font-bold">clear</span> - Clear console output</div>
          </div>
        </div>
      )
    } else if (lower === 'about') {
      outputContent = (
        <div className="space-y-1.5 text-[11px]">
          <p className="font-bold text-foreground">{name}</p>
          <p className="text-foreground/90">{headline}</p>
          <p className="text-muted-foreground">{bio}</p>
          <Link href="/me" className="inline-flex items-center gap-1 text-accent hover:underline pt-1">
            <span>View /me page →</span>
          </Link>
        </div>
      )
    } else if (lower === 'stack') {
      outputContent = (
        <div className="space-y-2 text-[11px] font-mono">
          <p className="text-muted-foreground font-semibold">Configured Technical Stack:</p>
          <div className="space-y-1.5 pt-0.5">
            <div>
              <span className="text-accent font-semibold block uppercase text-[10px]">FRONTEND</span>
              <p className="text-foreground/90">{DEVELOPER_STACK.frontend.join(', ')}</p>
            </div>
            <div>
              <span className="text-accent font-semibold block uppercase text-[10px]">BACKEND</span>
              <p className="text-foreground/90">{DEVELOPER_STACK.backend.join(', ')}</p>
            </div>
            <div>
              <span className="text-accent font-semibold block uppercase text-[10px]">AI / ML</span>
              <p className="text-foreground/90">{DEVELOPER_STACK.ai_ml.join(', ')}</p>
            </div>
            <div>
              <span className="text-accent font-semibold block uppercase text-[10px]">DATABASES</span>
              <p className="text-foreground/90">{DEVELOPER_STACK.databases.join(', ')}</p>
            </div>
            <div>
              <span className="text-accent font-semibold block uppercase text-[10px]">LANGUAGES</span>
              <p className="text-foreground/90">{DEVELOPER_STACK.languages.join(', ')}</p>
            </div>
            <div>
              <span className="text-accent font-semibold block uppercase text-[10px]">FUNDAMENTALS</span>
              <p className="text-foreground/90">{DEVELOPER_STACK.fundamentals.join(', ')}</p>
            </div>
            <div>
              <span className="text-accent font-semibold block uppercase text-[10px]">TOOLS</span>
              <p className="text-foreground/90">{DEVELOPER_STACK.tools.join(', ')}</p>
            </div>
          </div>
        </div>
      )
    } else if (lower === 'projects') {
      outputContent = (
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-semibold">Published Projects:</span>
            <Link href="/projects" className="text-accent hover:underline text-[10px]">View All →</Link>
          </div>
          {projects.length > 0 ? (
            <div className="space-y-1.5">
              {projects.slice(0, 3).map((p) => (
                <div key={p.id} className="p-2 rounded bg-secondary/30 flex items-center justify-between">
                  <Link href={`/projects/${p.slug}`} className="font-bold text-foreground hover:text-accent line-clamp-1">
                    {p.title}
                  </Link>
                  <span className="text-[10px] text-muted-foreground">Case Study</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No projects published yet.</p>
          )}
        </div>
      )
    } else if (lower === 'articles') {
      outputContent = (
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-semibold">Published Articles:</span>
            <Link href="/articles" className="text-accent hover:underline text-[10px]">View All →</Link>
          </div>
          {articles.length > 0 ? (
            <div className="space-y-1.5">
              {articles.slice(0, 3).map((a) => (
                <div key={a.id} className="p-2 rounded bg-secondary/30 flex items-center justify-between">
                  <Link href={`/articles/${a.slug}`} className="font-medium text-foreground hover:text-accent line-clamp-1">
                    {a.title}
                  </Link>
                  <span className="text-[10px] text-muted-foreground">{a.reading_time || 2} min</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No published articles yet.</p>
          )}
        </div>
      )
    } else if (lower === 'moments' || lower === 'cat life.log') {
      outputContent = (
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-semibold">life.log entry:</span>
            <Link href="/moments" className="text-accent hover:underline text-[10px]">Timeline →</Link>
          </div>
          {latestMoment ? (
            <div className="p-2.5 rounded border border-border/60 bg-secondary/30 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span>{latestMoment.title}</span>
                {latestMoment.event_date && (
                  <span className="text-[10px] text-muted-foreground font-normal">
                    {new Date(latestMoment.event_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
              {latestMoment.content && <p className="text-foreground/80 leading-relaxed">{latestMoment.content}</p>}
              {latestMoment.images && latestMoment.images.length > 0 && latestMoment.images[0]?.public_url && (
                <div className="mt-1.5 rounded overflow-hidden border border-border/50 bg-black/40">
                  <img
                    src={latestMoment.images[0].public_url}
                    alt={latestMoment.title}
                    className="w-full h-auto max-h-[140px] object-contain"
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No moments recorded yet.</p>
          )}
        </div>
      )
    } else if (lower === 'cat build.log') {
      outputContent = (
        <div className="space-y-2 text-[11px]">
          <p className="text-muted-foreground font-semibold">build.log engineering trace:</p>
          <div className="p-2.5 rounded border border-border/60 bg-secondary/30 space-y-1 text-foreground/90">
            <p><span className="text-accent font-bold">[active_work]</span> Fullstack systems, Next.js 16, Supabase, PyTorch</p>
            <p><span className="text-accent font-bold">[architecture]</span> Relational schema design &amp; responsive UI</p>
            <p><span className="text-accent font-bold">[status]</span> Building software applications &amp; technical writing</p>
          </div>
        </div>
      )
    } else if (lower === 'contact') {
      outputContent = (
        <div className="space-y-1 text-[11px]">
          <p className="text-muted-foreground font-semibold">Social &amp; Contact Connections:</p>
          {profile?.email && (
            <p><span className="text-muted-foreground">Email:</span> <a href={`mailto:${profile.email}`} className="text-accent hover:underline">{profile.email}</a></p>
          )}
          <p><span className="text-muted-foreground">GitHub:</span> <a href="https://github.com/Ankitt-02" target="_blank" rel="noreferrer" className="text-accent hover:underline">github.com/Ankitt-02</a></p>
          <p><span className="text-muted-foreground">LinkedIn:</span> <a href="https://www.linkedin.com/in/ankit-swami-161b80301/" target="_blank" rel="noreferrer" className="text-accent hover:underline">linkedin.com/in/ankit-swami</a></p>
          <p><span className="text-muted-foreground">Twitter / X:</span> <a href="https://x.com/AnkitSwami66750" target="_blank" rel="noreferrer" className="text-accent hover:underline">x.com/AnkitSwami66750</a></p>
          <p><span className="text-muted-foreground">Instagram:</span> <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-accent hover:underline">instagram.com</a></p>
        </div>
      )
    } else {
      outputContent = (
        <p className="text-red-400 text-[11px]">
          bash: command not found: {trimmed}. Type &apos;help&apos; for list of commands.
        </p>
      )
    }

    setLogs((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, cmd: trimmed, output: outputContent }])
    setInputVal('')
  }

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCommand(inputVal)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (cmdHistory.length === 0) return
      const nextIdx = historyIdx + 1
      if (nextIdx < cmdHistory.length) {
        setHistoryIdx(nextIdx)
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1
        setHistoryIdx(nextIdx)
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx])
      } else if (historyIdx === 0) {
        setHistoryIdx(-1)
        setInputVal('')
      }
    }
  }

  return (
    <section className="pt-8 pb-14 md:pt-14 md:pb-20 space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Personal Intro */}
        <div className="lg:col-span-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
              Hi, I&apos;m {name}.
            </h1>

            <p className="text-xl sm:text-2xl text-foreground/90 font-normal leading-snug tracking-tight text-balance">
              {headline}
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08, ease: 'easeOut' }}
            className="text-base text-muted-foreground leading-relaxed font-light"
          >
            {bio}
          </motion.p>

          {/* Primary Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.16, ease: 'easeOut' }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-xs font-mono transition-transform duration-150 active:scale-[0.98]"
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>

            {resumeUrl ? (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/80 bg-card hover:bg-secondary text-foreground font-medium text-xs font-mono transition-colors duration-150"
              >
                <FileText className="w-3.5 h-3.5 text-accent" />
                <span>Resume</span>
              </a>
            ) : (
              <button
                disabled
                title="No resume uploaded yet in Admin Settings"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/40 bg-secondary/20 text-muted-foreground font-medium text-xs font-mono opacity-60 cursor-not-allowed"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Resume</span>
              </button>
            )}
          </motion.div>
        </div>

        {/* Right Column: Signature Developer Bash Console */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="lg:col-span-6 h-[340px] rounded-2xl border border-border/80 bg-card shadow-lg overflow-hidden font-mono text-xs flex flex-col"
        >
          {/* Terminal Window Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-secondary/40 select-none flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/70 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70 inline-block" />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
              <TerminalIcon className="w-3.5 h-3.5 text-accent" />
              <span>ankit@console:~$</span>
            </div>

            <button
              onClick={() => setLogs([{ ...WELCOME_LOG, id: `welcome-${Date.now()}` }])}
              title="Clear terminal screen"
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Terminal Main Output Stream */}
          <div
            ref={terminalStreamRef}
            className="p-4 flex-1 overflow-y-auto space-y-3 font-mono text-xs leading-relaxed"
          >
            {logs.map((log) => (
              <div key={log.id} className="space-y-1">
                {log.cmd !== 'welcome' && (
                  <p className="text-muted-foreground">
                    <span className="text-emerald-400 font-bold">ankit@console:~$</span> {log.cmd}
                  </p>
                )}
                <div>{log.output}</div>
              </div>
            ))}
          </div>

          {/* Interactive Shell Input Line */}
          <form onSubmit={onFormSubmit} className="flex items-center gap-2 px-3 py-2 border-t border-border/40 bg-secondary/30 select-none flex-shrink-0">
            <span className="text-emerald-400 font-bold text-[11px]">ankit@console:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="type 'help', 'stack', 'projects', 'cat life.log'..."
              className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-foreground placeholder:text-muted-foreground/60"
            />
            <button
              type="submit"
              className="px-2 py-1 rounded bg-secondary text-foreground hover:text-accent transition-colors flex items-center gap-1 text-[10px]"
            >
              <CornerDownLeft className="w-3 h-3" />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
