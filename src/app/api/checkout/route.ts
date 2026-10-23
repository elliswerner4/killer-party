import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICES } from '@/lib/stripe'
import { saveCheckoutConfig } from '@/lib/storage'
import type { MysteryConfig, GuestProfile } from '@/lib/generate'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tier, theme, guestCount, difficulty, specialRequests, guestProfiles } = body

    if (!tier || !theme || !guestCount || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['classic', 'grand'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const cleanProfiles: GuestProfile[] | undefined =
      Array.isArray(guestProfiles) && guestProfiles.length > 0
        ? guestProfiles.map((g: GuestProfile) => ({
            name: String(g.name || '').slice(0, 50),
            personality: String(g.personality || '').slice(0, 200),
            dietary: String(g.dietary || '').slice(0, 100),
          }))
        : undefined

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      // Stripe Checkout collects email by default for guest checkouts; this makes it explicit
      // so we can send post-purchase confirmation emails via the webhook.
      customer_creation: 'always',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Killer Party — ${tier === 'classic' ? 'Classic' : 'Grand'} Mystery`,
              description: `${theme} • ${guestCount} guests • ${difficulty} difficulty`,
            },
            unit_amount: PRICES[tier as keyof typeof PRICES],
          },
          quantity: 1,
        },
      ],
      metadata: {
        // Kept for Stripe dashboard visibility; full config lives in KV under the session id.
        tier,
        theme: theme.slice(0, 490),
        guestCount: String(guestCount),
        difficulty,
        guestProfileCount: String(cleanProfiles?.length ?? 0),
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/create`,
    })

    const config: MysteryConfig = {
      tier,
      theme,
      guestCount,
      difficulty,
      specialRequests: specialRequests || '',
      guestProfiles: cleanProfiles,
    }

    await saveCheckoutConfig(session.id, config)

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('Checkout error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
