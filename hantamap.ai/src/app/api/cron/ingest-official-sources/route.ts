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

// MVP topic filter: Hantavirus only
const MVP_UNAMBIGUOUS = [
  'hantavirus', 'hanta virus', 'andes virus', 'andes hantavirus',
  'orthohantavirus', 'hantavirus pulmonary syndrome',
  'hantavirus cardiopulmonary syndrome',
  'hemorrhagic fever with renal syndrome',
  'haemorrhagic fever with renal syndrome',
]
const MVP_CONTEXT_REQUIRED = ['hps', 'hcps', 'hfrs', 'hondius']

function isMvpRelevant(text: string): boolean {
  const lower = text.toLowerCase()
  for (const kw of MVP_UNAMBIGUOUS) {
    if (lower.includes(kw)) return true
  }
  for (const term of MVP_CONTEXT_REQUIRED) {
    if (lower.includes(term) && MVP_UNAMBIGUOUS.some(kw => lower.includes(kw))) return true
  }
  return false
}

function detectKeywords(text: string): string[] {
  const lower = text.toLowerCase()
  const all = [...MVP_UNAMBIGUOUS, ...MVP_CONTEXT_REQUIRED]
  return all.filter(kw => lower.includes(kw))
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
  let imported = 0, skipped = 0, skipped_irrelevant = 0, errors = 0
  for (const c of candidates) {
    const searchText = [c.title, c.extracted_summary || '', JSON.stringify(c.raw_payload || '')].join(' ')
    if (!isMvpRelevant(searchText)) {
      skipped_irrelevant++
      continue
    }
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
  return { imported, skipped, skipped_irrelevant, errors }
}

// ---------- WHO Disease Outbreak News ----------

async function ingestWhoDon(supabase: any) {
  try {
    const res = await fetch('https://www.who.int/api/news/diseaseoutbreaknews', {
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) return { imported: 0, skipped: 0, skipped_irrelevant: 0, errors: 1 }

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
    return { imported: 0, skipped: 0, skipped_irrelevant: 0, errors: 1 }
  }
}

// ---------- WHO Emergencies ----------

async function ingestWhoEmergencies(supabase: any) {
  try {
    const res = await fetch('https://www.who.int/api/emergencies/diseaseoutbreaknews', {
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) return { imported: 0, skipped: 0, skipped_irrelevant: 0, errors: 1 }

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
    return { imported: 0, skipped: 0, skipped_irrelevant: 0, errors: 1 }
  }
}

// ---------- CDC Travel Notices RSS ----------

async function ingestCdc(supabase: any) {
  try {
    const res = await fetch('https://wwwnc.cdc.gov/travel/rss/notices.xml')
    if (!res.ok) return { imported: 0, skipped: 0, skipped_irrelevant: 0, errors: 1 }

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
    return { imported: 0, skipped: 0, skipped_irrelevant: 0, errors: 1 }
  }
}

// ---------- ReliefWeb ----------

async function ingestReliefWeb(supabase: any) {
  // ReliefWeb v2 API requires an approved appname.
  // If RELIEFWEB_APPNAME is not set, skip gracefully (not an error).
  const appname = process.env.RELIEFWEB_APPNAME
  if (!appname) {
    return { imported: 0, skipped: 0, skipped_irrelevant: 0, errors: 0 }
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

    if (res.status === 403) return { imported: 0, skipped: 0, skipped_irrelevant: 0, errors: 0 }
    if (!res.ok) return { imported: 0, skipped: 0, skipped_irrelevant: 0, errors: 1 }

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
    return { imported: 0, skipped: 0, skipped_irrelevant: 0, errors: 1 }
  }
}

// ---------- Google News Media Monitoring ----------

const GOOGLE_NEWS_QUERIES = [
  'hantavirus OR "hanta virus"',
  '"Andes virus" OR "Andes hantavirus"',
  '"MV Hondius" hantavirus',
]

const HIGH_CONFIDENCE = [
  'reuters', 'associated press', 'ap news', 'bbc', 'cnn',
  'the guardian', 'financial times', 'new york times', 'washington post',
  'deutsche welle', 'dw', 'euronews', 'sky news', 'al jazeera',
  'abc news', 'nbc news', 'france 24', 'bloomberg', 'politico',
]

function parseGoogleNewsItems(xml: string) {
  const items: Array<{ title: string; link: string; pubDate: string; guid: string; publisher: string; cleanTitle: string; description: string }> = []
  const re = /<item>([\s\S]*?)<\/item>/gi
  let m
  while ((m = re.exec(xml)) !== null) {
    const b = m[1]
    const getF = (t: string) => {
      const r2 = new RegExp(`<${t}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${t}>|<${t}[^>]*>([^<]*)</${t}>`, 'i')
      const m2 = b.match(r2)
      return m2 ? (m2[1] || m2[2] || '').trim() : ''
    }
    const rawTitle = getF('title')
    const link = getF('link')
    const pubDate = getF('pubDate')
    const description = getF('description')
    const guid = getF('guid') || link
    const dashIdx = rawTitle.lastIndexOf(' - ')
    const publisher = dashIdx > 0 ? rawTitle.slice(dashIdx + 3).trim() : 'Unknown'
    const cleanTitle = dashIdx > 0 ? rawTitle.slice(0, dashIdx).trim() : rawTitle
    if (cleanTitle && link) items.push({ title: rawTitle, cleanTitle, link, pubDate, description, guid, publisher })
  }
  return items
}

async function ingestGoogleNewsCron(supabase: any) {
  const MAX_AGE = 10 * 24 * 60 * 60 * 1000
  const cutoff = Date.now() - MAX_AGE
  let imported = 0, skipped = 0, skipped_irrelevant = 0, errors = 0
  const seen = new Set<string>()

  for (const q of GOOGLE_NEWS_QUERIES) {
    try {
      const res = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en&gl=US&ceid=US:en`, {
        headers: { 'User-Agent': 'HantaMap.ai/1.0' },
      })
      if (!res.ok) continue
      const xml = await res.text()
      const items = parseGoogleNewsItems(xml)

      for (const item of items) {
        if (seen.has(item.guid)) continue
        seen.add(item.guid)

        let pub: Date | null = null
        try { pub = new Date(item.pubDate); if (isNaN(pub.getTime())) pub = null } catch { pub = null }
        if (!pub || pub.getTime() < cutoff) continue

        const text = `${item.cleanTitle} ${item.description} ${item.publisher}`
        if (!isMvpRelevant(text)) { skipped_irrelevant++; continue }

        const conf = HIGH_CONFIDENCE.some(p => item.publisher.toLowerCase().includes(p)) ? 'high' : 'medium'
        const desc = item.description ? item.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000) : null

        const { error } = await supabase.from('source_candidates').upsert({
          source_provider: 'google-news',
          external_id: item.guid,
          title: item.cleanTitle,
          url: item.link,
          publisher: item.publisher,
          published_at: pub.toISOString(),
          fetched_at: new Date().toISOString(),
          raw_payload: { original_title: item.title, description: item.description, query: q },
          extracted_summary: desc,
          detected_keywords: detectKeywords(text),
          detected_countries: [],
          source_type: 'media',
          confidence_level: conf,
          original_publisher: item.publisher,
          aggregator_source: 'Google News',
          is_public: conf === 'high',
        }, { onConflict: 'source_provider,external_id', ignoreDuplicates: true })

        if (error) { if (error.code === '23505') skipped++; else errors++ }
        else imported++
      }
    } catch { errors++ }
  }
  return { imported, skipped, skipped_irrelevant, errors }
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

  const results: Record<string, any> = {}

  results['who-don'] = await ingestWhoDon(supabase)
  results['who-emergencies'] = await ingestWhoEmergencies(supabase)
  results['cdc-travel'] = await ingestCdc(supabase)
  results['reliefweb'] = await ingestReliefWeb(supabase)
  results['google-news'] = await ingestGoogleNewsCron(supabase)

  let totalImported = 0
  let totalErrors = 0
  for (const r of Object.values(results)) {
    totalImported += r.imported
    totalErrors += r.errors
  }

  return NextResponse.json({
    success: totalErrors === 0,
    topic: 'hantavirus',
    timestamp: new Date().toISOString(),
    total_imported: totalImported,
    total_errors: totalErrors,
    providers: results,
  })
}
