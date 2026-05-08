import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to HantaMap.ai for personalized outbreak tracking, saved regions and preparedness checklists.',
  robots: 'noindex',
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-slate-900">Sign in to HantaMap</h1>
        <p className="text-sm text-slate-500 mt-2">
          Access your personal dashboard, saved regions and preparedness checklist.
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
