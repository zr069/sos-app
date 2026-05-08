import { DisclaimerBox } from '@/components/ui/disclaimer-box'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'About HantaMap.ai: how outbreak data is verified, our source hierarchy, limitations and editorial policy.',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">About HantaMap.ai</h1>

      <div className="prose prose-slate prose-sm max-w-none space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">What is HantaMap</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            HantaMap.ai is a real-time outbreak intelligence platform. It collects, verifies and presents health outbreak data from official sources. The goal is to help people understand global health risks through clear maps, verified updates and calm preparedness guidance.
          </p>
          <p className="text-sm text-slate-700 leading-relaxed mt-2">
            HantaMap is not a health authority. It does not generate case numbers, diagnose conditions or replace medical advice. All data shown on the platform is sourced from public health organizations and scientific institutions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Data verification</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Every outbreak report and update published on HantaMap must include at least one verifiable source with a URL, publisher name and publication date. Reports are assigned a verification status:
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            <li><strong>Verified:</strong> confirmed by an official health authority (WHO, ECDC, CDC or equivalent)</li>
            <li><strong>Probable:</strong> supported by credible evidence, pending official confirmation</li>
            <li><strong>Suspected:</strong> under investigation, not yet confirmed by authorities</li>
            <li><strong>Disputed:</strong> conflicting reports from multiple sources</li>
            <li><strong>Retracted:</strong> previously published data that has been withdrawn or corrected</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Source hierarchy</h2>
          <p className="text-sm text-slate-700 leading-relaxed mb-2">
            HantaMap prioritizes sources in this order:
          </p>
          <ol className="space-y-1 text-sm text-slate-700 list-decimal list-inside">
            <li>World Health Organization (WHO)</li>
            <li>European Centre for Disease Prevention and Control (ECDC)</li>
            <li>Centers for Disease Control and Prevention (CDC)</li>
            <li>National health ministries</li>
            <li>Regional health authorities</li>
            <li>Peer-reviewed scientific institutions</li>
            <li>Reputable media (for context only, not as primary case count source)</li>
          </ol>
          <p className="text-sm text-slate-700 leading-relaxed mt-2">
            When sources conflict, HantaMap marks the data as &quot;disputed&quot; or &quot;conflicting reports&quot; rather than choosing one source silently.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Limitations</h2>
          <ul className="space-y-1.5 text-sm text-slate-700">
            <li>HantaMap does not provide medical diagnosis or emergency medical advice.</li>
            <li>Case numbers may lag behind real-time conditions due to reporting delays.</li>
            <li>Data completeness depends on what official sources publish.</li>
            <li>If a number is marked &quot;Unknown&quot;, it means the data is not available, not that it is zero.</li>
            <li>Zero means verified zero. Unknown means not available.</li>
            <li>Risk assessments in the personal area are rule-based and conservative. They do not represent personal medical risk scores.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Editorial policy</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            HantaMap uses calm, precise, non-alarmist language. We avoid fear-based framing and sensationalist terms. Our editorial standard is data-first reporting with clear attribution.
          </p>
          <p className="text-sm text-slate-700 leading-relaxed mt-2">
            If you find an error, outdated information or a missing source, please contact us at corrections@hantamap.ai.
          </p>
        </section>

        <section id="privacy">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Privacy</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            HantaMap collects only the information needed to provide its services. Personal data (saved regions, travel plans, preparedness checklists) is stored securely and is not shared with third parties. We do not collect sensitive medical history unless explicitly provided by the user.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Contact</h2>
          <div className="space-y-1 text-sm text-slate-700">
            <p>Corrections: <a href="mailto:corrections@hantamap.ai" className="underline hover:text-slate-900">corrections@hantamap.ai</a></p>
            <p>Press: <a href="mailto:press@hantamap.ai" className="underline hover:text-slate-900">press@hantamap.ai</a></p>
          </div>
        </section>
      </div>

      <div className="mt-12">
        <DisclaimerBox text="HantaMap does not provide medical diagnosis or emergency medical advice. Always consult a healthcare professional for medical decisions. If you are experiencing a medical emergency, contact your local emergency services immediately." />
      </div>
    </div>
  )
}
