'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface CharacterData {
  name: string
  role: string
  specialSkill: string
  publicBio: string
  privateSecrets: string
  goals: string
  tasks: string[]
  relationships: string
  conversationPrompts: string[]
}

interface ClueData {
  id: string
  title: string
  content: string
  revealedIn: string
  givenTo: string
}

interface GameData {
  id: string
  mystery: {
    title: string
    characters: CharacterData[]
    clues: ClueData[]
    reveal: { accusationPrompt: string }
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

export default function CharacterView() {
  const params = useParams()
  const gameId = params.code as string
  const slug = params.slug as string

  const [game, setGame] = useState<GameData | null>(null)
  const [state, setState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set())
  const [voteTarget, setVoteTarget] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [expandedClue, setExpandedClue] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'brief' | 'clues' | 'tasks'>('brief')

  // Load game data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/games/${gameId}?guest=${encodeURIComponent(slug)}`)
        if (!res.ok) throw new Error('Game not found')
        const data = await res.json()
        setGame(data)
      } catch {
        setError('Game not found.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [gameId, slug])

  // Poll game state
  const pollState = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/${gameId}/state`)
      if (res.ok) {
        const data = await res.json()
        setState(data)
      }
    } catch { /* ignore */ }
  }, [gameId])

  useEffect(() => {
    pollState()
    const interval = setInterval(pollState, 3000)
    return () => clearInterval(interval)
  }, [pollState])

  // Load completed tasks from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(`kp-tasks-${gameId}-${slug}`)
      if (saved) {
        try {
          setCompletedTasks(new Set(JSON.parse(saved)))
        } catch { /* ignore */ }
      }
    }
  }, [gameId, slug])

  function toggleTask(index: number) {
    setCompletedTasks(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`kp-tasks-${gameId}-${slug}`, JSON.stringify(Array.from(next)))
      }
      return next
    })
  }

  async function submitVote() {
    if (!voteTarget) return
    try {
      await fetch(`/api/games/${gameId}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'vote', playerSlug: slug, characterSlug: voteTarget }),
      })
      setHasVoted(true)
    } catch { /* ignore */ }
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
        <p className="text-blood-light font-display text-2xl mb-4">Game Not Found</p>
        <a href="/join" className="text-gold underline">Try another code</a>
      </div>
    )
  }

  const charIndex = game.characterSlugs[slug]
  const character = charIndex !== undefined ? game.mystery.characters[charIndex] : null

  if (!character) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-blood-light font-display text-2xl mb-4">Character Not Found</p>
        <a href={`/play/${gameId}`} className="text-gold underline">Back to character select</a>
      </div>
    )
  }

  // Get clues visible to this character up to the current act
  const visibleClues = state?.phase === 'playing' || state?.phase === 'accusations' || state?.phase === 'reveal'
    ? game.mystery.clues.filter(c => {
        const clueAct = parseInt(c.revealedIn.replace('act', ''))
        const isForMe = c.givenTo.toLowerCase().includes(character.name.toLowerCase())
        return isForMe && clueAct <= (state?.currentAct || 0)
      })
    : []

  const otherCharacters = Object.entries(game.characterSlugs).filter(([s]) => s !== slug)
  const playerName = state?.players[slug] || character.name

  // ====== LOBBY / WAITING ======
  if (!state || state.phase === 'lobby') {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="text-gold text-xs tracking-widest uppercase mb-1">Your Character</p>
          <h1 className="font-display text-3xl text-white">{character.name}</h1>
          <p className="text-gray-400 text-sm mt-1">{character.role}</p>
        </div>

        <div className="card p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
              <span className="text-gold font-display text-lg">{character.name[0]}</span>
            </div>
            <div>
              <p className="text-white font-medium">{playerName}</p>
              <p className="text-gray-500 text-xs">Playing as {character.name}</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{character.publicBio}</p>
        </div>

        <div className="card p-5 text-center">
          <div className="w-8 h-8 border-3 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gold font-display text-lg mb-1">Waiting for Host</p>
          <p className="text-gray-500 text-sm">The mystery will begin shortly...</p>
          <p className="text-gray-600 text-xs mt-3">
            Your private secrets and mission will be revealed when the game starts.
          </p>
        </div>
      </div>
    )
  }

  // ====== FINISHED ======
  if (state.phase === 'finished') {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <h1 className="font-display text-3xl text-gold mb-4">Case Closed</h1>
        <p className="text-gray-400 mb-6">Thanks for playing as {character.name}!</p>
        <div className="card p-5">
          <p className="text-gray-300 text-sm">
            {completedTasks.size} of {character.tasks.length} tasks completed
          </p>
        </div>
      </div>
    )
  }

  // ====== ACTIVE GAME (playing / accusations / reveal) ======
  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl text-white">{character.name}</h1>
          <p className="text-gray-500 text-xs">{character.role}</p>
        </div>
        <div className="text-right">
          {state.phase === 'playing' && (
            <span className="text-gold font-display text-sm">Act {state.currentAct} of 4</span>
          )}
          {state.phase === 'accusations' && (
            <span className="text-blood-light font-display text-sm">Accusation Time</span>
          )}
          {state.phase === 'reveal' && (
            <span className="text-blood-light font-display text-sm">The Reveal</span>
          )}
        </div>
      </div>

      {/* Skill Badge */}
      <div className="card p-3 mb-6 border-gold/30 bg-gold/5">
        <p className="text-gold text-xs tracking-widest uppercase mb-1">Your Special Skill</p>
        <p className="text-white text-sm">{character.specialSkill}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-900 rounded-lg p-1">
        {(['brief', 'clues', 'tasks'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-gray-800 text-gold'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'brief' ? 'Brief' : tab === 'clues' ? `Clues (${visibleClues.length})` : 'Tasks'}
          </button>
        ))}
      </div>

      {/* Brief Tab */}
      {activeTab === 'brief' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-display text-lg text-gold mb-3">Private Secrets</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {character.privateSecrets}
            </p>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-lg text-gold mb-3">Your Goals</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {character.goals}
            </p>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-lg text-gold mb-3">Relationships</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {character.relationships}
            </p>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-lg text-gold mb-3">Conversation Starters</h3>
            <div className="space-y-2">
              {character.conversationPrompts.map((prompt, i) => (
                <p key={i} className="text-gray-300 text-sm pl-3 border-l-2 border-gold/30">
                  &ldquo;{prompt}&rdquo;
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clues Tab */}
      {activeTab === 'clues' && (
        <div className="space-y-3">
          {visibleClues.length === 0 ? (
            <div className="card p-5 text-center">
              <p className="text-gray-500 text-sm">No clues revealed yet. Stay alert!</p>
            </div>
          ) : (
            visibleClues.map(clue => (
              <button
                key={clue.id}
                type="button"
                onClick={() => setExpandedClue(expandedClue === clue.id ? null : clue.id)}
                className="card w-full text-left p-4 transition-all hover:border-gold/50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-medium">{clue.title}</p>
                  <span className="text-gold text-xs">{clue.revealedIn.replace('act', 'Act ')}</span>
                </div>
                {expandedClue === clue.id && (
                  <p className="text-gray-300 text-sm mt-3 leading-relaxed whitespace-pre-wrap">
                    {clue.content}
                  </p>
                )}
              </button>
            ))
          )}

          {state.phase === 'playing' && state.currentAct < 4 && (
            <p className="text-gray-600 text-xs text-center mt-4">
              More clues will be revealed in later acts...
            </p>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          <div className="card p-4 mb-2">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Progress</p>
              <p className="text-gold font-display">
                {completedTasks.size} / {character.tasks.length}
              </p>
            </div>
            <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all duration-500"
                style={{ width: `${character.tasks.length > 0 ? (completedTasks.size / character.tasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {character.tasks.map((task, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleTask(i)}
              className={`card w-full text-left p-4 flex items-start gap-3 transition-all ${
                completedTasks.has(i) ? 'opacity-60' : ''
              }`}
            >
              <div className={`w-5 h-5 mt-0.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                completedTasks.has(i)
                  ? 'border-gold bg-gold/20'
                  : 'border-gray-600'
              }`}>
                {completedTasks.has(i) && (
                  <svg className="w-3 h-3 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${
                completedTasks.has(i) ? 'text-gray-500 line-through' : 'text-gray-300'
              }`}>
                {task}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Accusation Phase Voting */}
      {state.phase === 'accusations' && (
        <div className="mt-8">
          <div className="card p-5">
            <h3 className="font-display text-xl text-blood-light mb-3">Who Did It?</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {game.mystery.reveal.accusationPrompt}
            </p>

            {hasVoted || state.votes[slug] ? (
              <div className="text-center py-4">
                <p className="text-gold font-display text-lg">Vote Submitted</p>
                <p className="text-gray-500 text-sm mt-1">Waiting for other players...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {otherCharacters.map(([otherSlug, idx]) => {
                  const otherChar = game.mystery.characters[idx]
                  return (
                    <button
                      key={otherSlug}
                      type="button"
                      onClick={() => setVoteTarget(otherSlug)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        voteTarget === otherSlug
                          ? 'border-blood-light bg-blood/10'
                          : 'border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <p className="text-white text-sm font-medium">{otherChar.name}</p>
                      <p className="text-gray-500 text-xs">{otherChar.role}</p>
                    </button>
                  )
                })}
                <button
                  onClick={submitVote}
                  disabled={!voteTarget}
                  className="btn-primary w-full py-3 mt-3 disabled:opacity-50"
                >
                  Submit Accusation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reveal Phase */}
      {state.phase === 'reveal' && (
        <div className="mt-8">
          <div className="card p-5 text-center">
            <p className="text-blood-light font-display text-xl mb-2">The Truth Is Out</p>
            <p className="text-gray-400 text-sm">Look up from your phone — the host is revealing the killer!</p>
          </div>
        </div>
      )}

      {/* Floating act indicator */}
      {state.phase === 'playing' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/95 border border-gray-800 rounded-full px-5 py-2 backdrop-blur-sm">
          <p className="text-gold font-display text-sm">
            Act {state.currentAct} of 4
          </p>
        </div>
      )}
    </div>
  )
}
