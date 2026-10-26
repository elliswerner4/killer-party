import { storageStatus } from '@/lib/storage'

export const dynamic = 'force-dynamic'

// Plain status for checking setup from a browser. Reveals no secrets.
export async function GET() {
  const storage = await storageStatus()
  return new Response(
    JSON.stringify({
      storage,
      generation: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not configured',
      payments: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured',
      email: process.env.RESEND_API_KEY ? 'configured' : 'not configured',
    }),
    { status: storage === 'ok' ? 200 : 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
  )
}
