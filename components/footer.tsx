'use client'

import Link from 'next/link'
import { GithubIcon, LinkedinIcon, InstagramIcon, TwitterIcon } from '@/components/social-icons'
import { Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-12 transition-colors duration-300">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-border/30">
          <div>
            <span className="font-mono text-base font-semibold tracking-tight text-foreground">/ankit</span>
            <p className="text-xs text-muted-foreground mt-0.5 font-light">
              Personal portfolio, software projects, and writing by Ankit.
            </p>
          </div>

          {/* Canonical Nav Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/articles" className="hover:text-foreground transition-colors">
              Articles
            </Link>
            <Link href="/projects" className="hover:text-foreground transition-colors">
              Projects
            </Link>
            <Link href="/moments" className="hover:text-foreground transition-colors">
              Moments
            </Link>
            <Link href="/me" className="hover:text-foreground transition-colors">
              Me
            </Link>
          </div>
        </div>

        <div className="pt-6 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Ankit. All rights reserved.</p>

          {/* Social Links Row */}
          <div className="flex items-center gap-4 text-muted-foreground">
            <a
              href="https://github.com/Ankitt-02"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="hover:text-foreground transition-colors"
            >
              <GithubIcon size={16} />
            </a>
            <a
              href="https://www.linkedin.com/in/ankit-swami-161b80301/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="hover:text-foreground transition-colors"
            >
              <LinkedinIcon size={16} />
            </a>
            <a
              href="https://x.com/AnkitSwami66750"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter / X"
              className="hover:text-foreground transition-colors"
            >
              <TwitterIcon size={16} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="hover:text-foreground transition-colors"
            >
              <InstagramIcon size={16} />
            </a>
            <a
              href="mailto:swamiankit603@gmail.com"
              aria-label="Email"
              className="hover:text-foreground transition-colors"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
