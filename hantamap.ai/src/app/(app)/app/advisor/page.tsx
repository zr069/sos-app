import { AdvisorChat } from './advisor-chat'
import { DisclaimerBox } from '@/components/ui/disclaimer-box'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Advisor',
}

export default function AdvisorPage() {
  const hasApiKey = !!process.env.OPENAI_API_KEY

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900 mb-2">AI Advisor</h1>
      <p className="text-sm text-slate-500 mb-6">
        Ask questions about outbreaks, preparedness and health guidance. The advisor uses verified HantaMap data and official health guidance only.
      </p>

      <DisclaimerBox text="The AI advisor does not diagnose medical conditions, provide emergency medical instructions or replace professional medical advice. If you are experiencing severe symptoms, contact emergency services immediately. The advisor distinguishes between confirmed information and uncertainty, and always recommends consulting official health authorities for medical decisions." />

      <div className="mt-6">
        {hasApiKey ? (
          <AdvisorChat />
        ) : (
          <div className="border border-dashed border-slate-200 rounded p-8 text-center">
            <p className="text-sm font-medium text-slate-500">AI advisor is not configured yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              An API key for the AI model needs to be configured to enable this feature.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
