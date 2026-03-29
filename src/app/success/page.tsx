'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
        setProgress('Payment confirmed. Generating your mystery...')

        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        if (!res.ok) {
          const text = await res.text()
          try {
            const data = JSON.parse(text)
            throw new Error(data.error || 'Generation failed')
          } catch {
            throw new Error(text || 'Generation failed')
          }
        }

        // Read the SSE stream
        const reader = res.body?.getReader()
        if (!reader) throw new Error('No response stream')
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const event = JSON.parse(line.slice(6))
              if (event.type === 'progress') {
                setProgress(`Crafting your mystery... (${Math.round(event.length / 100)}k chars)`)
              } else if (event.type === 'complete') {
                setMystery(event.mystery)
              } else if (event.type === 'error') {
                throw new Error(event.error)
              }
            }
          }
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
        <p className="text-gray-500 text-sm">This usually takes 30-60 seconds. Crafting something special...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-blood-light font-display text-2xl mb-4">Something Went Wrong</p>
        <p className="text-gray-400 mb-6 max-w-md">{error}</p>
        <p className="text-gray-500 text-sm">
          Don&apos;t worry — your payment is safe. Please email{' '}
          <a href="mailto:support@killerparty.co" className="text-gold underline">
            support@killerparty.co
          </a>{' '}
          with your session ID and we&apos;ll get your mystery to you.
        </p>
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
