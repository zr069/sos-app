/**
 * Ingestion topic configuration.
 *
 * MVP scope: Hantavirus and Andes-Hantavirus only.
 * The architecture supports adding future topics, but ingestion
 * currently filters strictly to the MVP topic.
 */

export const MVP_TOPIC = 'hantavirus'

/**
 * A source candidate is relevant if its text contains
 * at least one of these terms (case-insensitive).
 */
export const ALLOWED_KEYWORDS = [
  'hantavirus',
  'hanta virus',
  'andes virus',
  'andes hantavirus',
  'orthohantavirus',
  'hantavirus pulmonary syndrome',
  'hantavirus cardiopulmonary syndrome',
  'hps',
  'hcps',
  'hemorrhagic fever with renal syndrome',
  'haemorrhagic fever with renal syndrome',
  'hfrs',
  'hondius',
]

/**
 * Short acronyms that require nearby hantavirus context
 * to avoid false positives (e.g. "HPS" can mean other things).
 */
export const CONTEXT_REQUIRED_TERMS = ['hps', 'hcps', 'hfrs', 'hondius']

/**
 * Check whether a text blob is relevant to the MVP topic.
 * Returns true if the text contains a hantavirus-related keyword.
 * For ambiguous short acronyms (HPS, HCPS, HFRS, Hondius),
 * requires a co-occurring unambiguous hantavirus term.
 */
export function isRelevantToMvpTopic(text: string): boolean {
  const lower = text.toLowerCase()

  // Check unambiguous keywords first
  const unambiguous = ALLOWED_KEYWORDS.filter(
    kw => !CONTEXT_REQUIRED_TERMS.includes(kw)
  )
  for (const kw of unambiguous) {
    if (lower.includes(kw)) return true
  }

  // Check context-required terms: only match if an unambiguous
  // hantavirus term also appears in the same text
  for (const term of CONTEXT_REQUIRED_TERMS) {
    if (lower.includes(term)) {
      const hasContext = unambiguous.some(kw => lower.includes(kw))
      if (hasContext) return true
    }
  }

  return false
}

/**
 * Placeholder for future global outbreak monitoring.
 * When HantaMap expands beyond Hantavirus, add topic
 * configs here and update the ingestion filter.
 */
export const FUTURE_TOPICS = [
  // { id: 'mpox', keywords: ['mpox', 'monkeypox'] },
  // { id: 'ebola', keywords: ['ebola', 'ebola virus disease'] },
  // { id: 'cholera', keywords: ['cholera'] },
]
