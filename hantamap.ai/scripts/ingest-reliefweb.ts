/**
 * Ingest ReliefWeb Reports (Health theme)
 * Source: https://api.reliefweb.int/v2/reports
 * Publisher: ReliefWeb (OCHA)
 * Does NOT publish any public data.
 *
 * Requires approved appname from ReliefWeb.
 * Register at: https://apidoc.reliefweb.int/parameters#appname
 * Set RELIEFWEB_APPNAME in environment variables.
 */

import { getSupabase, detectKeywords, detectCountries, upsertCandidates, log, type CandidateRow } from './shared'

const PROVIDER = 'reliefweb'
const API_URL = 'https://api.reliefweb.int/v2/reports'
const PUBLISHER = 'ReliefWeb (OCHA)'

async function fetchItems(): Promise<any[]> {
  const appname = process.env.RELIEFWEB_APPNAME
  if (!appname) {
    log(PROVIDER, 'RELIEFWEB_APPNAME is not set. Register at https://apidoc.reliefweb.int/parameters#appname')
    log(PROVIDER, 'Skipping ReliefWeb ingestion.')
    return []
  }

  const res = await fetch(`${API_URL}?appname=${encodeURIComponent(appname)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preset: 'latest',
      limit: 50,
      fields: {
        include: ['title', 'url_alias', 'source', 'date', 'country'],
      },
      filter: {
        field: 'theme.name',
        value: 'Health',
      },
    }),
  })

  if (res.status === 403) {
    const body = await res.json().catch(() => null)
    const msg = body?.error?.message || 'Access denied'
    log(PROVIDER, `API returned 403: ${msg}`)
    log(PROVIDER, 'Your appname may not be approved yet. Register at https://apidoc.reliefweb.int/parameters#appname')
    return []
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`ReliefWeb API returned ${res.status}: ${body.slice(0, 200)}`)
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

  const urlAlias = fields.url_alias
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

  const searchText = [title, ...countryNames].join(' ')

  return {
    source_provider: PROVIDER,
    external_id: id,
    title: String(title),
    url,
    publisher: publisherName,
    published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
    raw_payload: item,
    extracted_summary: null,
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
    return { imported: 0, skipped: 0, skipped_irrelevant: 0, errors: 1 }
  }

  if (items.length === 0) {
    log(PROVIDER, 'No items to import.')
    return { imported: 0, skipped: 0, skipped_irrelevant: 0, errors: 0 }
  }

  log(PROVIDER, `Fetched ${items.length} items from API`)

  const candidates = items
    .map(normalizeItem)
    .filter((c): c is CandidateRow => c !== null)

  log(PROVIDER, `Normalized ${candidates.length} candidates`)

  const supabase = getSupabase()
  const result = await upsertCandidates(supabase, candidates)

  log(PROVIDER, `Done: ${result.imported} imported, ${result.skipped} skipped, ${result.skipped_irrelevant} irrelevant, ${result.errors} errors`)
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
