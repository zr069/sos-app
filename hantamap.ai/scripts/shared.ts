import { createClient } from '@supabase/supabase-js'

// ---------- Supabase client (service role for ingestion) ----------

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.')
  }
  return createClient(url, key)
}

// ---------- Disease keyword list ----------

export const DISEASE_KEYWORDS = [
  'hantavirus', 'andes virus', 'andes hantavirus',
  'hemorrhagic fever', 'haemorrhagic fever',
  'avian influenza', 'bird flu', 'h5n1', 'h7n9',
  'mpox', 'monkeypox',
  'ebola',
  'marburg',
  'cholera',
  'dengue',
  'measles',
  'yellow fever',
  'covid', 'sars-cov-2', 'coronavirus',
  'influenza',
  'plague',
  'nipah',
  'lassa fever',
  'zika',
  'chikungunya',
  'meningitis',
  'diphtheria',
  'polio', 'poliovirus',
  'anthrax',
  'rift valley fever',
  'mers',
  'hepatitis',
]

// ---------- Country list (ISO names, subset for detection) ----------

export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bangladesh', 'Belarus', 'Belgium',
  'Benin', 'Bolivia', 'Bosnia', 'Botswana', 'Brazil', 'Bulgaria',
  'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada',
  'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
  'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
  'Czech Republic', 'Denmark', 'Djibouti', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea',
  'Estonia', 'Eswatini', 'Ethiopia', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala',
  'Guinea', 'Guinea-Bissau', 'Haiti', 'Honduras', 'Hungary', 'Iceland',
  'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
  'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho',
  'Liberia', 'Libya', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi',
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania', 'Mauritius',
  'Mexico', 'Moldova', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique',
  'Myanmar', 'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua',
  'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay',
  'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Rwanda', 'Saudi Arabia', 'Senegal', 'Serbia',
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka',
  'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
  'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Trinidad and Tobago',
  'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
  // Common alternate names
  'DRC', 'DR Congo', 'Democratic Republic of the Congo',
  'Republic of the Congo', 'USA', 'UK', 'UAE',
]

// ---------- Detection helpers ----------

export function detectKeywords(text: string): string[] {
  const lower = text.toLowerCase()
  return DISEASE_KEYWORDS.filter(kw => lower.includes(kw))
}

export function detectCountries(text: string): string[] {
  return COUNTRIES.filter(country => {
    // Word boundary match to avoid false positives (e.g. "Niger" in "Nigeria")
    const escaped = country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'i')
    return regex.test(text)
  })
}

// ---------- MVP topic filter ----------

// Inline the topic config to avoid importing from src/ in scripts
const MVP_ALLOWED_KEYWORDS = [
  'hantavirus', 'hanta virus', 'andes virus', 'andes hantavirus',
  'orthohantavirus', 'hantavirus pulmonary syndrome',
  'hantavirus cardiopulmonary syndrome', 'hps', 'hcps',
  'hemorrhagic fever with renal syndrome',
  'haemorrhagic fever with renal syndrome', 'hfrs', 'hondius',
]
const MVP_CONTEXT_REQUIRED = ['hps', 'hcps', 'hfrs', 'hondius']
const MVP_UNAMBIGUOUS = MVP_ALLOWED_KEYWORDS.filter(
  kw => !MVP_CONTEXT_REQUIRED.includes(kw)
)

export function isMvpRelevant(text: string): boolean {
  const lower = text.toLowerCase()
  for (const kw of MVP_UNAMBIGUOUS) {
    if (lower.includes(kw)) return true
  }
  for (const term of MVP_CONTEXT_REQUIRED) {
    if (lower.includes(term)) {
      if (MVP_UNAMBIGUOUS.some(kw => lower.includes(kw))) return true
    }
  }
  return false
}

// ---------- Upsert helper ----------

export interface CandidateRow {
  source_provider: string
  external_id: string
  title: string
  url: string | null
  publisher: string
  published_at: string | null
  raw_payload: any
  extracted_summary: string | null
  detected_keywords: string[]
  detected_countries: string[]
}

export async function upsertCandidates(
  supabase: ReturnType<typeof getSupabase>,
  candidates: CandidateRow[]
): Promise<{ imported: number; skipped: number; skipped_irrelevant: number; errors: number }> {
  let imported = 0
  let skipped = 0
  let skipped_irrelevant = 0
  let errors = 0

  for (const c of candidates) {
    // MVP topic filter: only import hantavirus-related candidates
    const searchText = [
      c.title,
      c.extracted_summary || '',
      JSON.stringify(c.raw_payload || ''),
    ].join(' ')

    if (!isMvpRelevant(searchText)) {
      skipped_irrelevant++
      continue
    }

    const { error } = await supabase
      .from('source_candidates')
      .upsert(
        {
          source_provider: c.source_provider,
          external_id: c.external_id,
          title: c.title,
          url: c.url,
          publisher: c.publisher,
          published_at: c.published_at,
          fetched_at: new Date().toISOString(),
          raw_payload: c.raw_payload,
          extracted_summary: c.extracted_summary,
          detected_keywords: c.detected_keywords,
          detected_countries: c.detected_countries,
        },
        { onConflict: 'source_provider,external_id', ignoreDuplicates: true }
      )

    if (error) {
      if (error.code === '23505') {
        skipped++
      } else {
        console.error(`  Error inserting "${c.title}": ${error.message}`)
        errors++
      }
    } else {
      imported++
    }
  }

  return { imported, skipped, skipped_irrelevant, errors }
}

export function log(provider: string, msg: string) {
  console.log(`[${provider}] ${msg}`)
}
