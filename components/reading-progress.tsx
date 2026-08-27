'use client'

import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('article')
      if (!article) return

      const { top, height } = article.getBoundingClientRect()
      const viewportHeight = window.innerHeight

      // Calculate reading progress
      let percentageRead = 0
      if (top < 0) {
        percentageRead = Math.min(100, Math.abs(top) / (height - viewportHeight) * 100)
      }

      setProgress(percentageRead)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-accent to-accent/50 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
  )
}
