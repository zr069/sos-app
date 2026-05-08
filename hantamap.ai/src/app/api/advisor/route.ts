import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `You are the HantaMap AI Advisor, a source-grounded health information assistant.

Rules you must follow:
- Do not diagnose medical conditions.
- Do not provide emergency medical instructions beyond telling the user to contact emergency services.
- Do not invent or fabricate data, case numbers, outbreak details or health authority statements.
- Answer only using verified HantaMap data, official health guidance, and general preparedness information.
- If you are unsure about something, say the information is not available rather than guessing.
- Always distinguish between confirmed information and uncertainty.
- Always suggest official health authorities (WHO, CDC, ECDC, local health ministry) for medical decisions.
- If the user reports severe symptoms, advise them to seek urgent medical help or contact emergency services.
- Do not create panic or use alarmist language.
- Do not claim there is a pandemic unless official sources have stated so.
- Include source references when referring to specific outbreak data.
- Keep answers concise and practical.
- Use calm, precise language.
- Do not use em dashes. Use commas, colons or simple hyphens instead.`

// Simple in-memory rate limiter: max 20 requests per user per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60_000
const RATE_LIMIT_MAX = 20

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

// Periodically clean up expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60_000)

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { message: 'AI advisor is not configured. An API key is required.' },
      { status: 503 }
    )
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 })
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { message: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { messages } = body

    // Input validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ message: 'Invalid request.' }, { status: 400 })
    }

    // Limit message history and message length
    const sanitizedMessages = messages
      .slice(-10)
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({
        role: m.role as string,
        content: typeof m.content === 'string' ? m.content.slice(0, 2000) : '',
      }))

    if (sanitizedMessages.length === 0) {
      return NextResponse.json({ message: 'Invalid request.' }, { status: 400 })
    }

    // Fetch outbreak context from the database
    let context = ''
    try {
      const [outbreaksRes, updatesRes] = await Promise.all([
        supabase.from('outbreaks').select('name, status, summary').eq('published', true).limit(10),
        supabase.from('updates').select('title, summary, verification_status').eq('published', true).order('published_at', { ascending: false }).limit(5),
      ])

      if (outbreaksRes.data?.length) {
        context += '\nCurrently tracked outbreaks:\n'
        outbreaksRes.data.forEach((o: any) => {
          context += `- ${o.name} (${o.status}): ${o.summary || 'No summary available'}\n`
        })
      }

      if (updatesRes.data?.length) {
        context += '\nRecent updates:\n'
        updatesRes.data.forEach((u: any) => {
          context += `- [${u.verification_status}] ${u.title}: ${u.summary || ''}\n`
        })
      }

      if (!outbreaksRes.data?.length && !updatesRes.data?.length) {
        context += '\nNo verified outbreak data is currently available in the HantaMap database.'
      }
    } catch {
      context = '\nUnable to retrieve current outbreak data from the database.'
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + context },
          ...sanitizedMessages,
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error('AI service unavailable')
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'Unable to generate a response at this time.'

    return NextResponse.json({ message: reply })
  } catch {
    return NextResponse.json(
      { message: 'Unable to process your request. Please try again later.' },
      { status: 500 }
    )
  }
}
