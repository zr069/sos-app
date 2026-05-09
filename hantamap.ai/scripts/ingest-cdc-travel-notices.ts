/**
 * Ingest CDC Travel Health Notices (RSS)
 * Source: https://wwwnc.cdc.gov/travel/rss/notices.xml
 * Publisher: Centers for Disease Control and Prevention
 * Does NOT publish any public data.
 */

import { getSupabase, detectKeywords, detectCountries, upsertCandidates, log, type CandidateRow } from './shared'

const PROVIDER = 'cdc-travel'
const FEED_URL = 'https://wwwnc.cdc.gov/travel/rss/notices.xml'
const PUBLISHER = 'Centers for Disease Control and Prevention'

function parseXmlField(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([^<]*)</${tag}>`, 'i')
  const match = xml.match(regex)
  if (!match) return null
  return (match[1] || match[2] || '').trim() || null
}

function parseItems(xml: string): Array<{ title: string; link: string; description: string; pubDate: string; guid: string }> {
  const items: Array<{ title: string; link: string; description: string; pubDate: string; guid: string }> = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = parseXmlField(block, 'title')
    const link = parseXmlField(block, 'link')
    const description = parseXmlField(block, 'description')
    const pubDate = parseXmlField(block, 'pubDate')
    const guid = parseXmlField(block, 'guid')

    if (title) {
      items.push({
        title,
        link: link || '',
        description: description || '',
        pubDate: pubDate || '',
        guid: guid || link || title,
      })
    }
  }

  return items
}

async function fetchItems() {
  const res = await fetch(FEED_URL)

  if (!res.ok) {
    throw new Error(`CDC RSS returned ${res.status}: ${res.statusText}`)
  }

  const xml = await res.text()
  return parseItems(xml)
}

function normalizeItem(item: { title: string; link: string; description: string; pubDate: string; guid: string }): CandidateRow {
  const searchText = [item.title, item.description].join(' ')

  return {
    source_provider: PROVIDER,
    external_id: item.guid,
    title: item.title,
    url: item.link || null,
    publisher: PUBLISHER,
    published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
    raw_payload: item,
    extracted_summary: item.description ? item.description.slice(0, 2000) : null,
    detected_keywords: detectKeywords(searchText),
    detected_countries: detectCountries(searchText),
  }
}

export async function ingestCdcTravel() {
  log(PROVIDER, 'Starting ingestion...')

  let items: Awaited<ReturnType<typeof fetchItems>>
  try {
    items = await fetchItems()
  } catch (err: any) {
    log(PROVIDER, `Failed to fetch: ${err.message}`)
    return { imported: 0, skipped: 0, skipped_irrelevant: 0, errors: 1 }
  }

  log(PROVIDER, `Parsed ${items.length} items from RSS feed`)

  const candidates = items.map(normalizeItem)

  if (candidates.length === 0) {
    log(PROVIDER, 'No candidates to import.')
    return { imported: 0, skipped: 0, skipped_irrelevant: 0, errors: 0 }
  }

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
  ingestCdcTravel().then(r => {
    console.log(`\nResult: ${JSON.stringify(r)}`)
    process.exit(r.errors > 0 ? 1 : 0)
  })
}
