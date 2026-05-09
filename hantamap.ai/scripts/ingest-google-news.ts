/**
 * Ingest recent Hantavirus news from Google News RSS.
 * Only items from the last 10 days. Hantavirus topic filter applied.
 * Items are NOT verified. They are media monitoring signals.
 * Does NOT publish any public data automatically.
 */

import { getSupabase, detectKeywords, detectCountries, log } from './shared'
import { isRelevantToMvpTopic } from '../src/lib/ingestion/topics'

const PROVIDER = 'google-news'
const PUBLISHER = 'Google News (aggregator)'

const QUERIES = [
  'hantavirus OR "hanta virus"',
  '"Andes virus" OR "Andes hantavirus"',
  '"MV Hondius" hantavirus',
  '"hantavirus cruise ship"',
]

// 10 day freshness cutoff
const MAX_AGE_MS = 10 * 24 * 60 * 60 * 1000

const HIGH_CONFIDENCE_PUBLISHERS = [
  'reuters', 'associated press', 'ap news', 'bbc', 'cnn',
  'the guardian', 'financial times', 'new york times', 'washington post',
  'times of israel', 'jerusalem post', 'swissinfo', 'srf', 'tagesschau',
  'deutsche welle', 'dw', 'euronews', 'politico', 'sky news',
  'el país', 'el pais', 'le monde', 'al jazeera', 'abc news',
  'nbc news', 'cbs news', 'france 24', 'ard', 'zdf', 'npr',
  'the telegraph', 'independent', 'bloomberg',
]

function getConfidenceLevel(publisher: string): 'high' | 'medium' | 'low' {
  const lower = publisher.toLowerCase()
  if (HIGH_CONFIDENCE_PUBLISHERS.some(p => lower.includes(p))) return 'high'
  if (lower.includes('news') || lower.includes('post') || lower.includes('times')) return 'medium'
  return 'low'
}

function extractPublisher(title: string): { cleanTitle: string; publisher: string } {
  // Google News titles end with " - Publisher Name"
  const dashIndex = title.lastIndexOf(' - ')
  if (dashIndex > 0) {
    return {
      cleanTitle: title.slice(0, dashIndex).trim(),
      publisher: title.slice(dashIndex + 3).trim(),
    }
  }
  return { cleanTitle: title, publisher: 'Unknown' }
}

function parseXmlField(xml: string, tag: string): string | null {
  const regex = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([^<]*)</${tag}>`,
    'i'
  )
  const match = xml.match(regex)
  if (!match) return null
  return (match[1] || match[2] || '').trim() || null
}

interface NewsItem {
  title: string
  link: string
  pubDate: string
  description: string
  guid: string
  publisher: string
  cleanTitle: string
}

async function fetchQuery(query: string): Promise<NewsItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en&gl=US&ceid=US:en`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'HantaMap.ai/1.0 (outbreak-monitoring)' },
  })

  if (!res.ok) {
    log(PROVIDER, `Google News RSS returned ${res.status} for query: ${query}`)
    return []
  }

  const xml = await res.text()
  const items: NewsItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const rawTitle = parseXmlField(block, 'title') || ''
    const link = parseXmlField(block, 'link') || ''
    const pubDate = parseXmlField(block, 'pubDate') || ''
    const description = parseXmlField(block, 'description') || ''
    const guid = parseXmlField(block, 'guid') || link || rawTitle

    const { cleanTitle, publisher } = extractPublisher(rawTitle)

    if (cleanTitle && link) {
      items.push({ title: rawTitle, cleanTitle, link, pubDate, description, guid, publisher })
    }
  }

  return items
}

export async function ingestGoogleNews() {
  log(PROVIDER, 'Starting media monitoring ingestion...')

  const cutoff = Date.now() - MAX_AGE_MS
  let totalFetched = 0
  let imported = 0
  let skipped = 0
  let skipped_irrelevant = 0
  let skipped_old = 0
  let skipped_no_date = 0
  let errors = 0

  const supabase = getSupabase()
  const seenGuids = new Set<string>()

  for (const query of QUERIES) {
    let items: NewsItem[]
    try {
      items = await fetchQuery(query)
    } catch (err: any) {
      log(PROVIDER, `Failed to fetch query "${query}": ${err.message}`)
      errors++
      continue
    }

    totalFetched += items.length

    for (const item of items) {
      // Deduplicate across queries
      if (seenGuids.has(item.guid)) continue
      seenGuids.add(item.guid)

      // Parse date
      let publishedAt: Date | null = null
      try {
        publishedAt = new Date(item.pubDate)
        if (isNaN(publishedAt.getTime())) publishedAt = null
      } catch {
        publishedAt = null
      }

      // Skip items without parseable date
      if (!publishedAt) {
        skipped_no_date++
        continue
      }

      // 10-day freshness rule
      if (publishedAt.getTime() < cutoff) {
        skipped_old++
        continue
      }

      // Hantavirus topic filter
      const searchText = [item.cleanTitle, item.description, item.publisher].join(' ')
      if (!isRelevantToMvpTopic(searchText)) {
        skipped_irrelevant++
        continue
      }

      const confidence = getConfidenceLevel(item.publisher)

      const { error } = await supabase
        .from('source_candidates')
        .upsert(
          {
            source_provider: PROVIDER,
            external_id: item.guid,
            title: item.cleanTitle,
            url: item.link,
            publisher: item.publisher,
            published_at: publishedAt.toISOString(),
            fetched_at: new Date().toISOString(),
            raw_payload: {
              original_title: item.title,
              description: item.description,
              query,
            },
            extracted_summary: item.description
              ? item.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000)
              : null,
            detected_keywords: detectKeywords(searchText),
            detected_countries: detectCountries(searchText),
            source_type: 'media',
            confidence_level: confidence,
            original_publisher: item.publisher,
            aggregator_source: 'Google News',
            is_public: confidence === 'high',
          },
          { onConflict: 'source_provider,external_id', ignoreDuplicates: true }
        )

      if (error) {
        if (error.code === '23505') skipped++
        else { errors++; log(PROVIDER, `Error: ${error.message}`) }
      } else {
        imported++
      }
    }
  }

  log(PROVIDER, `Fetched ${totalFetched} items across ${QUERIES.length} queries`)
  log(PROVIDER, `Done: ${imported} imported, ${skipped} duplicates, ${skipped_irrelevant} irrelevant, ${skipped_old} too old, ${skipped_no_date} no date, ${errors} errors`)

  return { imported, skipped, skipped_irrelevant, skipped_old, skipped_no_date, errors }
}

if (require.main === module) {
  const fs = require('fs')
  const path = require('path')
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m && !process.env[m[1].trim()]) {
        process.env[m[1].trim()] = m[2].trim()
      }
    }
  }
  ingestGoogleNews().then(r => {
    console.log(`\nResult: ${JSON.stringify(r)}`)
    process.exit(r.errors > 0 ? 1 : 0)
  })
}
