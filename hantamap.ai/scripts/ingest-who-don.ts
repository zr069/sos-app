/**
 * Ingest WHO Disease Outbreak News
 * Source: https://www.who.int/api/news/diseaseoutbreaknews
 * Publisher: World Health Organization
 * Does NOT publish any public data.
 */

import { getSupabase, detectKeywords, detectCountries, upsertCandidates, log, type CandidateRow } from './shared'

const PROVIDER = 'who-don'
const API_URL = 'https://www.who.int/api/news/diseaseoutbreaknews'
const PUBLISHER = 'World Health Organization'

async function fetchItems(): Promise<any[]> {
  const res = await fetch(API_URL, {
    headers: { 'Accept': 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`WHO DON API returned ${res.status}: ${res.statusText}`)
  }

  const data = await res.json()

  // The WHO API returns { value: [...] } or a direct array
  if (Array.isArray(data)) return data
  if (data.value && Array.isArray(data.value)) return data.value
  if (data.Data && Array.isArray(data.Data)) return data.Data

  log(PROVIDER, `Unexpected API response shape: ${JSON.stringify(data).slice(0, 200)}`)
  return []
}

function normalizeItem(item: any): CandidateRow | null {
  const id = item.Id || item.id || item.UrlName || item.urlName
  const title = item.Title || item.title || item.Name || item.name
  if (!id || !title) return null

  const urlName = item.UrlName || item.urlName || id
  const url = `https://www.who.int/emergencies/disease-outbreak-news/${urlName}`
  const summary = item.Summary || item.summary || item.Description || item.description || null
  const publishedAt = item.PublicationDate || item.publicationDate || item.DatePublished || null

  const searchText = [title, summary || ''].join(' ')

  return {
    source_provider: PROVIDER,
    external_id: String(id),
    title: String(title),
    url,
    publisher: PUBLISHER,
    published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
    raw_payload: item,
    extracted_summary: summary ? String(summary).slice(0, 2000) : null,
    detected_keywords: detectKeywords(searchText),
    detected_countries: detectCountries(searchText),
  }
}

export async function ingestWhoDon() {
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

// Run directly
if (require.main === module) {
  import('dotenv/config').catch(() => {}).finally(() => {
    // Load .env.local manually if dotenv not available
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
    ingestWhoDon().then(r => {
      console.log(`\nResult: ${JSON.stringify(r)}`)
      process.exit(r.errors > 0 ? 1 : 0)
    })
  })
}
