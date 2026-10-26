'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * The place card: where a guest types the code their host sent them.
 * Used in the home page hero and on /join.
 */
export function JoinCodeCard({ autoFocus = false, headingLevel = 'h2' }: { autoFocus?: boolean; headingLevel?: 'h1' | 'h2' }) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const Heading = headingLevel

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const clean = code.trim().toUpperCase().replace(/\s+/g, '-')
    if (!clean) {
      setError('Enter the code from your host.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/games/join?code=${encodeURIComponent(clean)}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(res.status === 404 ? `No game found for ${clean}. Check the code with your host.` : data.error || 'Could not join the game. Try again.')
        return
      }
      router.push(`/play/${data.gameId}`)
    } catch {
      setError('Could not reach the game. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="place-card px-6 pt-4 pb-6 sm:px-8 sm:pb-8 w-full max-w-sm">
      <p className="h-7 text-sm text-parchment-ink/60 italic font-display">Your seat at the table</p>
      <Heading className="mt-5 font-display text-[1.75rem] leading-tight text-parchment-ink">
        Invited to a party?
      </Heading>
      <p className="mt-1 text-sm text-parchment-ink/75">Enter the code your host sent you.</p>
      <form onSubmit={handleJoin} className="mt-5" noValidate>
        <label htmlFor="join-code" className="sr-only">Game code</label>
        <input
          id="join-code"
          type="text"
          inputMode="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="KNIFE-7421"
          className="code-input"
          maxLength={20}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={!!error}
          aria-describedby={error ? 'join-error' : undefined}
        />
        {error && (
          <p id="join-error" role="alert" className="mt-2 text-sm text-blood">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full mt-5 disabled:opacity-60">
          {loading ? 'Finding your game…' : 'Join game'}
        </button>
      </form>
    </div>
  )
}
