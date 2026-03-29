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
    publicBio: string
    privateSecrets: string
    goals: string
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

type Tab = 'host' | 'characters' | 'clues' | 'reveal' | 'menu' | 'atmosphere'

export function MysteryViewer({ mystery }: { mystery: Mystery }) {
  const [activeTab, setActiveTab] = useState<Tab>('host')
  const [selectedCharacter, setSelectedCharacter] = useState(0)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'host', label: 'Host Guide' },
    { id: 'characters', label: 'Characters' },
    { id: 'clues', label: 'Clues' },
    { id: 'reveal', label: 'Reveal' },
    { id: 'menu', label: 'Menu' },
    { id: 'atmosphere', label: 'Atmosphere' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-gold tracking-widest uppercase text-sm mb-2">Your Mystery is Ready</p>
        <h1 className="font-display text-4xl md:text-5xl text-white mb-3">{mystery.title}</h1>
        <p className="text-gray-400 text-lg italic">{mystery.tagline}</p>
        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
          <span>{mystery.guestCount} guests</span>
          <span>\u2022</span>
          <span className="capitalize">{mystery.difficulty}</span>
          <span>\u2022</span>
          <span>{mystery.theme}</span>
        </div>
      </div>

      {/* Print All button */}
      <div className="text-center mb-8 no-print">
        <button onClick={() => window.print()} className="btn-secondary text-sm py-2 px-6">
          Print Entire Package
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center no-print">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gold text-noir-dark'
                : 'bg-noir-light text-gray-400 hover:text-white hover:bg-noir-light/80'
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
              { title: 'Act 1 \u2014 The Gathering', content: mystery.hostGuide.act1 },
              { title: 'Act 2 \u2014 The Discovery', content: mystery.hostGuide.act2 },
              { title: 'Act 3 \u2014 The Investigation', content: mystery.hostGuide.act3 },
              { title: 'Act 4 \u2014 The Reveal', content: mystery.hostGuide.act4 },
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
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Public Bio \u2014 Everyone Knows This
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {mystery.characters[selectedCharacter].publicBio}
                  </p>
                </div>
                <div className="bg-blood/10 border border-blood/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blood-light uppercase tracking-wide mb-2">
                    Your Secrets \u2014 For Your Eyes Only
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
                        \"{p}\"
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
            <div className="grid md:grid-cols-2 gap-4">
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
      </div>
    </div>
  )
}
