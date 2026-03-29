import { NextRequest } from 'next/server'
import { generateMysteryStream, type MysteryConfig } from '@/lib/generate'

export const maxDuration = 300

export async function POST(req: NextRequest) {
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
