import { NextRequest } from 'next/server'
import { generateMysteryStream, type MysteryConfig } from '@/lib/generate'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  // Unpaid generation spends API credits, so it is off unless explicitly enabled.
  if (process.env.ENABLE_TEST_GENERATE !== 'true') {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { tier, theme, guestCount, difficulty, specialRequests } = await req.json()

  const config: MysteryConfig = {
    tier: tier || 'classic',
    theme: theme || '1920s Speakeasy',
    guestCount: guestCount || 6,
    difficulty: difficulty || 'intermediate',
    specialRequests: specialRequests || '',
  }

  const stream = generateMysteryStream(config)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
