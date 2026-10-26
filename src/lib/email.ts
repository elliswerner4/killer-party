import { Resend } from 'resend'

/**
 * Sends transactional emails via Resend. No-ops gracefully if RESEND_API_KEY isn't set,
 * so local development and webhook deliveries don't crash without the integration configured.
 */

interface ConfirmationParams {
  to: string
  tier: 'classic' | 'grand'
  theme: string
  guestCount: number
  difficulty: string
  amountPaid: number // in cents
  successUrl: string
  supportUrl: string
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || 'Killer Party <onboarding@resend.dev>'
}

export async function sendPurchaseConfirmation(params: ConfirmationParams): Promise<void> {
  const resend = getResend()
  if (!resend) {
    console.log('[email] RESEND_API_KEY not set, skipping confirmation email')
    return
  }

  const tierLabel = params.tier === 'grand' ? 'Grand' : 'Classic'
  const dollars = (params.amountPaid / 100).toFixed(2)

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background: #1a1a2e; color: #f5f5f5; padding: 40px 32px; border-radius: 8px;">
      <h1 style="color: #C9A84C; font-size: 28px; margin: 0 0 8px;">Killer Party</h1>
      <p style="color: #B22222; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 32px;">Your mystery is being prepared</p>

      <p style="color: #f5f5f5; line-height: 1.6;">
        Thank you for your purchase. Your custom murder mystery is generating now.
      </p>

      <div style="background: #2d2d44; border: 1px solid #444; border-radius: 6px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 6px; color: #C9A84C; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Order Summary</p>
        <p style="margin: 0; color: #f5f5f5;"><strong>${tierLabel} Mystery</strong> — $${dollars}</p>
        <p style="margin: 8px 0 0; color: #aaa; font-size: 14px;">
          ${escapeHtml(params.theme)} • ${params.guestCount} guests • ${escapeHtml(params.difficulty)} difficulty
        </p>
      </div>

      <p style="color: #f5f5f5; line-height: 1.6;">
        <strong>Bookmark this link.</strong> Use it to return to your mystery any time within the next 7 days:
      </p>

      <p style="margin: 16px 0 32px;">
        <a href="${params.successUrl}" style="display: inline-block; background: #8B0000; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold;">
          Open My Mystery
        </a>
      </p>

      <p style="color: #888; font-size: 13px; line-height: 1.6;">
        Questions? <a href="${params.supportUrl}" style="color: #C9A84C;">Contact customer support</a>. Have a killer party.
      </p>
    </div>
  `

  try {
    await resend.emails.send({
      from: getFromAddress(),
      to: params.to,
      subject: `Your Killer Party mystery is ready (${tierLabel})`,
      html,
    })
  } catch (err) {
    console.error('[email] Failed to send confirmation:', err)
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ---------------------------------------------------------------------------
// Customer support messages
// The inbox address stays on the server: it is never sent to the browser,
// and customers only ever see "Customer support".
// ---------------------------------------------------------------------------

const DEFAULT_SUPPORT_INBOX = 'killerpartygames@mail.grokbot.com'
// The Resend account owner's address: the only one Resend will deliver to
// before a sending domain is verified.
const DEFAULT_SUPPORT_FALLBACK = 'elliswerner4@gmail.com'

export interface SupportMessage {
  name: string
  email: string
  topic: string
  orderRef: string
  message: string
}

export function supportEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

/** Sends a support request to the inbox. Throws if it could not be sent. */
export async function sendSupportMessage(msg: SupportMessage): Promise<void> {
  const resend = getResend()
  if (!resend) throw new Error('Email is not configured (RESEND_API_KEY is missing)')

  const rows: [string, string][] = [
    ['Name', msg.name],
    ['Email', msg.email],
    ['Topic', msg.topic],
    ['Order or game', msg.orderRef || '(not given)'],
  ]
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; color: #1a1a1a;">
      <h2 style="margin: 0 0 16px;">Support request: ${escapeHtml(msg.topic)}</h2>
      <table style="border-collapse: collapse; margin-bottom: 20px;">
        ${rows.map(([k, v]) => `<tr><td style="padding: 4px 16px 4px 0; color: #666;">${k}</td><td style="padding: 4px 0;">${escapeHtml(v)}</td></tr>`).join('')}
      </table>
      <div style="white-space: pre-wrap; line-height: 1.5; border-top: 1px solid #ddd; padding-top: 16px;">${escapeHtml(msg.message)}</div>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">Reply to this email to answer ${escapeHtml(msg.name)} directly.</p>
    </div>
  `
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${msg.message}`

  const inbox = process.env.SUPPORT_EMAIL || DEFAULT_SUPPORT_INBOX
  const send = (to: string, note = '') =>
    resend.emails.send({
      from: getFromAddress(),
      to,
      replyTo: msg.email,
      subject: `[Support] ${msg.topic}: ${msg.name}`,
      html: note ? `<p style="font-family: system-ui, sans-serif; color: #888; font-size: 12px;">${note}</p>${html}` : html,
      text: note ? `${note}\n\n${text}` : text,
    })

  const first = await send(inbox)
  if (!first.error) return

  // Until a sending domain is verified, Resend only delivers to the account
  // owner's address. Deliver there rather than losing the customer's message.
  if (/only send testing emails|verify a domain/i.test(first.error.message)) {
    const fallback = process.env.SUPPORT_FALLBACK_EMAIL || DEFAULT_SUPPORT_FALLBACK
    console.warn(`[support] Resend is in testing mode; delivering to ${fallback} instead of the support inbox`)
    const second = await send(fallback, `Delivered here because no sending domain is verified in Resend yet. Intended for ${inbox}.`)
    if (!second.error) return
    throw new Error(`Resend rejected the fallback message: ${second.error.message}`)
  }
  throw new Error(`Resend rejected the message: ${first.error.message}`)
}
