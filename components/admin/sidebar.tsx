'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, FolderOpen, Sparkles, Image as ImageIcon, Tag as TagIcon, Cpu, Settings, LogOut } from 'lucide-react'
import { logout } from '@/lib/supabase/auth'
import { useState } from 'react'

export function AdminSidebar() {
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = useState(false)

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin'
    return pathname.startsWith(path)
  }

  const sections = [
    {
      title: 'CONTENT',
      items: [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/articles', label: 'Articles', icon: FileText },
        { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
        { href: '/admin/moments', label: 'Moments', icon: Sparkles },
      ],
    },
    {
      title: 'LIBRARY',
      items: [
        { href: '/admin/media', label: 'Media', icon: ImageIcon },
        { href: '/admin/tags', label: 'Tags', icon: TagIcon },
        { href: '/admin/technologies', label: 'Technologies', icon: Cpu },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { href: '/admin/settings', label: 'Profile & Settings', icon: Settings },
      ],
    },
  ]

  const handleSignOut = async () => {
    setLoggingOut(true)
    await logout()
  }

  return (
    <aside className="hidden md:flex w-64 bg-card/60 border-r border-border/40 flex-col h-screen sticky top-0">
      {/* Header / Logo */}
      <div className="p-5 border-b border-border/40">
        <Link href="/admin" className="text-base font-mono font-bold tracking-tight hover:text-muted-foreground transition-colors flex items-center justify-between">
          <span>/ankit</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/10 border border-accent/30 text-accent uppercase tracking-wider">CMS</span>
        </Link>
        <p className="text-[11px] text-muted-foreground mt-0.5">Admin Management System</p>
      </div>

      {/* Navigation Grouped */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h3 className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-widest px-3">
              {section.title}
            </h3>
            {section.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    active
                      ? 'bg-secondary text-foreground font-semibold border border-border/60'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  }`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border/40 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between text-xs px-3 py-2 rounded-xl border border-border/60 hover:border-border bg-card/50 hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
        >
          <span>View Website</span>
          <span>↗</span>
        </Link>
        
        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 text-xs px-3 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          <LogOut size={14} />
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </aside>
  )
}
