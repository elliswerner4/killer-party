import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { generateMystery, type MysteryConfig } from '@/lib/generate'

export const maxDuration = 60 // Allow up to 60s for generation (Vercel Pro)

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })
    }

    // Verify payment was completed
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 })
    }

    // Extract mystery config from Stripe metadata
    const config: MysteryConfig = {
      tier: session.metadata?.tier as 'classic' | 'grand',
      theme: session.metadata?.theme || '',
      guestCount: parseInt(session.metadata?.guestCount || '6'),
      difficulty: session.metadata?.difficulty as 'casual' | 'intermediate' | 'devious',
      specialRequests: session.metadata?.specialRequests || '',
    }

    // Generate the mystery
    const mystery = await generateMystery(config)

    return NextResponse.json({ mystery })
  } catch (err: unknown) {
    console.error('Generation error:', err)
    const message = err instanceof Error ? err.message : 'Failed to generate mystery'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
