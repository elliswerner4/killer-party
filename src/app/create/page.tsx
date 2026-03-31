'use client'

import { useState } from 'react'

const THEMES = [
  { id: '1920s-speakeasy', name: '1920s Speakeasy', desc: 'Jazz, bootleg gin, and a body in the back room' },
  { id: 'victorian-manor', name: 'Victorian Manor', desc: 'A country estate, old money, and older grudges' },
  { id: 'hollywood-noir', name: 'Hollywood Noir', desc: 'Starlets, directors, and a death on set' },
  { id: 'space-station', name: 'Space Station Omega', desc: 'Crew members, airlocks, and someone who doesn\'t belong' },
  { id: 'tropical-island', name: 'Tropical Island Resort', desc: 'Paradise with a dark secret beneath the surface' },
  { id: 'haunted-mansion', name: 'Haunted Mansion', desc: 'A sÃ©ance gone wrong and a very real murder' },
  { id: 'wild-west', name: 'Wild West Saloon', desc: 'Outlaws, gold, and a showdown at sundown' },
  { id: 'art-heist', name: 'Art Gallery Heist', desc: 'A stolen masterpiece and a dead curator' },
]

const DIFFICULTIES = [
  { id: 'casual', name: 'Casual', desc: 'Easy-going â great for first-timers and mixed groups' },
  { id: 'intermediate', name: 'Intermediate', desc: 'Balanced â enough to challenge without frustrating' },
  { id: 'devious', name: 'Devious', desc: 'Complex clues, red herrings, and multiple suspects' },
]

interface GuestInfo {
  name: string
  personality: string
  dietary: string
}

export default function CreatePage() {
  const [tier, setTier] = useState<'classic' | 'grand'>('grand')
  const [theme, setTheme] = useState('')
  const [customTheme, setCustomTheme] = useState('')
  const [guestCount, setGuestCount] = useState(6)
  const [difficulty, setDifficulty] = useState('intermediate')
  const [specialRequests, setSpecialRequests] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Guest personalization
  const [guests, setGuests] = useState<GuestInfo[]>(
    Array.from({ length: 6 }, () => ({ name: '', personality: '', dietary: '' }))
  )
  const [showGuests, setShowGuests] = useState(false)

  const maxGuests = tier === 'classic' ? 8 : 12
  const price = tier === 'classic' ? 35 : 49
  const showCustomTheme = tier === 'grand'

  function handleGuestCountChange(count: number) {
    setGuestCount(count)
    setGuests((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array.from({ length: count - prev.length }, () => ({ name: '', personality: '', dietary: '' }))]
      }
      return prev.slice(0, count)
    })
  }

  function updateGuest(index: number, field: keyof GuestInfo, value: string) {
    setGuests((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const selectedTheme = theme === 'custom' ? customTheme : theme
    if (!selectedTheme) {
      setError('Please select or describe a theme.')
      return
    }

    setLoading(true)

    // Build guest profiles for personalization
    const guestProfiles = guests
      .filter((g) => g.name.trim())
      .map((g) => ({
        name: g.name.trim(),
        personality: g.personality.trim(),
        dietary: g.dietary.trim(),
      }))

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
          guestProfiles: guestProfiles.length > 0 ? guestProfiles : undefined,
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
                  if (t === 'classic' && guestCount > 8) handleGuestCountChange(8)
                  if (t === 'classic' && theme === 'custom') setTheme('')
                }}
                className={`card text-center cursor-pointer transition-all ${
                  tier === t ? 'border-gold ring-1 ring-gold' : 'hover:border-gray-500'
                }`}
              >
                <p className="font-display text-xl text-white capitalize">{t}</p>
                <p className="text-2xl font-display text-gold">${t === 'classic' ? 35 : 49}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {t === 'classic' ? '4â8 guests â¢ curated themes' : 'Up to 12 guests â¢ any theme'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="label">Theme</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            onChange={(e) => handleGuestCountChange(Number(e.target.value))}
            className="w-full accent-gold"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>4 guests</span>
            <span>{maxGuests} guests</span>
          </div>
        </div>

        {/* Guest Personalization */}
        <div>
          <button
            type="button"
            onClick={() => setShowGuests(!showGuests)}
            className="flex items-center gap-3 w-full text-left"
          >
            <label className="label cursor-pointer mb-0">
              Personalize Characters
              <span className="text-gold ml-2 text-xs font-normal tracking-normal normal-case">NEW</span>
            </label>
            <span className="text-gray-500 text-sm ml-auto">{showGuests ? 'â²' : 'â¼'}</span>
          </button>
          <p className="text-gray-500 text-xs mt-1 mb-3">
            Add your guests' names and personalities. We'll craft characters that bring out the best in each player.
          </p>

          {showGuests && (
            <div className="space-y-4">
              {guests.map((guest, i) => (
                <div key={i} className="card p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gold font-display text-sm">Guest {i + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={guest.name}
                    onChange={(e) => updateGuest(i, 'name', e.target.value)}
                    placeholder="Name (e.g., Sarah)"
                    className="input-field text-sm"
                    maxLength={50}
                  />
                  <input
                    type="text"
                    value={guest.personality}
                    onChange={(e) => updateGuest(i, 'personality', e.target.value)}
                    placeholder="Personality note (e.g., 'shy â give a bold character' or 'loves drama')"
                    className="input-field text-sm"
                    maxLength={200}
                  />
                  <input
                    type="text"
                    value={guest.dietary}
                    onChange={(e) => updateGuest(i, 'dietary', e.target.value)}
                    placeholder="Dietary restrictions (e.g., vegetarian, gluten-free)"
                    className="input-field text-sm"
                    maxLength={100}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Difficulty */}
        <div>
          <label className="label">Difficulty</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            placeholder="Inside jokes to weave in? A birthday surprise? Anything goes."
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
            {loading ? 'Setting up your mystery...' : `Checkout â $${price}`}
          </button>
          <p className="text-gray-600 text-xs mt-3">
            Secure payment via Stripe. Your mystery generates instantly after payment.
          </p>
        </div>
      </form>
    </div>
  )
}
