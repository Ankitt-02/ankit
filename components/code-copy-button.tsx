'use client'

import { useState } from 'react'

export function CodeCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-3 py-1 rounded text-xs bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      title="Copy code"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
