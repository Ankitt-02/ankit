import { getUser } from '@/lib/supabase/auth'
import { getDatabaseStats } from '@/lib/db/statistics'
import Link from 'next/link'
import { Plus, FileText, FolderOpen, Sparkles, Image, Tag as TagIcon, Cpu } from 'lucide-react'

export default async function AdminDashboard() {
  const user = await getUser()
  const stats = await getDatabaseStats()

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-foreground/70 text-sm mt-1">Logged in as {user?.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            <span>New Article</span>
          </Link>
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-lg border border-border/60 bg-card/50 hover:bg-card text-foreground font-medium transition-colors"
          >
            <Plus size={14} />
            <span>New Project</span>
          </Link>
          <Link
            href="/admin/moments/new"
            className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-lg border border-border/60 bg-card/50 hover:bg-card text-foreground font-medium transition-colors"
          >
            <Plus size={14} />
            <span>New Moment</span>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl border border-border/40 bg-card/40">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Articles</span>
            <FileText size={18} />
          </div>
          <p className="text-3xl font-bold">{stats.totalArticles}</p>
          <div className="flex items-center gap-2 text-xs mt-2">
            <span className="text-green-400 font-medium">{stats.publishedArticles} published</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-amber-400 font-medium">{stats.draftArticles} drafts</span>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border/40 bg-card/40">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Projects</span>
            <FolderOpen size={18} />
          </div>
          <p className="text-3xl font-bold">{stats.totalProjects}</p>
          <p className="text-xs text-green-400 font-medium mt-2">{stats.publishedProjects} published</p>
        </div>

        <div className="p-6 rounded-xl border border-border/40 bg-card/40">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Moments</span>
            <Sparkles size={18} />
          </div>
          <p className="text-3xl font-bold">{stats.totalMoments}</p>
          <p className="text-xs text-green-400 font-medium mt-2">{stats.publishedMoments} published</p>
        </div>

        <div className="p-6 rounded-xl border border-border/40 bg-card/40">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Media Files</span>
            <Image size={18} />
          </div>
          <p className="text-3xl font-bold">{stats.totalMedia}</p>
          <p className="text-xs text-muted-foreground mt-2">Uploaded in Supabase Storage</p>
        </div>
      </div>

      {/* Secondary Stats & Quick Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border/40 bg-card/40 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Taxonomy Summary</h2>
            <div className="flex gap-2">
              <Link href="/admin/tags" className="text-xs text-accent hover:underline">Manage Tags</Link>
              <span className="text-xs text-muted-foreground">•</span>
              <Link href="/admin/technologies" className="text-xs text-accent hover:underline">Manage Tech</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-background/50 border border-border/30 flex items-center gap-3">
              <TagIcon size={20} className="text-accent" />
              <div>
                <p className="text-2xl font-bold">{stats.totalTags}</p>
                <p className="text-xs text-muted-foreground">Total Tags</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border/30 flex items-center gap-3">
              <Cpu size={20} className="text-accent" />
              <div>
                <p className="text-2xl font-bold">{stats.totalTechnologies}</p>
                <p className="text-xs text-muted-foreground">Technologies</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border/40 bg-card/40 space-y-4">
          <h2 className="text-base font-semibold">Quick Shortcuts</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link
              href="/admin/articles"
              className="p-3 rounded-lg border border-border/30 bg-background/40 hover:bg-card transition-colors font-medium flex items-center justify-between"
            >
              <span>Manage Articles</span>
              <span>→</span>
            </Link>
            <Link
              href="/admin/projects"
              className="p-3 rounded-lg border border-border/30 bg-background/40 hover:bg-card transition-colors font-medium flex items-center justify-between"
            >
              <span>Manage Projects</span>
              <span>→</span>
            </Link>
            <Link
              href="/admin/moments"
              className="p-3 rounded-lg border border-border/30 bg-background/40 hover:bg-card transition-colors font-medium flex items-center justify-between"
            >
              <span>Manage Moments</span>
              <span>→</span>
            </Link>
            <Link
              href="/admin/media"
              className="p-3 rounded-lg border border-border/30 bg-background/40 hover:bg-card transition-colors font-medium flex items-center justify-between"
            >
              <span>Media Gallery</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
