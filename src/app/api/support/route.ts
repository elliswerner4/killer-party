import { NextRequest } from 'next/server'
import { sendSupportMessage, supportEmailConfigured } from '@/lib/email'

const TOPICS = ['Problem with my order', 'Problem during a game', 'Question before buying', 'Something else']

// Light abuse protection: a few messages per address per 10 minutes, per server instance.
const recent = new Map<string, number[]>()
function tooMany(ip: string): boolean {
  const now = Date.now()
  const hits = (recent.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000)
  hits.push(now)
  recent.set(ip, hits)
  return hits.length > 5
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return json({ error: 'Something went wrong sending your message. Try again.' }, 400)

  // Hidden field that people never see; bots fill it in.
  if (body.website) return json({ ok: true })

  const name = String(body.name || '').trim().slice(0, 100)
  const email = String(body.email || '').trim().slice(0, 200)
  const topic = TOPICS.includes(body.topic) ? body.topic : 'Something else'
  const orderRef = String(body.orderRef || '').trim().slice(0, 200)
  const message = String(body.message || '').trim().slice(0, 5000)

  if (!name) return json({ error: 'Add your name.', field: 'name' }, 400)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Enter an email address we can reply to.', field: 'email' }, 400)
  if (message.length < 10) return json({ error: 'Tell us a little more about what happened.', field: 'message' }, 400)

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  if (tooMany(ip)) return json({ error: 'You’ve sent several messages in a short time. Please wait a few minutes and try again.' }, 429)

  if (!supportEmailConfigured()) {
    console.error('[support] RESEND_API_KEY is not set; cannot deliver support messages')
    return json({ error: 'Our contact form is down right now. Please try again later.' }, 503)
  }

  try {
    await sendSupportMessage({ name, email, topic, orderRef, message })
    return json({ ok: true })
  } catch (err) {
    console.error('[support] send failed:', err)
    return json({ error: 'Your message didn’t go through. Please try again in a few minutes.' }, 502)
  }
}
