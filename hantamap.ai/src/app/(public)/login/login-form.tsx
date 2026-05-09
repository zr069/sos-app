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

    // Timeout safety: never spin longer than 15 seconds
    const timeout = setTimeout(() => {
      setLoading(false)
      setError('Request timed out. Please check your connection and try again.')
    }, 15000)

    try {
      const supabase = createClient()

      if (mode === 'magic') {
        const { error: err } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (err) throw err
        setMessage('Check your email for a login link.')
        return
      }

      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (err) throw err

        // Check if email confirmation is required
        if (data.user && !data.session) {
          setMessage('Check your email to confirm your account.')
        } else if (data.session) {
          // Auto-confirmed: redirect to app
          router.push('/app')
          router.refresh()
        } else {
          setMessage('Account created. Check your email to confirm.')
        }
        return
      }

      // Login mode
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (err) throw err
      router.push('/app')
      router.refresh()
    } catch (err: any) {
      const msg = err?.message || 'An error occurred. Please try again.'
      // Make common Supabase errors more readable
      if (msg.includes('Invalid login credentials')) {
        setError('Invalid email or password.')
      } else if (msg.includes('Email not confirmed')) {
        setError('Your email has not been confirmed yet. Check your inbox for a confirmation link.')
      } else if (msg.includes('User already registered')) {
        setError('An account with this email already exists. Try signing in instead.')
      } else if (msg.includes('rate limit')) {
        setError('Too many attempts. Please wait a moment and try again.')
      } else {
        setError(msg)
      }
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex border border-slate-200 rounded mb-6 overflow-hidden">
        <button
          type="button"
          onClick={() => { setMode('login'); setError(''); setMessage('') }}
          className={`flex-1 text-xs font-medium py-2 transition-colors ${
            mode === 'login' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(''); setMessage('') }}
          className={`flex-1 text-xs font-medium py-2 transition-colors ${
            mode === 'signup' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Create account
        </button>
        <button
          type="button"
          onClick={() => { setMode('magic'); setError(''); setMessage('') }}
          className={`flex-1 text-xs font-medium py-2 transition-colors ${
            mode === 'magic' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Magic link
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>

        {mode !== 'magic' && (
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
              placeholder={mode === 'signup' ? 'Choose a password (min. 6 characters)' : 'Your password'}
              minLength={6}
              disabled={loading}
            />
          </div>
        )}

        {error && (
          <div className="border border-red-200 rounded p-3 bg-red-50">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {message && (
          <div className="border border-emerald-200 rounded p-3 bg-emerald-50">
            <p className="text-xs text-emerald-700">{message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white text-sm font-medium py-2.5 rounded hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {loading
            ? 'Loading...'
            : mode === 'login'
            ? 'Sign in'
            : mode === 'signup'
            ? 'Create account'
            : 'Send magic link'}
        </button>
      </form>
    </div>
  )
}
