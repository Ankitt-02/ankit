'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login, resetPassword } from '@/lib/supabase/auth'
import { isRedirectError } from '@/lib/db/errors'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
    } catch (err) {
      if (isRedirectError(err)) {
        throw err
      }
      console.error('[Login] Error:', err)
      setError(err instanceof Error ? err.message : 'Invalid credentials or login failure')
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResetMessage(null)
    setLoading(true)

    try {
      const result = await resetPassword(resetEmail)
      if (result?.error) {
        setError(result.error)
      } else {
        setResetMessage(result?.message || 'Password reset link sent to your email')
        setResetEmail('')
      }
    } catch (err) {
      if (isRedirectError(err)) {
        throw err
      }
      console.error('[Reset Password] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center">
            <Link href="/" className="inline-block text-lg font-mono font-bold tracking-tight hover:text-muted-foreground transition-colors">
              /ankit
            </Link>
            <p className="text-foreground/70">Admin Access</p>
          </div>

          {/* Forms */}
          {!showForgot ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                {error && (
                  <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/5 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-border/40 bg-card/50 text-foreground placeholder-foreground/50 focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-border/40 bg-card/50 text-foreground placeholder-foreground/50 focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg border border-accent/40 bg-accent/10 hover:bg-accent/20 text-foreground font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                {error && (
                  <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/5 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {resetMessage && (
                  <div className="p-4 rounded-lg border border-green-500/40 bg-green-500/5 text-sm text-green-400">
                    {resetMessage}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-border/40 bg-card/50 text-foreground placeholder-foreground/50 focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg border border-accent/40 bg-accent/10 hover:bg-accent/20 text-foreground font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {/* Toggle */}
          <div className="text-center">
            <button
              onClick={() => {
                setShowForgot(!showForgot)
                setError(null)
                setResetMessage(null)
              }}
              className="text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              {showForgot ? 'Back to login' : 'Forgot password?'}
            </button>
          </div>

          {/* Home Link */}
          <div className="text-center">
            <p className="text-sm text-foreground/70">
              <Link href="/" className="text-foreground hover:text-accent transition-colors">
                Return home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
