import { Redis } from '@upstash/redis'
import { GeneratedMystery, MysteryConfig } from './generate'
import crypto from 'crypto'

/**
 * Game storage: Upstash Redis in production (the store behind the former
 * Vercel KV), in-memory fallback for local development.
 *
 * Games are stored with a 90-day TTL so storage doesn't grow unbounded.
 * Game state (current act, votes) is stored separately for the companion app.
 */

export interface StoredGame {
  id: string
  code: string // short join code like "KNIFE-7421"
  mystery: GeneratedMystery
  createdAt: string
  characterSlugs: Record<string, number> // slug -> character index
  hostKey?: string // secret in the host's dashboard link; games saved before this existed have none
}

export interface GameState {
  currentAct: number // 0 = lobby/not started, 1-4 = acts
  phase: 'lobby' | 'playing' | 'accusations' | 'reveal' | 'finished'
  players: Record<string, string> // slug -> player display name (who claimed which character)
  votes: Record<string, string> // voter slug -> accused character slug
  startedAt?: string
}

const GAME_TTL = 60 * 60 * 24 * 90 // 90 days in seconds
const CHECKOUT_TTL = 60 * 60 * 24 * 7 // 7 days for checkout configs
const KEY_PREFIX = 'game:'
const STATE_PREFIX = 'state:'
const CODE_PREFIX = 'code:'
const CHECKOUT_PREFIX = 'checkout:'

// In-memory fallback for local development
const memoryStore = new Map<string, StoredGame>()
const memoryStateStore = new Map<string, GameState>()
const memoryCodeStore = new Map<string, string>() // code -> game id
const memoryCheckoutStore = new Map<string, MysteryConfig>() // sessionId -> config

// Vercel's Upstash integration sets KV_REST_API_*; a store connected
// directly from Upstash sets UPSTASH_REDIS_REST_*. Accept either.
function redisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url, token } : null
}

let client: Redis | null = null
function redis(): Redis {
  if (!client) {
    const cfg = redisConfig()!
    client = new Redis({ url: cfg.url, token: cfg.token, retry: { retries: 2 } })
  }
  return client
}

function useKV(): boolean {
  return redisConfig() !== null
}

/** For the status check: is storage configured, and does it answer? */
export async function storageStatus(): Promise<'ok' | 'not configured' | 'unreachable'> {
  if (!useKV()) return 'not configured'
  try {
    await redis().ping()
    return 'ok'
  } catch (err) {
    console.error('[storage] Redis ping failed:', err)
    return 'unreachable'
  }
}

/** Thrown when the database can't be reached, so routes can say so plainly. */
export class StorageUnavailableError extends Error {
  constructor(cause: unknown) {
    super('Game storage is unreachable')
    this.name = 'StorageUnavailableError'
    console.error('[storage] Redis request failed:', cause)
  }
}

