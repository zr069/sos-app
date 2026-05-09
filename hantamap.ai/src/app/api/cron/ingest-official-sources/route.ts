import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Cron endpoint for ingesting official source candidates.
 * Protected by CRON_SECRET.
 * Does NOT publish any public data.
 * Safe to run multiple times (deduplicates via unique constraint).
 */

// ---------- Shared helpers (inlined to avoid script imports in edge) ----------

const DISEASE_KEYWORDS = [
  'hantavirus', 'andes virus', 'andes hantavirus',
  'hemorrhagic fever', 'haemorrhagic fever',
  'avian influenza', 'bird flu', 'h5n1', 'h7n9',
  'mpox', 'monkeypox', 'ebola', 'marburg', 'cholera',
  'dengue', 'measles', 'yellow fever', 'covid', 'sars-cov-2',
  'coronavirus', 'influenza', 'plague', 'nipah', 'lassa fever',
  'zika', 'chikungunya', 'meningitis', 'diphtheria',
  'polio', 'poliovirus', 'anthrax', 'rift valley fever',
  'mers', 'hepatitis',
]

function detectKeywords(text: string): string[] {
  const lower = text.toLowerCase()
  return DISEASE_KEYWORDS.filter(kw => lower.includes(kw))
}

interface CandidateRow {
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

async function upsertCandidates(supabase: any, candidates: CandidateRow[]) {
  let imported = 0, skipped = 0, errors = 0
  for (const c of candidates) {
    const { error } = await supabase
      .from('source_candidates')
      .upsert({
        ...c,
        fetched_at: new Date().toISOString(),
      }, { onConflict: 'source_provider,external_id', ignoreDuplicates: true })
    if (error) {
      if (error.code === '23505') skipped++
      else errors++
    } else {
      imported++
    }
  }
  return { imported, skipped, errors }
}

// ---------- WHO Disease Outbreak News ----------

async function ingestWhoDon(supabase: any) {
  try {
    const res = await fetch('https://www.who.int/api/news/diseaseoutbreaknews', {
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) return { imported: 0, skipped: 0, errors: 1 }

    const data = await res.json()
    const items = Array.isArray(data) ? data : data.value || data.Data || []

    const candidates: CandidateRow[] = items.map((item: any) => {
      const id = item.Id || item.id || item.UrlName || ''
      const title = item.Title || item.title || item.Name || ''
      if (!id || !title) return null
      const urlName = item.UrlName || item.urlName || id
      const summary = item.Summary || item.summary || item.Description || null
      const searchText = `${title} ${summary || ''}`
      return {
        source_provider: 'who-don',
        external_id: String(id),
        title: String(title),
        url: `https://www.who.int/emergencies/disease-outbreak-news/${urlName}`,
        publisher: 'World Health Organization',
        published_at: item.PublicationDate || item.publicationDate ? new Date(item.PublicationDate || item.publicationDate).toISOString() : null,
        raw_payload: item,
        extracted_summary: summary ? String(summary).slice(0, 2000) : null,
        detected_keywords: detectKeywords(searchText),
        detected_countries: [],
      }
    }).filter(Boolean) as CandidateRow[]

    return await upsertCandidates(supabase, candidates)
  } catch {
    return { imported: 0, skipped: 0, errors: 1 }
  }
}

// ---------- WHO Emergencies ----------

async function ingestWhoEmergencies(supabase: any) {
  try {
    const res = await fetch('https://www.who.int/api/emergencies/diseaseoutbreaknews', {
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) return { imported: 0, skipped: 0, errors: 1 }

    const data = await res.json()
    const items = Array.isArray(data) ? data : data.value || data.Data || []

    const candidates: CandidateRow[] = items.map((item: any) => {
      const id = item.Id || item.id || item.UrlName || ''
      const title = item.Title || item.title || item.Name || ''
      if (!id || !title) return null
      const urlName = item.UrlName || item.urlName || id
      const summary = item.Summary || item.summary || null
      const searchText = `${title} ${summary || ''}`
      return {
        source_provider: 'who-emergencies',
        external_id: String(id),
        title: String(title),
        url: `https://www.who.int/emergencies/disease-outbreak-news/${urlName}`,
        publisher: 'World Health Organization',
        published_at: item.PublicationDate || item.publicationDate ? new Date(item.PublicationDate || item.publicationDate).toISOString() : null,
        raw_payload: item,
        extracted_summary: summary ? String(summary).slice(0, 2000) : null,
        detected_keywords: detectKeywords(searchText),
        detected_countries: [],
      }
    }).filter(Boolean) as CandidateRow[]

    return await upsertCandidates(supabase, candidates)
  } catch {
    return { imported: 0, skipped: 0, errors: 1 }
  }
}

// ---------- CDC Travel Notices RSS ----------

async function ingestCdc(supabase: any) {
  try {
    const res = await fetch('https://wwwnc.cdc.gov/travel/rss/notices.xml')
    if (!res.ok) return { imported: 0, skipped: 0, errors: 1 }

    const xml = await res.text()
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    const candidates: CandidateRow[] = []
    let match

    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1]
      const getField = (tag: string) => {
        const r = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([^<]*)</${tag}>`, 'i')
        const m = block.match(r)
        return m ? (m[1] || m[2] || '').trim() : ''
      }

      const title = getField('title')
      const link = getField('link')
      const description = getField('description')
      const pubDate = getField('pubDate')
      const guid = getField('guid') || link || title

      if (!title) continue

      const searchText = `${title} ${description}`
      candidates.push({
        source_provider: 'cdc-travel',
        external_id: guid,
        title,
        url: link || null,
        publisher: 'Centers for Disease Control and Prevention',
        published_at: pubDate ? new Date(pubDate).toISOString() : null,
        raw_payload: { title, link, description, pubDate, guid },
        extracted_summary: description ? description.slice(0, 2000) : null,
        detected_keywords: detectKeywords(searchText),
        detected_countries: [],
      })
    }

    return await upsertCandidates(supabase, candidates)
  } catch {
    return { imported: 0, skipped: 0, errors: 1 }
  }
}

// ---------- ReliefWeb ----------

async function ingestReliefWeb(supabase: any) {
  // ReliefWeb v2 API requires an approved appname.
  // If RELIEFWEB_APPNAME is not set, skip gracefully (not an error).
  const appname = process.env.RELIEFWEB_APPNAME
  if (!appname) {
    return { imported: 0, skipped: 0, errors: 0 }
  }

  try {
    const res = await fetch(
      `https://api.reliefweb.int/v2/reports?appname=${encodeURIComponent(appname)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset: 'latest',
          limit: 50,
          fields: {
            include: ['title', 'url_alias', 'source', 'date', 'country'],
          },
          filter: { field: 'theme.name', value: 'Health' },
        }),
      }
    )

