import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import {
  generateMysteryStream,
  completedMysteryStream,
  waitForMysteryStream,
  type MysteryConfig,
} from '@/lib/generate'
import {
  getCheckoutConfig,
  getPurchasedMystery,
  savePurchasedMystery,
  claimGeneration,
  releaseGeneration,
} from '@/lib/storage'

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
}

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

    // Already written for this purchase: return it instead of paying for a new one.
    const existing = await getPurchasedMystery(sessionId)
    if (existing) {
      return new Response(completedMysteryStream(existing), { headers: SSE_HEADERS })
    }

    // Another request (a refresh, a second tab) is already writing it: wait for that one.
    if (!(await claimGeneration(sessionId))) {
      return new Response(waitForMysteryStream(() => getPurchasedMystery(sessionId)), { headers: SSE_HEADERS })
    }

    // Full config is stored in KV at checkout time (Stripe metadata is capped at 500 chars per
    // value, which truncates guest profiles). Fall back to metadata for older sessions.
    const stored = await getCheckoutConfig(sessionId)
    const config: MysteryConfig = stored || {
      tier: session.metadata?.tier as 'classic' | 'grand',
      theme: session.metadata?.theme || '',
      guestCount: parseInt(session.metadata?.guestCount || '6'),
      difficulty: session.metadata?.difficulty as 'casual' | 'intermediate' | 'devious',
      specialRequests: '',
    }

    const stream = generateMysteryStream(config, {
      onComplete: (mystery) => savePurchasedMystery(sessionId, mystery),
      onError: () => releaseGeneration(sessionId),
    })

    return new Response(stream, { headers: SSE_HEADERS })
  } catch (err: unknown) {
    console.error('Generation error:', err)
    const message = err instanceof Error ? err.message : 'Failed to generate mystery'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
