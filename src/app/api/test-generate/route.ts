import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { generateMysteryStream, type MysteryConfig } from '@/lib/generate'

export const maxDuration = 300

// Unpaid generation spends API credits, so it needs the owner's passcode.
// Set TEST_PASSCODE in Vercel to change it; ENABLE_TEST_GENERATE=true opens it to anyone.
const DEFAULT_PASSCODE = 'candlestick-4190'

function passcodeOk(given: unknown): boolean {
  if (process.env.ENABLE_TEST_GENERATE === 'true') return true
  const expected = Buffer.from(process.env.TEST_PASSCODE || DEFAULT_PASSCODE)
  const actual = Buffer.from(typeof given === 'string' ? given.trim() : '')
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (!passcodeOk(body.passcode)) {
    return json({ error: 'Wrong passcode.', code: 'bad_passcode' }, 401)
  }

  const tier = body.tier === 'grand' ? 'grand' : 'classic'
  const maxGuests = tier === 'grand' ? 12 : 8
  const config: MysteryConfig = {
    tier,
    theme: String(body.theme || '1920s Speakeasy').slice(0, 300),
    guestCount: Math.min(maxGuests, Math.max(4, parseInt(body.guestCount) || 6)),
    difficulty: ['casual', 'intermediate', 'devious'].includes(body.difficulty) ? body.difficulty : 'intermediate',
    specialRequests: String(body.specialRequests || '').slice(0, 1000),
  }

  return new Response(generateMysteryStream(config), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
