'use client'

import { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Extract headings from the article
    const headingElements = document.querySelectorAll('.prose-content h2, .prose-content h3')
    const extractedHeadings: Heading[] = []

    headingElements.forEach((heading, index) => {
      const level = parseInt(heading.tagName[1])
      const text = heading.textContent || ''
      const id = heading.id || `heading-${index}`
      heading.id = id
      extractedHeadings.push({ id, text, level })
    })

    setHeadings(extractedHeadings)

    // Set up intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '0px 0px -50% 0px' }
    )

    headingElements.forEach((heading) => {
      observer.observe(heading)
    })

    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null

  return (
    <nav className="sticky top-20 hidden lg:block">
      <div className="space-y-2 text-sm">
        <p className="font-semibold text-xs uppercase text-muted-foreground tracking-wide">On this page</p>
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
            >
              <a
                href={`#${heading.id}`}
                className={`block py-1 transition-colors ${
                  activeId === heading.id
                    ? 'text-accent font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
