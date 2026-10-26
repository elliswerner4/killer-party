'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { track } from '@vercel/analytics'
import { MysteryViewer } from '@/components/MysteryViewer'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [mystery, setMystery] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('Verifying payment...')

  useEffect(() => {
    if (!sessionId) {
      setError('No session found. Please contact support.')
      setLoading(false)
      return
    }

    async function generate() {
      try {
        setProgress('Payment confirmed. Writing your mystery')

        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        if (!res.ok) {
          // Show the server's own message; never the raw response body.
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'We couldn’t start writing your mystery. Refresh this page to try again.')
        }

        // Read the SSE stream
        const reader = res.body?.getReader()
        if (!reader) throw new Error('No response stream')
        const decoder = new TextDecoder()
        let buffer = ''
        let finished = false

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              let event: any
              try {
                event = JSON.parse(line.slice(6))
              } catch {
                console.warn('Skipped malformed SSE event:', line.slice(0, 100))
                continue
              }
              if (event.type === 'progress') {
                setProgress((p) => p.replace(/ \(.*\)$/, '') + ` (${Math.round(event.length / 1000)}k characters written)`)
              } else if (event.type === 'stage') {
                setProgress(event.message)
              } else if (event.type === 'complete') {
                finished = true
                setMystery(event.mystery)
                track('mystery_generated')
              } else if (event.type === 'error') {
                track('mystery_generation_failed', { error: String(event.error).slice(0, 100) })
                throw new Error(event.error)
              }
            }
          }
        }
        if (!finished) {
          throw new Error('Generation stopped before it finished. Please refresh to try again, or contact support.')
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Something went wrong'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    generate()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-6" />
        <p className="text-gold font-display text-xl mb-2">{progress}</p>
        <p className="text-gray-500 text-sm">This usually takes two to three minutes. Keep this page open.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-blood-light font-display text-2xl mb-4">Your mystery wasn’t finished</p>
        <p className="text-gray-400 mb-6 max-w-md">{error}</p>
        <p className="text-gray-300 text-sm max-w-md">
          Your payment went through and is safe. Refresh this page to try again, or contact customer support and we’ll get your mystery to you.
        </p>
        <a href={`/support?order=${encodeURIComponent(sessionId || '')}`} className="btn-primary mt-6">Contact customer support</a>
        <p className="text-gray-600 text-xs mt-4 font-mono">Session: {sessionId}</p>
      </div>
    )
  }

  return <MysteryViewer mystery={mystery} />
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-6" />
          <p className="text-gold font-display text-xl">Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