    if (res.status === 403) return { imported: 0, skipped: 0, errors: 0 }
    if (!res.ok) return { imported: 0, skipped: 0, errors: 1 }

    const data = await res.json()
    const items = data.data || []

    const candidates: CandidateRow[] = items.map((item: any) => {
      const fields = item.fields || {}
      const title = fields.title
      if (!title) return null

      const urlAlias = fields.url_alias
      const url = urlAlias ? `https://reliefweb.int${urlAlias}` : `https://reliefweb.int/node/${item.id}`
      const sources = fields.source || []
      const publisher = Array.isArray(sources) && sources.length > 0
        ? sources.map((s: any) => s.name).filter(Boolean).join(', ')
        : 'ReliefWeb (OCHA)'

      const countries = fields.country || []
      const countryNames = Array.isArray(countries)
        ? countries.map((c: any) => c.name).filter(Boolean)
        : []

      const dateFields = fields.date || {}
      const publishedAt = dateFields.created || dateFields.original || null
      const searchText = [title, ...countryNames].join(' ')

      return {
        source_provider: 'reliefweb',
        external_id: String(item.id),
        title: String(title),
        url,
        publisher,
        published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
        raw_payload: item,
        extracted_summary: null,
        detected_keywords: detectKeywords(searchText),
        detected_countries: [...new Set(countryNames)],
      }
    }).filter(Boolean) as CandidateRow[]

    return await upsertCandidates(supabase, candidates)
  } catch {
    return { imported: 0, skipped: 0, errors: 1 }
  }
}

// ---------- Main handler ----------

export async function GET(request: NextRequest) {
  // Verify CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured.' },
      { status: 503 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized.' },
      { status: 401 }
    )
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json(
      { error: 'Supabase is not configured.' },
      { status: 503 }
    )
  }

  const supabase = createClient(url, key)

  const results: Record<string, { imported: number; skipped: number; errors: number }> = {}

  results['who-don'] = await ingestWhoDon(supabase)
  results['who-emergencies'] = await ingestWhoEmergencies(supabase)
  results['cdc-travel'] = await ingestCdc(supabase)
  results['reliefweb'] = await ingestReliefWeb(supabase)

  let totalImported = 0
  let totalErrors = 0
  for (const r of Object.values(results)) {
    totalImported += r.imported
    totalErrors += r.errors
  }

  return NextResponse.json({
    success: totalErrors === 0,
    timestamp: new Date().toISOString(),
    total_imported: totalImported,
    total_errors: totalErrors,
    providers: results,
  })
}
