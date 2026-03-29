import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { generateMysteryStream, type MysteryConfig } from '@/lib/generate'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Missing session ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verify payment was completed
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ error: 'Payment not completed' }), {
        status: 402,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Extract mystery config from Stripe metadata
    const config: MysteryConfig = {
      tier: session.metadata?.tier as 'classic' | 'grand',
      theme: session.metadata?.theme || '',
      guestCount: parseInt(session.metadata?.guestCount || '6'),
      difficulty: session.metadata?.difficulty as 'casual' | 'intermediate' | 'devious',
      specialRequests: session.metadata?.specialRequests || '',
    }

    const stream = generateMysteryStream(config)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err: unknown) {
    console.error('Generation error:', err)
    const message = err instanceof Error ? err.message : 'Failed to generate mystery'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
