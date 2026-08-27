'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from './theme-toggle'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true
    if (href !== '/' && pathname.startsWith(href)) return true
    return false
  }

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/articles', label: 'Articles' },
    { href: '/projects', label: 'Projects' },
    { href: '/moments', label: 'Moments' },
    { href: '/me', label: 'Me' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-4.5">
        {/* Brand Text Identity - /ankit */}
        <Link
          href="/"
          className="text-base font-mono font-semibold tracking-tight text-foreground hover:text-accent transition-colors py-1"
        >
          /ankit
        </Link>

        {/* Desktop Nav Items with generous spacing */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                  active ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 rounded-xl bg-secondary/80 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right side: Theme Toggle & Mobile Trigger */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-xl border border-border/60 bg-secondary/30 text-foreground"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="md:hidden overflow-hidden border-b border-border/40 bg-background/95 backdrop-blur-lg px-8 py-4"
          >
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-2.5 rounded-xl text-sm transition-colors ${
                        active
                          ? 'bg-secondary text-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
