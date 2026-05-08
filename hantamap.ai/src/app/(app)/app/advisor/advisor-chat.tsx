'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AdvisorChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }] }),
      })

      if (!res.ok) throw new Error('Failed to get response')

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Unable to process your request at this time. Please try again later.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-slate-200 rounded overflow-hidden">
      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-slate-400">Ask a question about outbreaks, preparedness or health guidance.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[
                'What outbreaks are currently active?',
                'How should I prepare for a health emergency?',
                'What supplies should I keep at home?',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs border border-slate-200 rounded px-3 py-1.5 text-slate-500 hover:bg-white transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded px-4 py-2.5 text-sm text-slate-400">
              Thinking...
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-slate-200 p-3 flex gap-2 bg-white">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}
