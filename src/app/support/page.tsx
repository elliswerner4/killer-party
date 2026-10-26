'use client'

import { useEffect, useState } from 'react'

const TOPICS = ['Problem with my order', 'Problem during a game', 'Question before buying', 'Something else']

export default function SupportPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState(TOPICS[0])
  const [orderRef, setOrderRef] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // hidden from people; catches bots
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState('')
  const [sent, setSent] = useState(false)

  // Links from the order page and confirmation email pass the order along.
  useEffect(() => {
    const order = new URLSearchParams(window.location.search).get('order')
    if (order) {
      setOrderRef(order)
      setTopic(TOPICS[0])
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setErrorField('')
    setSending(true)
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, orderRef, message, website }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Your message didn’t go through. Please try again.')
        setErrorField(data.field || '')
        return
      }
      setSent(true)
    } catch {
      setError('Couldn’t reach us. Check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="px-4 sm:px-6 py-16 md:py-24">
        <div className="max-w-xl mx-auto" role="status">
          <h1 className="font-display text-4xl md:text-5xl text-parchment">Message sent</h1>
          <p className="mt-4 text-gray-300 leading-relaxed">
            Thanks, {name.split(' ')[0]}. Customer support will reply to <span className="text-parchment">{email}</span>.
            If you don’t see a reply, check your spam folder.
          </p>
          <a href="/" className="btn-secondary mt-8">Back to Killer Party</a>
        </div>
      </div>
    )
  }

  const fieldClass = (f: string) => `input-field ${errorField === f ? 'border-blood-light' : ''}`

  return (
    <div className="px-4 sm:px-6 py-16 md:py-24">
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-4xl md:text-5xl text-parchment">Customer support</h1>
        <p className="mt-4 text-gray-300 leading-relaxed">
          Something wrong with your mystery, or a question before you buy? Send us a message and we’ll reply by email.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="label">Your name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={100} className={fieldClass('name')} aria-invalid={errorField === 'name'} />
            </div>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={200} className={fieldClass('email')} aria-invalid={errorField === 'email'} />
            </div>
          </div>

          <div>
            <label htmlFor="topic" className="label">What’s it about?</label>
            <select id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="input-field">
              {TOPICS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          {topic !== 'Question before buying' && (
            <div>
              <label htmlFor="order" className="label">Order or game code <span className="text-gray-500 font-normal">(if you have one)</span></label>
              <input id="order" value={orderRef} onChange={(e) => setOrderRef(e.target.value)} maxLength={200} placeholder="e.g. KNIFE-7421" className="input-field" />
            </div>
          )}

          <div>
            <label htmlFor="message" className="label">Message</label>
            <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} maxLength={5000} className={fieldClass('message')} aria-invalid={errorField === 'message'} />
          </div>

          {/* Honeypot: off-screen and skipped by keyboard and screen readers */}
          <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
            <label htmlFor="website">Website</label>
            <input id="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>

          {error && <p role="alert" className="text-blood-light">{error}</p>}

          <button type="submit" disabled={sending} className="btn-primary w-full sm:w-auto px-8 disabled:opacity-60">
            {sending ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </div>
    </div>
  )
}
