'use client'

import { useState, useEffect } from 'react'

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

  // A game created from this mystery is remembered on this device, so a reload
  // shows the same game code instead of creating a second game.
  const storageKey = `kp-game:${mystery.title}:${mystery.tagline}`

  function applyGame(data: { gameId: string; gameCode?: string; hostKey?: string; characterSlugs: Record<string, number> }) {
    setGameId(data.gameId)
    setGameCode(data.gameCode || '')
    const baseUrl = window.location.origin
    setHostDashUrl(`${baseUrl}/play/${data.gameId}?host=${data.hostKey || '1'}`)
    setJoinUrl(`${baseUrl}/join`)
    setCharacterLinks(
      Object.entries(data.characterSlugs).map(([slug, index]) => ({
        name: mystery.characters[index].name,
        role: mystery.characters[index].role,
        slug,
        url: `${baseUrl}/game/${data.gameId}/character/${slug}`,
      }))
    )
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) applyGame(JSON.parse(saved))
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

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
      applyGame(data)
      try { localStorage.setItem(storageKey, JSON.stringify(data)) } catch {}
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
    { id: 'host', label: 'Host guide' },
    { id: 'characters', label: 'Characters' },
    { id: 'clues', label: 'Clues' },
    { id: 'reveal', label: 'Reveal' },
    { id: 'menu', label: 'Menu' },
    { id: 'atmosphere', label: 'Atmosphere' },
    ...(characterLinks.length > 0 ? [{ id: 'share' as Tab, label: 'Guest links' }] : []),
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <header className="mb-10">
        <p className="text-gold text-sm">Your mystery is ready</p>
        <h1 className="mt-2 font-display text-4xl md:text-6xl text-parchment">{mystery.title}</h1>
        <p className="mt-3 text-gray-300 text-lg font-display italic">{mystery.tagline}</p>
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div><dt className="text-gray-500">Guests</dt><dd className="text-parchment">{mystery.guestCount}</dd></div>
          <div><dt className="text-gray-500">Difficulty</dt><dd className="text-parchment capitalize">{mystery.difficulty}</dd></div>
          <div><dt className="text-gray-500">Setting</dt><dd className="text-parchment">{mystery.theme}</dd></div>
        </dl>
      </header>

      {characterLinks.length === 0 ? (
        /* Next step: create the live game */
        <section className="mb-10 no-print rounded-lg border border-gold/50 bg-noir-light p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 md:items-center">
          <div>
            <h2 className="font-display text-3xl text-parchment">Next: set up the game for your guests</h2>
            <p className="mt-2 text-gray-300 max-w-[56ch]">
              This gives you a game code for guests to join on their phones, and a host dashboard to run the evening. You can read through the mystery first; nothing is sent to anyone yet.
            </p>
            {shareError && <p role="alert" className="mt-3 text-sm text-blood-light">{shareError}</p>}
          </div>
          <button onClick={createShareLinks} disabled={sharing} className="btn-primary text-base px-7 py-3.5 disabled:opacity-60">
            {sharing ? 'Setting up your game…' : 'Set up the game'}
          </button>
        </section>
      ) : (
        /* The game exists: code, host link, email */
        <section className="mb-10 no-print rounded-lg border border-gold/50 bg-noir-light p-6 md:p-8">
          <div className="grid md:grid-cols-[auto_1fr] gap-8">
            <div>
              <p className="text-sm text-gray-400">Game code for your guests</p>
              <p className="mt-1 font-display text-5xl text-gold tracking-[0.08em]">{gameCode || '—'}</p>
              <p className="mt-2 text-sm text-gray-400 max-w-[30ch]">
                Guests go to <span className="text-parchment">{joinUrl.replace(/^https?:\/\//, '')}</span> and enter this code.
              </p>
              <button onClick={() => copyToClipboard(`Join my murder mystery: go to ${joinUrl} and enter the code ${gameCode}`, setCopiedJoin)} className="btn-secondary mt-4 text-sm py-2 px-4">
                {copiedJoin ? 'Invitation copied' : 'Copy invitation for guests'}
              </button>
            </div>
            <div className="md:border-l md:border-parchment/10 md:pl-8 space-y-6">
              <div>
                <h2 className="font-display text-2xl text-parchment">Your host dashboard</h2>
                <p className="mt-1 text-sm text-gray-300 max-w-[52ch]">
                  Open this on your phone on the night to start each act, see which clues to hand out and reveal the killer. Keep it to yourself: it shows the solution.
                </p>
                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                  <a href={hostDashUrl} target="_blank" rel="noreferrer" className="btn-primary text-sm py-2 px-4">Open host dashboard</a>
                  <button onClick={() => copyToClipboard(hostDashUrl, setCopiedHost)} className="btn-secondary text-sm py-2 px-4">
                    {copiedHost ? 'Link copied' : 'Copy dashboard link'}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="host-email" className="text-sm text-gray-300">Email yourself the code and links so you have them on the night</label>
                <div className="mt-2 flex flex-col sm:flex-row gap-3">
                  <input
                    id="host-email"
                    type="email"
                    value={hostEmail}
                    onChange={(e) => setHostEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field py-2"
                  />
                  <button
                    onClick={sendHostEmail}
                    disabled={!hostEmail.trim() || emailSending}
                    className="btn-secondary text-sm py-2 px-4 shrink-0 disabled:opacity-50"
                  >
                    {emailSent ? 'Email drafted' : 'Email me the links'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sections of the package */}
      <div className="no-print mb-6 flex items-end justify-between gap-4 border-b border-parchment/10">
        <nav aria-label="Mystery sections" className="flex gap-1 overflow-x-auto -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={`whitespace-nowrap px-3 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-gold text-parchment' : 'border-transparent text-gray-400 hover:text-parchment'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button onClick={() => window.print()} className="hidden sm:inline-flex shrink-0 mb-2 text-sm text-gray-300 underline underline-offset-4 decoration-parchment/30 hover:text-parchment">
          Print
        </button>
      </div>

      {/* Tab Content */}
      <div className="card">
        {/* HOST GUIDE */}
        {activeTab === 'host' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl text-gold mb-4">Host guide</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{mystery.hostGuide.overview}</p>
            </div>
            <div>
              <h3 className="font-display text-xl text-white mb-3">Evening timeline</h3>
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
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Public Bio — Everyone Knows This
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {mystery.characters[selectedCharacter].publicBio}
                  </p>
                </div>
                <div className="bg-blood/10 border border-blood/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blood-light mb-2">
                    Your Secrets — For Your Eyes Only
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {mystery.characters[selectedCharacter].privateSecrets}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Your Goals Tonight
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {mystery.characters[selectedCharacter].goals}
                  </p>
                </div>
                {mystery.characters[selectedCharacter].tasks && mystery.characters[selectedCharacter].tasks.length > 0 && (
                  <div className="bg-gold/5 border border-gold/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gold mb-3">
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
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Your Relationships
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {mystery.characters[selectedCharacter].relationships}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
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
            <h2 className="font-display text-2xl text-parchment mb-2">Private links for each guest</h2>
            <p className="text-gray-400 text-sm mb-6">
              If a guest can’t use the game code, send them their own link instead. It opens only their character: backstory, secrets, goals and conversation starters.
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
