'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [mode, setMode] = useState<'login' | 'signup' | 'magic'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const timeout = setTimeout(() => {
      setLoading(false)
      setError('Request timed out. Please check your connection and try again.')
    }, 15000)

    try {
      const supabase = createClient()

      if (mode === 'magic') {
        const { error: err } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        if (err) throw err
        setMessage('Check your email for a login link.')
        return
      }

      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        if (err) throw err
        if (data.user && !data.session) {
          setMessage('Check your email to confirm your account.')
        } else if (data.session) {
          router.push('/app')
          router.refresh()
        } else {
          setMessage('Account created. Check your email to confirm.')
        }
        return
      }

      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      router.push('/app')
      router.refresh()
    } catch (err: any) {
      const msg = err?.message || 'An error occurred. Please try again.'
      if (msg.includes('Invalid login credentials')) setError('Invalid email or password.')
      else if (msg.includes('Email not confirmed')) setError('Email not confirmed yet. Check your inbox.')
      else if (msg.includes('User already registered')) setError('Account already exists. Try signing in.')
      else if (msg.includes('rate limit')) setError('Too many attempts. Wait a moment.')
      else setError(msg)
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex bg-white/[0.04] rounded-[var(--radius-pill)] p-0.5 mb-6">
        {(['login', 'signup', 'magic'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(''); setMessage('') }}
            className={`flex-1 text-xs font-medium py-2 rounded-[10px] transition-all ${
              mode === m
                ? 'bg-[var(--accent-teal)] text-[var(--bg-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {m === 'login' ? 'Sign in' : m === 'signup' ? 'Create' : 'Magic link'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)]/50 transition-colors"
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>

        {mode !== 'magic' && (
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)]/50 transition-colors"
              placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
              minLength={6}
              disabled={loading}
            />
          </div>
        )}

        {error && (
          <div className="bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20 rounded-[var(--radius-sm)] p-3">
            <p className="text-xs text-[var(--accent-red)]">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20 rounded-[var(--radius-sm)] p-3">
            <p className="text-xs text-[var(--accent-green)]">{message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--accent-teal)] text-[var(--bg-primary)] text-sm font-semibold py-2.5 rounded-full hover:brightness-110 transition-all disabled:opacity-50"
        >
          {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send magic link'}
        </button>
      </form>
    </div>
  )
}
