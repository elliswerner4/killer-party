'use client'

import { useState } from 'react'

const THEMES = [
  { id: '1920s-speakeasy', name: '1920s Speakeasy', desc: 'Jazz, bootleg gin, and a body in the back room' },
  { id: 'victorian-manor', name: 'Victorian Manor', desc: 'A country estate, old money, and older grudges' },
  { id: 'hollywood-noir', name: 'Hollywood Noir', desc: 'Starlets, directors, and a death on set' },
  { id: 'space-station', name: 'Space Station Omega', desc: 'Crew members, airlocks, and someone who doesn\'t belong' },
  { id: 'tropical-island', name: 'Tropical Island Resort', desc: 'Paradise with a dark secret beneath the surface' },
  { id: 'haunted-mansion', name: 'Haunted Mansion', desc: 'A s\u00E9ance gone wrong and a very real murder' },
  { id: 'wild-west', name: 'Wild West Saloon', desc: 'Outlaws, gold, and a showdown at sundown' },
  { id: 'art-heist', name: 'Art Gallery Heist', desc: 'A stolen masterpiece and a dead curator' },
]

const DIFFICULTIES = [
  { id: 'casual', name: 'Casual', desc: 'Easy-going \u2014 great for first-timers and mixed groups' },
  { id: 'intermediate', name: 'Intermediate', desc: 'Balanced \u2014 enough to challenge without frustrating' },
  { id: 'devious', name: 'Devious', desc: 'Complex clues, red herrings, and multiple suspects' },
]

export default function CreatePage() {
  const [tier, setTier] = useState<'classic' | 'grand'>('grand')
  const [theme, setTheme] = useState('')
  const [customTheme, setCustomTheme] = useState('')
  const [guestCount, setGuestCount] = useState(6)
  const [difficulty, setDifficulty] = useState('intermediate')
  const [specialRequests, setSpecialRequests] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const maxGuests = tier === 'classic' ? 8 : 12
  const price = tier === 'classic' ? 35 : 49
  const showCustomTheme = tier === 'grand'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const selectedTheme = theme === 'custom' ? customTheme : theme
    if (!selectedTheme) {
      setError('Please select or describe a theme.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          theme: selectedTheme,
          guestCount,
          difficulty,
          specialRequests,
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-center mb-2">
        Design Your <span className="text-blood-light">Mystery</span>
      </h1>
      <p className="text-gray-400 text-center mb-12">
        Customize every detail. We'll build something no one's ever played before.
      </p>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Tier Selection */}
        <div>
          <label className="label">Package</label>
          <div className="grid grid-cols-2 gap-4">
            {(['classic', 'grand'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTier(t)
                  if (t === 'classic' && guestCount > 8) setGuestCount(8)
                  if (t === 'classic' && theme === 'custom') setTheme('')
                }}
                className={`card text-center cursor-pointer transition-all ${
                  tier === t ? 'border-gold ring-1 ring-gold' : 'hover:border-gray-500'
                }`}
              >
                <p className="font-display text-xl text-white capitalize">{t}</p>
                <p className="text-2xl font-display text-gold">${t === 'classic' ? 35 : 49}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {t === 'classic' ? '4\u20138 guests \u2022 curated themes' : 'Up to 12 guests \u2022 any theme'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="label">Theme</label>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`card text-left cursor-pointer transition-all text-sm ${
                  theme === t.id ? 'border-gold ring-1 ring-gold' : 'hover:border-gray-500'
                }`}
              >
                <p className="text-white font-medium">{t.name}</p>
                <p className="text-gray-500 text-xs mt-1">{t.desc}</p>
              </button>
            ))}
            {showCustomTheme && (
              <button
                type="button"
                onClick={() => setTheme('custom')}
                className={`card text-left cursor-pointer transition-all text-sm ${
                  theme === 'custom' ? 'border-gold ring-1 ring-gold' : 'hover:border-gray-500'
                }`}
              >
                <p className="text-white font-medium">Custom Theme</p>
                <p className="text-gray-500 text-xs mt-1">Describe anything you can imagine</p>
              </button>
            )}
          </div>
          {theme === 'custom' && (
            <textarea
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              placeholder="Describe your dream setting... e.g., 'A 1970s disco club where the DJ was found dead in the booth'"
              className="input-field mt-3 h-24 resize-none"
              maxLength={500}
            />
          )}
        </div>

        {/* Guest Count */}
        <div>
          <label className="label">
            Number of Guests: <span className="text-gold font-display text-lg">{guestCount}</span>
          </label>
          <input
            type="range"
            min={4}
            max={maxGuests}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="w-full accent-gold"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>4 guests</span>
            <span>{maxGuests} guests</span>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="label">Difficulty</label>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id)}
                className={`card text-center cursor-pointer transition-all text-sm ${
                  difficulty === d.id ? 'border-gold ring-1 ring-gold' : 'hover:border-gray-500'
                }`}
              >
                <p className="text-white font-medium">{d.name}</p>
                <p className="text-gray-500 text-xs mt-1">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label className="label">Special Requests <span className="text-gray-600">(optional)</span></label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Any dietary restrictions for the menu? Specific guest names to use? Want to embarrass the birthday person?"
            className="input-field h-24 resize-none"
            maxLength={1000}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-blood/20 border border-blood rounded-lg p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-lg py-4 px-12 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up your mystery...' : `Checkout \u2014 $${price}`}
          </button>
          <p className="text-gray-600 text-xs mt-3">
            Secure payment via Stripe. Your mystery generates instantly after payment.
          </p>
        </div>
      </form>
    </div>
  )
}
