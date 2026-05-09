/**
 * Ingest ReliefWeb Reports (disease/epidemic topic)
 * Source: https://api.reliefweb.int/v1/reports
 * Publisher: ReliefWeb (OCHA)
 * Does NOT publish any public data.
 */

import { getSupabase, detectKeywords, detectCountries, upsertCandidates, log, type CandidateRow } from './shared'

const PROVIDER = 'reliefweb'
const API_URL = 'https://api.reliefweb.int/v1/reports'
const PUBLISHER = 'ReliefWeb (OCHA)'

async function fetchItems(): Promise<any[]> {
  const params = new URLSearchParams({
    'appname': 'hantamap.ai',
    'preset': 'latest',
    'limit': '50',
    'filter[field]': 'theme.name',
    'filter[value]': 'Health',
    'fields[include][]': 'title,url_alias,source,date,body-html,country',
  })

  // ReliefWeb also supports filter by disaster type
  const res = await fetch(`${API_URL}?${params.toString()}`, {
    headers: { 'Accept': 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`ReliefWeb API returned ${res.status}: ${res.statusText}`)
  }

  const data = await res.json()
  return data.data || []
}

function normalizeItem(item: any): CandidateRow | null {
  const fields = item.fields
  if (!fields) return null

  const id = String(item.id)
  const title = fields.title
  if (!title) return null

  const urlAlias = fields.url_alias || fields['url_alias']
  const url = urlAlias
    ? `https://reliefweb.int${urlAlias}`
    : `https://reliefweb.int/node/${id}`

  const sources = fields.source || []
  const publisherName = Array.isArray(sources) && sources.length > 0
    ? sources.map((s: any) => s.name || s.shortname).filter(Boolean).join(', ')
    : PUBLISHER

  const dateFields = fields.date || {}
  const publishedAt = dateFields.created || dateFields.original || null

  const countries = fields.country || []
  const countryNames = Array.isArray(countries)
    ? countries.map((c: any) => c.name).filter(Boolean)
    : []

  // Extract summary from body-html if available (strip tags)
  let summary: string | null = null
  const bodyHtml = fields['body-html']
  if (bodyHtml) {
    summary = bodyHtml
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2000)
  }

  const searchText = [title, summary || '', ...countryNames].join(' ')

  return {
    source_provider: PROVIDER,
    external_id: id,
    title: String(title),
    url,
    publisher: publisherName,
    published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
    raw_payload: item,
    extracted_summary: summary,
    detected_keywords: detectKeywords(searchText),
    detected_countries: [...new Set([...countryNames, ...detectCountries(searchText)])],
  }
}

export async function ingestReliefWeb() {
  log(PROVIDER, 'Starting ingestion...')

  let items: any[]
  try {
    items = await fetchItems()
  } catch (err: any) {
    log(PROVIDER, `Failed to fetch: ${err.message}`)
    return { imported: 0, skipped: 0, errors: 1 }
  }

  log(PROVIDER, `Fetched ${items.length} items from API`)

  const candidates = items
    .map(normalizeItem)
    .filter((c): c is CandidateRow => c !== null)

  log(PROVIDER, `Normalized ${candidates.length} candidates`)

  if (candidates.length === 0) {
    log(PROVIDER, 'No candidates to import.')
    return { imported: 0, skipped: 0, errors: 0 }
  }

  const supabase = getSupabase()
  const result = await upsertCandidates(supabase, candidates)

  log(PROVIDER, `Done: ${result.imported} imported, ${result.skipped} skipped, ${result.errors} errors`)
  return result
}

if (require.main === module) {
  const fs = require('fs')
  const path = require('path')
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const match = line.match(/^([^#=]+)=(.*)$/)
      if (match && !process.env[match[1].trim()]) {
        process.env[match[1].trim()] = match[2].trim()
      }
    }
  }
  ingestReliefWeb().then(r => {
    console.log(`\nResult: ${JSON.stringify(r)}`)
    process.exit(r.errors > 0 ? 1 : 0)
  })
}
