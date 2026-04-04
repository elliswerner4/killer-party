'use client'

import { useState } from 'react'

interface Mystery {
  title: string
  tagline: string
  theme: string
  guestCount: number
  difficulty: string
  hostGuide: {
    overview: string
    timeline: string
    act1: string
    act2: string
    act3: string
    act4: string
    tips: string
  }
  characters: {
    name: string
    role: string
    specialSkill: string
    publicBio: string
    privateSecrets: string
    goals: string
    tasks: string[]
    relationships: string
    conversationPrompts: string[]
  }[]
  clues: {
    id: string
    title: string
    content: string
    revealedIn: string
    givenTo: string
  }[]
  reveal: {
    buildup: string
    accusationPrompt: string
    revealScript: string
    epilogue: string
  }
  menu: {
    theme: string
    appetizers: string[]
    mains: string[]
    desserts: string[]
    cocktails: string[]
    nonAlcoholic: string[]
  }
  atmosphere: {
    decorations: string
    music: string
    dressCode: string
    lighting: string
    tableSettings: string
  }
}

type Tab = 'host' | 'characters' | 'clues' | 'reveal' | 'menu' | 'atmosphere' | 'share'

interface CharacterLink {
  name: string
  role: string
  slug: string
  url: string
}

export function MysteryViewer({ mystery }: { mystery: Mystery }) {
  const [activeTab, setActiveTab] = useState<Tab>('host')
  const [selectedCharacter, setSelectedCharacter] = useState(0)
  const [gameId, setGameId] = useState<string | null>(null)
  const [gameCode, setGameCode] = useState<string | null>(null)
  const [characterLinks, setCharacterLinks] = useState<CharacterLink[]>([])
  const [sharing, setSharing] = useState(false)
  const [shareError, setShareError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedHost, setCopiedHost] = useState(false)
  const [copiedJoin, setCopiedJoin] = useState(false)
  const [hostEmail, setHostEmail] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [hostDashUrl, setHostDashUrl] = useState('')
  const [joinUrl, setJoinUrl] = useState('')

  async function createShareLinks() {
    setSharing(true)
    setShareError('')
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mystery }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create share links')
      }
      const data = await res.json()
      setGameId(data.gameId)
      setGameCode(data.gameCode || '')

      const baseUrl = window.location.origin
      const hostUrl = `${baseUrl}/play/${data.gameId}?host=1`
      const guestJoinUrl = `${baseUrl}/join`
      setHostDashUrl(hostUrl)
      setJoinUrl(guestJoinUrl)

      const links: CharacterLink[] = Object.entries(data.characterSlugs as Record<string, number>).map(
        ([slug, index]) => ({
          name: mystery.characters[index].name,
          role: mystery.characters[index].role,
          slug,
          url: `${baseUrl}/game/${data.gameId}/character/${slug}`,
        })
      )
      setCharacterLinks(links)
      setActiveTab('share')
    } catch (err: unknown) {
      setShareError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSharing(false)
    }
  }

  async function copyToClipboard(text: string, setter: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const input = document.createElement('input')
      input.value = text
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  async function copyLink(url: string, index: number) {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    }
  }

  async function sendHostEmail() {
    if (!hostEmail.trim() || !hostDashUrl) return
    setEmailSending(true)
    try {
      const allLinks = characterLinks.map(l => `${l.name} (${l.role}): ${l.url}`).join('\n')
      const body = `Your Killer Party is ready!\n\nMystery: ${mystery.title}\nGame Code: ${gameCode || 'N/A'}\n\n--- HOST DASHBOARD ---\nOpen this link on your phone the night of the party to control the game:\n${hostDashUrl}\n\n--- GUEST JOIN LINK ---\nSend this to all guests:\n${joinUrl}\nThey enter code: ${gameCode || 'N/A'}\n\n--- INDIVIDUAL CHARACTER LINKS ---\n${allLinks}\n\nHave a killer night!`

      // Try to use mailto as a fallback since we may not have an email API
      const mailtoLink = `mailto:${encodeURIComponent(hostEmail)}?subject=${encodeURIComponent(`Your Killer Party: ${mystery.title}`)}&body=${encodeURIComponent(body)}`
      window.open(mailtoLink, '_blank')
      setEmailSent(true)
    } catch {
      // Fallback — copy everything to clipboard
      const allLinks = characterLinks.map(l => `${l.name} (${l.role}): ${l.url}`).join('\n')
      const body = `Host Dashboard: ${hostDashUrl}\nGuest Join: ${joinUrl}\nGame Code: ${gameCode || 'N/A'}\n\nCharacter Links:\n${allLinks}`
      await navigator.clipboard.writeText(body)
      setEmailSent(true)
    } finally {
      setEmailSending(false)
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'host', label: 'Host Guide' },
    { id: 'characters', label: 'Characters' },
    { id: 'clues', label: 'Clues' },
    { id: 'reveal', label: 'Reveal' },
    { id: 'menu', label: 'Menu' },
    { id: 'atmosphere', label: 'Atmosphere' },
    ...(characterLinks.length > 0 ? [{ id: 'share' as Tab, label: '🔗 Share & Play' }] : []),
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-gold tracking-widest uppercase text-sm mb-2">Your Mystery is Ready</p>
        <h1 className="font-display text-4xl md:text-5xl text-white mb-3">{mystery.title}</h1>
        <p className="text-gray-400 text-lg italic">{mystery.tagline}</p>
        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
          <span>{mystery.guestCount} guests</span>
          <span>•</span>
          <span className="capitalize">{mystery.difficulty}</span>
          <span>•</span>
          <span>{mystery.theme}</span>
        </div>
      </div>

      {/* ===== PROMINENT LAUNCH SECTION ===== */}
      {characterLinks.length === 0 ? (
        <div className="mb-10 no-print">
          <div className="relative bg-gradient-to-br from-gold/20 via-noir-light to-blood/20 border-2 border-gold/60 rounded-2xl p-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-blood/5 animate-pulse" />
            <div className="relative z-10">
              <div className="text-4xl mb-3">🎭</div>
              <h2 className="font-display text-2xl md:text-3xl text-white mb-3">Ready to Host Your Party?</h2>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                Launch the companion app to get your Host Dashboard, game code, and shareable links for every guest.
              </p>
              <button
                onClick={createShareLinks}
                disabled={sharing}
                className="bg-gold hover:bg-gold/90 text-noir-dark font-bold py-4 px-10 rounded-xl text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-gold/20"
              >
                {sharing ? (
                  <span className="flex items-center gap-3 justify-center">
                    <span className="w-5 h-5 border-3 border-noir-dark/30 border-t-noir-dark rounded-full animate-spin" />
                    Creating your game...
                  </span>
                ) : (
                  '🚀 Launch Companion App'
                )}
              </button>
              <p className="text-gray-500 text-xs mt-4">
                This creates your Host Dashboard + guest links. You can also browse the mystery content below first.
              </p>
            </div>
          </div>
          {shareError && (
            <div className="bg-blood/20 border border-blood rounded-lg p-3 text-red-300 text-sm text-center mt-4">
              {shareError}
            </div>
          )}
        </div>
      ) : (
        /* ===== GAME IS LIVE — PERSISTENT TOP BAR ===== */
        <div className="mb-10 no-print">
          <div className="bg-gradient-to-r from-green-900/40 to-green-800/20 border-2 border-green-500/50 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium text-sm tracking-wide uppercase">Game Created — You&apos;re All Set</span>
            </div>

            {/* Host Dashboard — THE most important link */}
            <div className="bg-noir/60 border border-gold/40 rounded-xl p-5 mb-5">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <p className="text-gold font-display text-lg mb-1">🎭 Your Host Dashboard</p>
                  <p className="text-gray-400 text-sm mb-2">Open this on your phone the night of the party. It controls everything — acts, clues, reveals.</p>
                  <p className="text-gold/70 text-xs font-mono truncate">{hostDashUrl}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(hostDashUrl, setCopiedHost)}
                  className={`shrink-0 py-3 px-6 rounded-lg font-bold text-sm transition-all ${
                    copiedHost
                      ? 'bg-green-900/60 text-green-300 border border-green-600'
                      : 'bg-gold text-noir-dark hover:bg-gold/90 shadow-md'
                  }`}
                >
                  {copiedHost ? '✓ Copied!' : 'Copy Dashboard Link'}
                </button>
              </div>
            </div>

            {/* Game Code + Join Link */}
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <div className="bg-noir/60 border border-gray-600 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Game Code</p>
                <p className="font-display text-3xl text-gold tracking-wider">{gameCode || '—'}</p>
                <p className="text-gray-500 text-xs mt-2">Guests enter this to join</p>
              </div>
              <div className="bg-noir/60 border border-gray-600 rounded-xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-2 text-center">Guest Join Link</p>
                <p className="text-gold/70 text-xs font-mono text-center mb-3 truncate">{joinUrl}</p>
                <button
                  onClick={() => copyToClipboard(joinUrl, setCopiedJoin)}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    copiedJoin
                      ? 'bg-green-900/60 text-green-300 border border-green-600'
                      : 'bg-noir-light text-gold border border-gray-600 hover:border-gold'
                  }`}
                >
                  {copiedJoin ? '✓ Copied!' : 'Copy Join Link'}
                </button>
              </div>
            </div>

            {/* Email yourself everything */}
            <div className="bg-noir/60 border border-gray-600 rounded-xl p-5">
              <p className="text-white font-medium text-sm mb-1">📧 Email Yourself Everything</p>
              <p className="text-gray-400 text-xs mb-4">Get the Host Dashboard link, game code, and all character links sent straight to your inbox so you have them ready on party night.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={hostEmail}
                  onChange={(e) => setHostEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-noir border border-gray-600 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                />
                <button
                  onClick={sendHostEmail}
                  disabled={!hostEmail.trim() || emailSending || emailSent}
                  className={`shrink-0 py-3 px-6 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    emailSent
                      ? 'bg-green-900/60 text-green-300 border border-green-600'
                      : 'bg-blood hover:bg-blood/80 text-white'
                  }`}
                >
                  {emailSent ? '✓ Email Opened' : emailSending ? 'Sending...' : 'Send to My Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Small action bar for print */}
      <div className="flex justify-center mb-8 no-print">
        <button onClick={() => window.print()} className="btn-secondary text-sm py-2 px-6">
          Print Entire Package
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center no-print overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.id
                ? tab.id === 'share' ? 'bg-green-600 text-white ring-2 ring-green-400/50' : 'bg-gold text-noir-dark'
                : tab.id === 'share' ? 'bg-green-900/30 text-green-400 border border-green-600/50 hover:bg-green-900/50' : 'bg-noir-light text-gray-400 hover:text-white hover:bg-noir-light/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card">
        {/* HOST GUIDE */}
        {activeTab === 'host' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl text-gold mb-4">Host Guide</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{mystery.hostGuide.overview}</p>
            </div>
            <div>
              <h3 className="font-display text-xl text-white mb-3">Evening Timeline</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{mystery.hostGuide.timeline}</p>
            </div>
            {[
              { title: 'Act 1 — The Gathering', content: mystery.hostGuide.act1 },
              { title: 'Act 2 — The Discovery', content: mystery.hostGuide.act2 },
              { title: 'Act 3 — The Investigation', content: mystery.hostGuide.act3 },
              { title: 'Act 4 — The Reveal', content: mystery.hostGuide.act4 },
            ].map((act) => (
              <div key={act.title}>
                <h3 className="font-display text-xl text-white mb-3">{act.title}</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{act.content}</p>
              </div>
            ))}
            <div>
              <h3 className="font-display text-xl text-white mb-3">Tips & Contingencies</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{mystery.hostGuide.tips}</p>
            </div>
          </div>
        )}

        {/* CHARACTERS */}
        {activeTab === 'characters' && (
          <div>
            <h2 className="font-display text-2xl text-gold mb-6">Character Sheets</h2>
            <p className="text-gray-500 text-sm mb-6 no-print">
              Print each character sheet individually to hand out to guests. The private sections are for their eyes only.
            </p>
            {/* Character selector */}
            <div className="flex flex-wrap gap-2 mb-8 no-print">
              {mystery.characters.map((char, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCharacter(i)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    selectedCharacter === i
                      ? 'bg-blood text-white'
                      : 'bg-noir text-gray-400 hover:text-white'
                  }`}
                >
                  {char.name}
                </button>
              ))}
            </div>
            {/* Selected character */}
            {mystery.characters[selectedCharacter] && (
              <div className="space-y-6">
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="font-display text-2xl text-white">
                    {mystery.characters[selectedCharacter].name}
                  </h3>
                  <p className="text-gold italic">{mystery.characters[selectedCharacter].role}</p>
                  {mystery.characters[selectedCharacter].specialSkill && (
                    <p className="text-sm text-gray-400 mt-2 bg-noir/50 inline-block px-3 py-1 rounded-full border border-gray-600">
                      <span className="text-gold">Skill:</span> {mystery.characters[selectedCharacter].specialSkill}
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Public Bio — Everyone Knows This
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {mystery.characters[selectedCharacter].publicBio}
                  </p>
                </div>
                <div className="bg-blood/10 border border-blood/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blood-light uppercase tracking-wide mb-2">
                    Your Secrets — For Your Eyes Only
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {mystery.characters[selectedCharacter].privateSecrets}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Your Goals Tonight
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {mystery.characters[selectedCharacter].goals}
                  </p>
                </div>
                {mystery.characters[selectedCharacter].tasks && mystery.characters[selectedCharacter].tasks.length > 0 && (
                  <div className="bg-gold/5 border border-gold/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gold uppercase tracking-wide mb-3">
                      Your Missions
                    </h4>
                    <ul className="space-y-2">
                      {mystery.characters[selectedCharacter].tasks.map((task, i) => (
                        <li key={i} className="text-gray-300 text-sm pl-4 border-l-2 border-gold/40 flex items-start gap-2">
                          <span className="text-gold/60 text-xs mt-0.5 shrink-0">#{i + 1}</span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Your Relationships
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {mystery.characters[selectedCharacter].relationships}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Conversation Starters
                  </h4>
                  <ul className="space-y-2">
                    {mystery.characters[selectedCharacter].conversationPrompts.map((p, i) => (
                      <li key={i} className="text-gray-300 text-sm pl-4 border-l-2 border-gold/30">
                        &ldquo;{p}&rdquo;
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CLUES */}
        {activeTab === 'clues' && (
          <div>
            <h2 className="font-display text-2xl text-gold mb-6">Clue Cards</h2>
            <p className="text-gray-500 text-sm mb-6 no-print">
              Print and cut these out. Hand them to the specified character at the specified time.
            </p>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
              {mystery.clues.map((clue) => (
                <div key={clue.id} className="bg-noir border border-gray-700 rounded-lg p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-display text-lg text-white">{clue.title}</h3>
                    <span className="text-xs bg-noir-light px-2 py-1 rounded text-gray-400 capitalize">
                      {clue.revealedIn}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">{clue.content}</p>
                  <p className="text-xs text-gold">Give to: {clue.givenTo}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVEAL */}
        {activeTab === 'reveal' && (
          <div className="space-y-8">
            <h2 className="font-display text-2xl text-gold mb-4">The Reveal</h2>
            <div>
              <h3 className="font-display text-xl text-white mb-3">Building Tension</h3>
              <p className="text-gray-300 leading-relaxed italic whitespace-pre-line">
                {mystery.reveal.buildup}
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl text-white mb-3">Accusation Round</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {mystery.reveal.accusationPrompt}
              </p>
            </div>
            <div className="bg-blood/10 border border-blood/30 rounded-lg p-6">
              <h3 className="font-display text-xl text-blood-light mb-3">The Big Reveal</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {mystery.reveal.revealScript}
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl text-white mb-3">Epilogue</h3>
              <p className="text-gray-300 leading-relaxed italic whitespace-pre-line">
                {mystery.reveal.epilogue}
              </p>
            </div>
          </div>
        )}

        {/* MENU */}
        {activeTab === 'menu' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl text-gold mb-2">Themed Menu</h2>
              <p className="text-gray-400 italic">{mystery.menu.theme}</p>
            </div>
            {[
              { title: 'Appetizers', items: mystery.menu.appetizers },
              { title: 'Mains', items: mystery.menu.mains },
              { title: 'Desserts', items: mystery.menu.desserts },
              { title: 'Cocktails', items: mystery.menu.cocktails },
              { title: 'Non-Alcoholic', items: mystery.menu.nonAlcoholic },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-display text-xl text-white mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-gray-300 text-sm pl-4 border-l-2 border-gold/30">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* ATMOSPHERE */}
        {activeTab === 'atmosphere' && (
          <div className="space-y-8">
            <h2 className="font-display text-2xl text-gold mb-4">Setting the Scene</h2>
            {[
              { title: 'Decorations', content: mystery.atmosphere.decorations },
              { title: 'Music & Sound', content: mystery.atmosphere.music },
              { title: 'Dress Code', content: mystery.atmosphere.dressCode },
              { title: 'Lighting', content: mystery.atmosphere.lighting },
              { title: 'Table Settings', content: mystery.atmosphere.tableSettings },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-display text-xl text-white mb-3">{section.title}</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* SHARE LINKS */}
        {activeTab === 'share' && characterLinks.length > 0 && (
          <div>
            <h2 className="font-display text-2xl text-gold mb-2">Share with Your Guests</h2>
            <p className="text-gray-400 text-sm mb-6">
              Send each guest their unique link. They&apos;ll see only their character&apos;s info — backstory, secrets, goals, and conversation starters. No spoilers!
            </p>
            <div className="space-y-3">
              {characterLinks.map((link, i) => (
                <div
                  key={link.slug}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 bg-noir border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{link.name}</p>
                    <p className="text-gray-500 text-xs">{link.role}</p>
                    <p className="text-gold/60 text-xs mt-1 truncate font-mono">{link.url}</p>
                  </div>
                  <button
                    onClick={() => copyLink(link.url, i)}
                    className={`shrink-0 text-sm py-2 px-4 rounded-lg font-medium transition-all ${
                      copiedIndex === i
                        ? 'bg-green-900/50 text-green-300 border border-green-700'
                        : 'bg-noir-light text-gold border border-gray-600 hover:border-gold'
                    }`}
                  >
                    {copiedIndex === i ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-noir-light/50 border border-gray-700 rounded-lg">
              <p className="text-gray-400 text-xs leading-relaxed">
                <span className="text-gold font-medium">Tip:</span> Send each link privately (text or DM) so guests can&apos;t see each other&apos;s characters. Each page contains their secrets, goals, and conversation starters — everything they need to play.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
