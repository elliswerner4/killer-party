'use client'

import { useEffect, useState } from 'react'
import { MysteryViewer } from '@/components/MysteryViewer'

const THEMES = [
  '1920s Speakeasy',
  'Hollywood Golden Age',
  'Victorian Gothic Manor',
  'Tropical Island Resort',
  'Space Station Odyssey',
  'Wild West Saloon',
  'Masquerade Ball',
  'Haunted Mansion',
]

export default function TestPage() {
  const [tier, setTier] = useState<'classic' | 'grand'>('classic')
  const [theme, setTheme] = useState('1920s Speakeasy')
  const [customTheme, setCustomTheme] = useState('')
  const [guestCount, setGuestCount] = useState(6)
  const [difficulty, setDifficulty] = useState<'casual' | 'intermediate' | 'devious'>('intermediate')
  const [specialRequests, setSpecialRequests] = useState('')
  const [mystery, setMystery] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [progress, setProgress] = useState('')
  const [stage, setStage] = useState('')
  const [passcode, setPasscode] = useState('')

  // Remember the owner passcode on this device so it only has to be typed once.
  useEffect(() => {
    try { setPasscode(localStorage.getItem('kp-test-passcode') || '') } catch {}
  }, [])

  async function handleGenerate() {
    setLoading(true)
    setError('')
    setMystery(null)
    setElapsed(0)
    setStage('')
    setProgress('')
    try { localStorage.setItem('kp-test-passcode', passcode) } catch {}

    const interval = setInterval(() => setElapsed((e) => e + 1), 1000)

    try {
      const res = await fetch('/api/test-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          theme: tier === 'grand' && customTheme ? customTheme : theme,
          guestCount,
          difficulty,
          specialRequests,
          passcode,
        }),
      })

      if (!res.ok) {
        // Show the server's own message; never the raw response body.
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Generation failed. Please try again.')
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
              setProgress(`Writing your mystery... (${Math.round(event.length / 1000)}k chars)`)
            } else if (event.type === 'stage') {
              setStage(event.message)
            } else if (event.type === 'complete') {
              finished = true
              setMystery(event.mystery)
            } else if (event.type === 'error') {
              throw new Error(event.error)
            }
          }
        }
      }
      if (!finished) {
        throw new Error('Generation stopped before it finished (the server likely timed out). Please try again.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }

  if (mystery) {
    return (
      <div>
        <div className="bg-noir-dark border-b border-gold/20 px-6 py-3 flex items-center justify-between">
          <p className="text-gold text-sm font-semibold">Test mystery, {tier} tier</p>
          <button
            onClick={() => setMystery(null)}
            className="text-sm text-gray-400 hover:text-white border border-gray-600 px-3 py-1 rounded"
          >
            Generate another
          </button>
        </div>
        <MysteryViewer mystery={mystery} />
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] max-w-2xl mx-auto px-6 py-12">
      <div className="bg-noir-light border border-gold/40 rounded-lg p-4 mb-8">
        <p className="text-gold font-semibold text-sm">Owner test page</p>
        <p className="text-gray-300 text-sm mt-1">
          Generates a mystery without payment. It needs the owner passcode, so customers can’t run up API costs here.
        </p>
      </div>

      <h1 className="font-display text-4xl text-parchment mb-8">Test mystery generator</h1>

      {/* Tier */}
      <div className="mb-6">
        <label className="text-gray-300 text-sm font-medium mb-2 block">Tier</label>
        <div className="flex gap-3">
          <button
            onClick={() => setTier('classic')}
            className={`flex-1 py-3 rounded-lg border-2 font-display text-lg transition ${
              tier === 'classic'
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-gray-700 text-gray-500 hover:border-gray-500'
            }`}
          >
            Classic ($35)
          </button>
          <button
            onClick={() => setTier('grand')}
            className={`flex-1 py-3 rounded-lg border-2 font-display text-lg transition ${
              tier === 'grand'
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-gray-700 text-gray-500 hover:border-gray-500'
            }`}
          >
            Grand ($49)
          </button>
        </div>
      </div>

      {/* Theme */}
      <div className="mb-6">
        <label className="text-gray-300 text-sm font-medium mb-2 block">Theme</label>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => { setTheme(t); setCustomTheme(''); }}
              className={`py-2 px-3 rounded-lg border text-sm transition ${
                theme === t && !customTheme
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {tier === 'grand' && (
          <textarea
            placeholder="Or describe a custom theme (Grand tier only)..."
            value={customTheme}
            onChange={(e) => setCustomTheme(e.target.value)}
            className="mt-3 w-full bg-noir-light border border-gray-700 rounded-lg p-3 text-gray-200 text-sm placeholder-gray-600 focus:border-gold focus:outline-none"
            rows={2}
          />
        )}
      </div>

      {/* Guest Count */}
      <div className="mb-6">
        <label className="text-gray-300 text-sm font-medium mb-2 block">
          Guests: {guestCount}
        </label>
        <input
          type="range"
          min={4}
          max={tier === 'grand' ? 12 : 8}
          value={guestCount}
          onChange={(e) => setGuestCount(parseInt(e.target.value))}
          className="w-full accent-gold"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>4</span>
          <span>{tier === 'grand' ? 12 : 8}</span>
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-6">
        <label className="text-gray-300 text-sm font-medium mb-2 block">Difficulty</label>
        <div className="flex gap-3">
          {(['casual', 'intermediate', 'devious'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-2 rounded-lg border text-sm capitalize transition ${
                difficulty === d
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-gray-700 text-gray-500 hover:border-gray-500'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Special Requests */}
      <div className="mb-8">
        <label className="text-gray-300 text-sm font-medium mb-2 block">Special requests</label>
        <textarea
          placeholder="Any special requests? (e.g., 'One character should be vegetarian', 'Include a plot twist about twins')"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          className="w-full bg-noir-light border border-gray-700 rounded-lg p-3 text-gray-200 text-sm placeholder-gray-600 focus:border-gold focus:outline-none"
          rows={2}
        />
      </div>

      {/* Passcode */}
      <div className="mb-6">
        <label htmlFor="passcode" className="text-gray-300 text-sm font-medium mb-2 block">Owner passcode</label>
        <input
          id="passcode"
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          autoComplete="current-password"
          className="input-field"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-blood hover:bg-blood-light disabled:opacity-50 text-white font-display text-xl py-4 rounded-lg transition"
      >
        {loading ? `Writing… ${elapsed}s` : 'Generate mystery'}
      </button>

      {loading && (
        <p className="mt-3 text-sm text-gray-400" aria-live="polite">
          {stage || 'Starting'}{progress ? `, ${progress.replace('Writing your mystery... ', '').replace(/[()]/g, '')} written` : ''}. A full mystery usually takes two to three minutes.
        </p>
      )}

      {error && (
        <div className="mt-4 bg-red-900/20 border border-red-600/40 rounded-lg p-4">
          <p className="text-blood-light text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
