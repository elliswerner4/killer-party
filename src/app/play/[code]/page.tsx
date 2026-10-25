'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface GameData {
  id: string
  mystery: {
    title: string
    tagline: string
    theme: string
    hostGuide: { act1: string; act2: string; act3: string; act4: string; tips: string; overview: string; timeline: string }
    characters: { name: string; role: string; publicBio: string; specialSkill: string }[]
    clues: { id: string; title: string; content: string; revealedIn: string; givenTo: string }[]
    reveal: { buildup: string; accusationPrompt: string; revealScript: string; epilogue: string }
  }
  code: string
  characterSlugs: Record<string, number>
}

interface GameState {
  currentAct: number
  phase: 'lobby' | 'playing' | 'accusations' | 'reveal' | 'finished'
  players: Record<string, string>
  votes: Record<string, string>
}

export default function HostDashboard() {
  const params = useParams()
  const gameId = params.code as string
  const [game, setGame] = useState<GameData | null>(null)
  const [state, setState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [hostKey, setHostKey] = useState('')
  const [selectedChar, setSelectedChar] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [joinHost, setJoinHost] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinHost(window.location.host)
    }
  }, [])

  // Load game data
  useEffect(() => {
    async function load() {
      try {
        // The host's dashboard link carries a secret key; without it the
        // server sends only the public lobby, never the solution.
        const key = new URLSearchParams(window.location.search).get('host')
        const res = await fetch(`/api/games/${gameId}${key ? `?host=${encodeURIComponent(key)}` : ''}`)
        if (!res.ok) throw new Error('Game not found')
        const data = await res.json()
        setGame(data)
        setIsHost(data.isHost === true)
        if (data.isHost) setHostKey(key || '')
      } catch {
        setError('Game not found.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [gameId])

  // Poll game state
  const pollState = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/${gameId}/state`)
      if (res.ok) {
        const data = await res.json()
        setState(data)
      }
    } catch { /* ignore polling errors */ }
  }, [gameId])

  useEffect(() => {
    pollState()
    const interval = setInterval(pollState, 3000)
    return () => clearInterval(interval)
  }, [pollState])

  async function sendAction(action: string, extra: Record<string, string> = {}) {
    try {
      const res = await fetch(`/api/games/${gameId}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, hostKey, ...extra }),
      })
      if (res.ok) setState(await res.json())
    } catch { /* ignore */ }
  }

  async function claimCharacter() {
    if (!selectedChar || !playerName.trim()) return
    await sendAction('join', { characterSlug: selectedChar, playerName: playerName.trim() })
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-blood-light font-display text-2xl mb-4">Game not found</p>
        <a href="/join" className="text-gold underline">Try another code</a>
      </div>
    )
  }

  const slugEntries = Object.entries(game.characterSlugs)

  // ====== HOST VIEW ======
  if (isHost) {
    const actGuides = [
      null,
      game.mystery.hostGuide.act1,
      game.mystery.hostGuide.act2,
      game.mystery.hostGuide.act3,
      game.mystery.hostGuide.act4,
    ]

    const currentClues = state?.phase === 'playing'
      ? game.mystery.clues.filter((c) => c.revealedIn === `act${state.currentAct}`)
      : []

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="text-gold text-xs mb-1">Host dashboard</p>
          <h1 className="font-display text-3xl text-white">{game.mystery.title}</h1>
          <p className="text-gray-400 text-sm mt-2">
            Game code <span className="text-gold font-display text-lg tracking-wider">{game.code}</span>
          </p>
        </div>

        {/* Player count */}
        <div className="card p-4 mb-6 text-center">
          <p className="text-gray-400 text-sm">
            <span className="text-gold font-display text-xl">{state ? Object.keys(state.players).length : 0}</span>
            {' / '}{game.mystery.characters.length} guests joined
          </p>
        </div>

        {/* Phase-specific controls */}
        {state?.phase === 'lobby' && (
          <div className="space-y-4">
            <div className="card p-4">
              <h2 className="font-display text-lg text-gold mb-3">Waiting for guests</h2>
              <p className="text-gray-400 text-sm mb-4">
                Share the game code <span className="text-gold font-display">{game.code}</span> with your guests.
                They go to <span className="text-gold">{joinHost}/join</span> and enter the code.
              </p>
              <div className="space-y-2">
                {slugEntries.map(([slug, idx]) => {
                  const char = game.mystery.characters[idx]
                  const claimed = state?.players[slug]
                  return (
                    <div key={slug} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <span className="text-white text-sm">{char.name} <span className="text-gray-500">— {char.role}</span></span>
                      {claimed ? (
                        <span className="text-sage text-xs">{claimed}</span>
                      ) : (
                        <span className="text-gray-600 text-xs">not joined yet</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <button
              onClick={() => sendAction('start')}
              className="btn-primary w-full py-4 text-lg"
            >
              Start the mystery
            </button>
          </div>
        )}

        {state?.phase === 'playing' && (
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-gold">Act {state.currentAct}</h2>
                <span className="text-gray-500 text-xs">of 4</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {actGuides[state.currentAct]}
              </p>
            </div>

            {currentClues.length > 0 && (
              <div className="card p-5">
                <h3 className="font-display text-lg text-gold mb-3">Clues to hand out</h3>
                {currentClues.map((clue) => (
                  <div key={clue.id} className="mb-3 pb-3 border-b border-gray-800 last:border-0 last:mb-0 last:pb-0">
                    <p className="text-white text-sm font-medium">{clue.title}</p>
                    <p className="text-gray-400 text-xs mt-1">Give to: <span className="text-gold">{clue.givenTo}</span></p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              {state.currentAct < 4 ? (
                <button onClick={() => sendAction('nextAct')} className="btn-primary flex-1 py-3">
                  Advance to Act {state.currentAct + 1}
                </button>
              ) : (
                <button onClick={() => sendAction('accusations')} className="btn-primary flex-1 py-3">
                  Begin accusations
                </button>
              )}
            </div>
          </div>
        )}

        {state?.phase === 'accusations' && (
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-display text-xl text-gold mb-3">Accusation time</h2>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                {game.mystery.reveal.accusationPrompt}
              </p>
              <p className="text-gray-400 text-sm">
                Votes: <span className="text-gold font-display">{state ? Object.keys(state.votes).length : 0}</span>
                {' / '}{Object.keys(state?.players || {}).length}
              </p>
            </div>
            <button onClick={() => sendAction('reveal')} className="btn-primary w-full py-4 text-lg">
              Reveal the killer
            </button>
          </div>
        )}

        {state?.phase === 'reveal' && (
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-display text-xl text-blood-light mb-3">The Reveal</h2>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                {game.mystery.reveal.buildup}
              </p>
              <p className="text-white leading-relaxed whitespace-pre-wrap">
                {game.mystery.reveal.revealScript}
              </p>
            </div>
            <div className="card p-5">
              <h3 className="font-display text-lg text-gold mb-3">Epilogue</h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {game.mystery.reveal.epilogue}
              </p>
            </div>
            <button onClick={() => sendAction('finish')} className="btn-secondary w-full py-3">
              End game
            </button>
          </div>
        )}

        {state?.phase === 'finished' && (
          <div className="card p-5 text-center">
            <h2 className="font-display text-2xl text-gold mb-2">Case closed</h2>
            <p className="text-gray-400">Thanks for hosting.</p>
          </div>
        )}
      </div>
    )
  }

  // ====== GUEST VIEW — CHARACTER SELECT ======
  const mySlug = typeof window !== 'undefined' ? sessionStorage.getItem(`kp-${gameId}`) : null

  if (mySlug) {
    // Redirect to their character page
    if (typeof window !== 'undefined') {
      window.location.href = `/play/${gameId}/${mySlug}`
    }
    return null
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl text-white mb-1">{game.mystery.title}</h1>
        <p className="text-gray-400 text-sm">{game.mystery.tagline}</p>
      </div>

      <div className="mb-6">
        <label className="label text-sm">Your name</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="input-field"
          maxLength={30}
        />
      </div>

      <label className="label text-sm mb-3">Choose your character</label>
      <div className="space-y-3">
        {slugEntries.map(([slug, idx]) => {
          const char = game.mystery.characters[idx]
          const claimed = state?.players[slug]
          const isSelected = selectedChar === slug
          return (
            <button
              key={slug}
              type="button"
              disabled={!!claimed}
              onClick={() => setSelectedChar(slug)}
              className={`card w-full text-left p-4 transition-all ${
                claimed ? 'opacity-40 cursor-not-allowed' :
                isSelected ? 'border-gold ring-1 ring-gold cursor-pointer' :
                'hover:border-gray-500 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{char.name}</p>
                  <p className="text-gray-500 text-xs">{char.role}</p>
                </div>
                {claimed && <span className="text-sage text-xs">Taken by {claimed}</span>}
              </div>
              <p className="text-gray-400 text-xs mt-2">{char.publicBio}</p>
            </button>
          )
        })}
      </div>

      <button
        onClick={async () => {
          await claimCharacter()
          if (typeof window !== 'undefined' && selectedChar) {
            sessionStorage.setItem(`kp-${gameId}`, selectedChar)
            window.location.href = `/play/${gameId}/${selectedChar}`
          }
        }}
        disabled={!selectedChar || !playerName.trim()}
        className="btn-primary w-full py-4 text-lg mt-6 disabled:opacity-50"
      >
        Lock in character
      </button>
    </div>
  )
}
