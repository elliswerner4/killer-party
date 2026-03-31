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
