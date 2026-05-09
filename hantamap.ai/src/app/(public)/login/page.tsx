import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to HantaMap for personalized Hantavirus tracking and alerts.',
  robots: 'noindex',
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[var(--bg-panel)] border border-white/[0.06] rounded-[var(--radius-large)] p-8">
          <div className="text-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-teal)] flex items-center justify-center mx-auto mb-4">
              <span className="text-[var(--bg-primary)] text-sm font-black">H</span>
            </div>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">Sign in to HantaMap</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Personal dashboard, saved regions and preparedness tools.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