async function kvCall<T>(fn: (kv: Redis) => Promise<T>): Promise<T> {
  try {
    return await fn(redis())
  } catch (err) {
    throw new StorageUnavailableError(err)
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function generateCode(): string {
  const words = ['KNIFE', 'POISON', 'ALIBI', 'CLOAK', 'DAGGER', 'CIPHER', 'SHADOW', 'RAVEN', 'VENOM', 'GHOST', 'FLAME', 'CRYPT', 'SKULL', 'MANOR', 'NOIR']
  const word = words[crypto.randomInt(words.length)]
  // 15 words x 9,000 numbers = 135,000 codes; uniqueness is enforced when saving.
  const num = crypto.randomInt(1000, 10000)
  return `${word}-${num}`
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
  let code = generateCode()
  const characterSlugs = buildCharacterSlugs(mystery)

  const game: StoredGame = {
    id,
    code,
    hostKey: crypto.randomBytes(12).toString('hex'),
    mystery,
    createdAt: new Date().toISOString(),
    characterSlugs,
  }

  const initialState: GameState = {
    currentAct: 0,
    phase: 'lobby',
    players: {},
    votes: {},
  }

  if (useKV()) {
    await kvCall(async (kv) => {
      // Claim a code no live game is using, so guests can never land in someone else's game.
      // Stored as an object: the Redis client turns number-like strings (an all-digit id) into numbers.
      for (let attempt = 0; ; attempt++) {
        const claimed = await kv.set(`${CODE_PREFIX}${code.toUpperCase()}`, { id }, { ex: GAME_TTL, nx: true })
        if (claimed === 'OK') break
        if (attempt >= 20) throw new Error('Could not find a free game code')
        code = generateCode()
      }
      game.code = code
      await kv.set(`${KEY_PREFIX}${id}`, game, { ex: GAME_TTL })
      await kv.set(`${STATE_PREFIX}${id}`, initialState, { ex: GAME_TTL })
    })
  } else {
    while (memoryCodeStore.has(code.toUpperCase())) code = generateCode()
    game.code = code
    memoryStore.set(id, game)
    memoryStateStore.set(id, initialState)
    memoryCodeStore.set(code.toUpperCase(), id)
  }

  return game
}

export async function getGame(id: string): Promise<StoredGame | null> {
  if (useKV()) {
    return await kvCall((kv) => kv.get<StoredGame>(`${KEY_PREFIX}${id}`))
  } else {
    return memoryStore.get(id) || null
  }
}

export async function getGameByCode(code: string): Promise<StoredGame | null> {
  const upperCode = code.toUpperCase()
  let gameId: string | null = null

  if (useKV()) {
    const stored = await kvCall((kv) => kv.get<{ id: string } | string>(`${CODE_PREFIX}${upperCode}`))
    gameId = stored && typeof stored === 'object' ? stored.id : stored != null ? String(stored) : null
  } else {
    gameId = memoryCodeStore.get(upperCode) || null
  }

  if (!gameId) return null
  return getGame(gameId)
}

export async function getGameState(gameId: string): Promise<GameState | null> {
  if (useKV()) {
    return await kvCall((kv) => kv.get<GameState>(`${STATE_PREFIX}${gameId}`))
  } else {
    return memoryStateStore.get(gameId) || null
  }
}

export async function updateGameState(gameId: string, state: GameState): Promise<void> {
  if (useKV()) {
    await kvCall((kv) => kv.set(`${STATE_PREFIX}${gameId}`, state, { ex: GAME_TTL }))
  } else {
    memoryStateStore.set(gameId, state)
  }
}

export async function saveCheckoutConfig(sessionId: string, config: MysteryConfig): Promise<void> {
  if (useKV()) {
    // Not critical: generation falls back to the Stripe session metadata.
    await kvCall((kv) => kv.set(`${CHECKOUT_PREFIX}${sessionId}`, config, { ex: CHECKOUT_TTL })).catch(() => {})
  } else {
    memoryCheckoutStore.set(sessionId, config)
  }
}

export async function getCheckoutConfig(sessionId: string): Promise<MysteryConfig | null> {
  if (useKV()) {
    return await kvCall((kv) => kv.get<MysteryConfig>(`${CHECKOUT_PREFIX}${sessionId}`)).catch(() => null)
  } else {
    return memoryCheckoutStore.get(sessionId) || null
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

// ---------------------------------------------------------------------------
// Paid mysteries, keyed by Stripe checkout session.
// A customer who refreshes the success page or comes back from their
// confirmation email gets the mystery they paid for, not a new one.
// ---------------------------------------------------------------------------

const PURCHASE_PREFIX = 'purchase:'
const LOCK_PREFIX = 'generating:'
const LOCK_TTL = 6 * 60 // seconds; longer than one generation run

const memoryPurchaseStore = new Map<string, GeneratedMystery>()
const memoryLocks = new Map<string, number>() // sessionId -> expiry (ms)

export async function savePurchasedMystery(sessionId: string, mystery: GeneratedMystery): Promise<void> {
  if (useKV()) {
    await kvCall(async (kv) => {
      await kv.set(`${PURCHASE_PREFIX}${sessionId}`, mystery, { ex: GAME_TTL })
      await kv.del(`${LOCK_PREFIX}${sessionId}`)
    }).catch(() => {})
  } else {
    memoryPurchaseStore.set(sessionId, mystery)
    memoryLocks.delete(sessionId)
  }
}

export async function getPurchasedMystery(sessionId: string): Promise<GeneratedMystery | null> {
  if (useKV()) {
    // If storage is down, write a fresh mystery rather than block the customer.
    return await kvCall((kv) => kv.get<GeneratedMystery>(`${PURCHASE_PREFIX}${sessionId}`)).catch(() => null)
  }
  return memoryPurchaseStore.get(sessionId) || null
}

/** Returns true if this caller now owns generation for the session. */
export async function claimGeneration(sessionId: string): Promise<boolean> {
  if (useKV()) {
    const result = await kvCall((kv) => kv.set(`${LOCK_PREFIX}${sessionId}`, Date.now(), { nx: true, ex: LOCK_TTL })).catch(() => 'OK')
    return result === 'OK'
  }
  const expiry = memoryLocks.get(sessionId)
  if (expiry && expiry > Date.now()) return false
  memoryLocks.set(sessionId, Date.now() + LOCK_TTL * 1000)
  return true
}

export async function releaseGeneration(sessionId: string): Promise<void> {
  if (useKV()) {
    await kvCall((kv) => kv.del(`${LOCK_PREFIX}${sessionId}`)).catch(() => {})
  } else {
    memoryLocks.delete(sessionId)
  }
}

/** True if the caller holds the host key (games saved before host keys accept "1"). */
export function isHostKey(game: StoredGame, key: string | null | undefined): boolean {
  if (!key) return false
  if (!game.hostKey) return key === '1'
  const a = Buffer.from(key)
  const b = Buffer.from(game.hostKey)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/**
 * Wraps a route handler so a storage outage returns a plain-language 503
 * instead of a raw "fetch failed" or an HTML error page.
 */
export function withStorage<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (err) {
      if (err instanceof StorageUnavailableError) {
        return new Response(
          JSON.stringify({ error: 'Games are temporarily unavailable. Please try again in a few minutes.', code: 'storage_unavailable' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      }
      throw err
    }
  }
}
