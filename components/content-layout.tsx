import React from 'react'

export function ContentLayout({
  children,
  title,
  description,
}: {
  children: React.ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-5xl px-6 py-12 md:py-20">
        <header className="mb-12 pb-8 border-b border-border/40 space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl font-light">
              {description}
            </p>
          )}
        </header>
        {children}
      </div>
    </div>
  )
}
