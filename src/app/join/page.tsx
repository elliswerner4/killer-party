'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/games/join?code=${encodeURIComponent(code.trim().toUpperCase())}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Game not found. Check the code and try again.')
        return
      }

      // Navigate to the play page where they can pick a character
      router.push(`/play/${data.gameId}`)
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <h1 className="font-display text-4xl text-white mb-2">Join the Mystery</h1>
        <p className="text-gray-400 mb-8">Enter the code your host gave you</p>

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="KNIFE-742"
            className="input-field text-center text-2xl font-display tracking-widest py-4"
            maxLength={20}
            autoFocus
            autoComplete="off"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50"
          >
            {loading ? 'Finding game...' : 'Join Game'}
          </button>
        </form>

        <p className="text-gray-600 text-xs mt-8">
          Don't have a code? Ask your host, or{' '}
          <a href="/create" className="text-gold underline">create your own mystery</a>.
        </p>
      </div>
    </div>
  )
}
