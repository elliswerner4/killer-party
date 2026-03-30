import { GeneratedMystery } from './generate'
import crypto from 'crypto'

/**
 * Game storage — Vercel KV in production, in-memory fallback for local dev.
 *
 * In production, set KV_REST_API_URL and KV_REST_API_TOKEN env vars
 * by creating a KV store in the Vercel dashboard and linking it to this project.
 *
 * Games are stored with a 90-day TTL so storage doesn't grow unbounded.
 */

interface StoredGame {
  id: string
  mystery: GeneratedMystery
  createdAt: string
  characterSlugs: Record<string, number> // slug -> character index
}

const GAME_TTL = 60 * 60 * 24 * 90 // 90 days in seconds
const KEY_PREFIX = 'game:'

// In-memory fallback for local development
const memoryStore = new Map<string, StoredGame>()

function useKV(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildCharacterSlugs(mystery: GeneratedMystery): Record<string, number> {
  const characterSlugs: Record<string, number> = {}
  const usedSlugs = new Set<string>()

  mystery.characters.forEach((char, index) => {
    let slug = slugify(char.name)
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${index}`
    }
    usedSlugs.add(slug)
    characterSlugs[slug] = index
  })

  return characterSlugs
}

export async function saveGame(mystery: GeneratedMystery): Promise<StoredGame> {
  const id = crypto.randomBytes(6).toString('hex')
  const characterSlugs = buildCharacterSlugs(mystery)

  const game: StoredGame = {
    id,
    mystery,
    createdAt: new Date().toISOString(),
    characterSlugs,
  }

  if (useKV()) {
    const { kv } = await import('@vercel/kv')
    await kv.set(`${KEY_PREFIX}${id}`, game, { ex: GAME_TTL })
  } else {
    memoryStore.set(id, game)
  }

  return game
}

export async function getGame(id: string): Promise<StoredGame | null> {
  if (useKV()) {
    const { kv } = await import('@vercel/kv')
    return await kv.get<StoredGame>(`${KEY_PREFIX}${id}`)
  } else {
    return memoryStore.get(id) || null
  }
}

export function getCharacterBySlug(
  game: StoredGame,
  slug: string
): { character: GeneratedMystery['characters'][0]; index: number } | undefined {
  const index = game.characterSlugs[slug]
  if (index === undefined) return undefined
  const character = game.mystery.characters[index]
  if (!character) return undefined
  return { character, index }
}
