'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function BrandMark({ size = 'md', className = '' }: BrandMarkProps) {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }

  return (
    <Link href="/" className={`inline-flex items-center group ${className}`}>
      <motion.div
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={`${sizeMap[size]} rounded-xl border border-border/80 bg-card hover:border-neutral-400 dark:hover:border-neutral-500 flex items-center justify-center transition-colors duration-200 shadow-2xs`}
      >
        <span className="font-serif font-bold text-foreground group-hover:text-accent transition-colors duration-200 italic tracking-tight select-none">
          a
        </span>
      </motion.div>
    </Link>
  )
}
