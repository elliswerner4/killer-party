import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICES } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tier, theme, guestCount, difficulty, specialRequests } = body

    if (!tier || !theme || !guestCount || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['classic', 'grand'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Store mystery config in Stripe metadata so we can generate after payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Killer Party \u2014 ${tier === 'classic' ? 'Classic' : 'Grand'} Mystery`,
              description: `${theme} \u2022 ${guestCount} guests \u2022 ${difficulty} difficulty`,
            },
            unit_amount: PRICES[tier as keyof typeof PRICES],
          },
          quantity: 1,
        },
      ],
      metadata: {
        tier,
        theme,
        guestCount: String(guestCount),
        difficulty,
        specialRequests: specialRequests || '',
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/create`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('Checkout error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
