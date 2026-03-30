'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface CharacterData {
  title: string
  theme: string
  tagline: string
  character: {
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
  clues: {
    id: string
    title: string
    content: string
    revealedIn: string
    givenTo: string
  }[]
}

export default function CharacterPage() {
  const params = useParams()
  const { id, slug } = params as { id: string; slug: string }
  const [data, setData] = useState<CharacterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchCharacter() {
      try {
        const res = await fetch(`/api/games/${id}?character=${slug}`)
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to load character')
        }
        const json = await res.json()
        setData(json)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchCharacter()
  }, [id, slug])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-6" />
        <p className="text-gold font-display text-xl">Loading your character...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-blood-light font-display text-2xl mb-4">Character Not Found</p>
        <p className="text-gray-400 mb-6 max-w-md">
          {error || 'This character link may have expired or is invalid.'}
        </p>
        <p className="text-gray-500 text-sm">
          Ask your host for a new link, or visit{' '}
          <a href="/" className="text-gold underline">Killer Party</a> to create your own mystery.
        </p>
      </div>
    )
  }

  const { character, clues } = data

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Game header */}
      <div className="text-center mb-8 sm:mb-10">
        <p className="text-gold tracking-widest uppercase text-xs sm:text-sm mb-2">
          {data.title}
        </p>
        <p className="text-gray-500 text-sm italic">{data.tagline}</p>
      </div>

      {/* Character identity */}
      <div className="text-center mb-8 sm:mb-10 pb-6 border-b border-gray-700">
        <h1 className="font-display text-3xl sm:text-4xl text-white mb-2">
          {character.name}
        </h1>
        <p className="text-gold italic text-lg">{character.role}</p>
        {character.specialSkill && (
          <p className="text-sm text-gray-400 mt-3 bg-noir-light inline-block px-4 py-1.5 rounded-full border border-gray-600">
            <span className="text-gold">Skill:</span> {character.specialSkill}
          </p>
        )}
      </div>

      {/* Public bio */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Your Public Identity
        </h2>
        <p className="text-gray-300 leading-relaxed">{character.publicBio}</p>
        <p className="text-gray-600 text-xs mt-2 italic">
          Everyone at the party knows this about you.
        </p>
      </div>

      {/* Private secrets */}
      <div className="mb-8 bg-blood/10 border border-blood/30 rounded-xl p-5 sm:p-6">
        <h2 className="text-sm font-medium text-blood-light uppercase tracking-wide mb-3">
          Your Secrets \u2014 For Your Eyes Only
        </h2>
        <p className="text-gray-300 leading-relaxed">{character.privateSecrets}</p>
        <p className="text-blood-light/60 text-xs mt-3 italic">
          Do not share this with other guests.
        </p>
      </div>

      {/* Goals */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Your Goals Tonight
        </h2>
        <p className="text-gray-300 leading-relaxed">{character.goals}</p>
      </div>

      {/* Tasks / Missions */}
      {character.tasks && character.tasks.length > 0 && (
        <div className="mb-8 bg-gold/5 border border-gold/20 rounded-xl p-5 sm:p-6">
          <h2 className="text-sm font-medium text-gold uppercase tracking-wide mb-3">
            Your Missions
          </h2>
          <p className="text-gray-600 text-xs mb-3 italic">
            Complete these during the evening. Some are secret \u2014 don&apos;t let others catch you.
          </p>
          <ul className="space-y-3">
            {character.tasks.map((task, i) => (
              <li
                key={i}
                className="text-gray-300 text-sm sm:text-base pl-4 border-l-2 border-gold/40 flex items-start gap-2"
              >
                <span className="text-gold/60 text-xs mt-0.5 shrink-0">#{i + 1}</span>
                {task}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Relationships */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Your Relationships
        </h2>
        <p className="text-gray-300 leading-relaxed">{character.relationships}</p>
      </div>

      {/* Conversation starters */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Conversation Starters
        </h2>
        <p className="text-gray-600 text-xs mb-3 italic">
          Use these to spark interactions with other guests. Stay in character!
        </p>
        <ul className="space-y-3">
          {character.conversationPrompts.map((prompt, i) => (
            <li
              key={i}
              className="text-gray-300 text-sm sm:text-base pl-4 border-l-2 border-gold/40 py-1"
            >
              &ldquo;{prompt}&rdquo;
            </li>
          ))}
        </ul>
      </div>

      {/* Clues assigned to this character */}
      {clues.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Your Clues
          </h2>
          <p className="text-gray-600 text-xs mb-3 italic">
            These will be revealed to you during the evening. The host will hand them to you at the right time.
          </p>
          <div className="space-y-3">
            {clues.map((clue) => (
              <div
                key={clue.id}
                className="bg-noir-light border border-gray-700 rounded-lg p-4"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                  <h3 className="font-display text-base text-white">{clue.title}</h3>
                  <span className="text-xs bg-noir px-2 py-1 rounded text-gray-400 capitalize w-fit">
                    {clue.revealedIn}
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{clue.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="text-center pt-6 border-t border-gray-700">
        <p className="text-gray-600 text-xs">
          Powered by{' '}
          <a href="/" className="text-gold hover:underline">Killer Party</a>
          {' '}\u2014 Custom Murder Mystery Dinner Parties
        </p>
      </div>
    </div>
  )
}
