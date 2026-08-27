'use client'

import { logout } from '@/lib/supabase/auth'
import { LogOut, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AdminHeaderProps {
  user: SupabaseUser | null
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="hidden md:flex h-16 items-center justify-between border-b border-border/40 bg-background/50 px-6 backdrop-blur-sm">
      {/* Right Side */}
      <div className="flex items-center gap-6 ml-auto">
        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card/50 border border-border/40">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 border border-accent/40">
              <User size={16} className="text-accent" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 hover:border-red-500/40 bg-card/50 hover:bg-red-500/5 text-foreground/70 hover:text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </form>
      </div>
    </header>
  )
}
