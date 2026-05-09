/**
 * Run all ingestion scripts sequentially.
 * Does NOT publish any public data.
 * Safe to run multiple times (deduplicates via unique constraint).
 */

// Load .env.local
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

import { ingestWhoDon } from './ingest-who-don'
import { ingestWhoEmergencies } from './ingest-who-emergencies'
import { ingestCdcTravel } from './ingest-cdc-travel-notices'
import { ingestReliefWeb } from './ingest-reliefweb'
import { ingestGoogleNews } from './ingest-google-news'

async function main() {
  console.log('=== HantaMap Source Ingestion ===')
  console.log(`Started at ${new Date().toISOString()}\n`)

  const results: Record<string, any> = {}

  console.log('--- Official Sources ---')
  results['who-don'] = await ingestWhoDon()
  console.log('')
  results['who-emergencies'] = await ingestWhoEmergencies()
  console.log('')
  results['cdc-travel'] = await ingestCdcTravel()
  console.log('')
  results['reliefweb'] = await ingestReliefWeb()
  console.log('')

  console.log('--- Media Monitoring ---')
  results['google-news'] = await ingestGoogleNews()
  console.log('')

  // Summary
  console.log('=== Summary ===')
  let totalImported = 0
  let totalErrors = 0

  for (const [provider, r] of Object.entries(results)) {
    console.log(`  ${provider}: ${r.imported} imported, ${r.errors} errors`)
    totalImported += r.imported
    totalErrors += r.errors
  }

  console.log(`\n  Total: ${totalImported} imported, ${totalErrors} errors`)
  console.log(`Finished at ${new Date().toISOString()}`)

  process.exit(totalErrors > 0 ? 1 : 0)
}

main()
