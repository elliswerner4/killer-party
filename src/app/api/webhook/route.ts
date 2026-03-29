import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

// Stripe webhook for handling post-payment events (optional but recommended)
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
      case 'checkout.session.completed':
        // Payment successful \u2014 could send confirmation email here
        console.log('Payment completed:', event.data.object.id)
        break
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
