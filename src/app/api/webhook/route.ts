import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { sendPurchaseConfirmation } from '@/lib/email'
import type Stripe from 'stripe'

// Stripe webhook for handling post-payment events.
// Set up at: https://dashboard.stripe.com/webhooks

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      case 'checkout.session.expired':
        console.log('Checkout expired:', event.data.object.id)
        break
      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error'
    console.error('Webhook error:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email || session.customer_email
  if (!email) {
    console.log('Payment completed but no email available:', session.id)
    return
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const tier = (session.metadata?.tier === 'grand' ? 'grand' : 'classic') as 'classic' | 'grand'

  await sendPurchaseConfirmation({
    to: email,
    tier,
    theme: session.metadata?.theme || 'your mystery',
    guestCount: parseInt(session.metadata?.guestCount || '6'),
    difficulty: session.metadata?.difficulty || 'intermediate',
    amountPaid: session.amount_total || 0,
    successUrl: `${baseUrl}/success?session_id=${session.id}`,
  })
}
