# Killer Party

**Custom murder mystery dinner parties, generated on demand.**

**Live site:** [killer-party-seven.vercel.app](https://killer-party-seven.vercel.app)

Killer Party is a full-stack web app I designed and built on my own, with AI coding tools. A host picks a theme, guest count and difficulty, checks out through Stripe, and gets a complete party package in minutes. The package includes a host guide, character sheets, clues, a reveal script, a menu and an atmosphere guide. Guests join on their phones with a game code and get their own character page with their private clues.

## What it shows

- **A working product, end to end.** Landing page, checkout, payment webhook, AI generation, delivery, confirmation email and a guest companion app.
- **Constrained AI output.** Four hand-written plot templates fix the solution and the clue chain, and the model writes the customization around them. Output streams to the browser, truncated responses are caught by checking the stop reason, and errors appear on screen instead of failing silently.
- **Money is spent only after payment.** The server confirms with Stripe that a checkout session is paid before it calls the model, so unpaid requests can't run up API costs.

## How it works

1. The host customizes a mystery (theme, guests, difficulty, special requests).
2. They pay through Stripe Checkout ($35 Classic / $49 Grand).
3. Checkout saves the full order to Vercel KV, which gets around Stripe's 500-character metadata limit.
4. Once the server confirms with Stripe that the session is paid, it streams a custom mystery from the Claude API, built on one of the plot templates.
5. A signature-verified Stripe webhook sends the confirmation email.
6. The host gets the full package and a shareable game code.
7. Guests open the game link, pick their character and get private clues on their phones.

## Tech stack

| Layer | Tools |
|---|---|
| App | Next.js 14 (App Router), TypeScript, Tailwind CSS, web app manifest for phone home screens |
| AI | Anthropic Claude API, streamed over server-sent events; model set by `ANTHROPIC_MODEL` |
| Payments | Stripe Checkout and webhooks |
| Data | Vercel KV (Upstash Redis) for orders, game state and sharing links |
| Email & analytics | Resend for confirmation emails; Vercel Analytics for funnel tracking |
| Hosting | Vercel |

## Architecture: hybrid generation

Fully AI-written mysteries often end up unsolvable. Fully templated ones feel generic. Killer Party splits the work:

- **Templates hold the logic.** Each template fixes who did it and how the clues point there.
- **AI handles everything else.** Theme, characters, dialogue, menu and atmosphere are rewritten for each order, using real guest names if the host provides them.
- **Cost stays bounded.** The AI only writes the customization layer, and output is capped at 32,000 tokens.

## Costs per sale

- Vercel: free tier covers about 100K requests a month
- Stripe: 2.9% + $0.30 per transaction
- Claude API: one generation per order, capped at 32,000 output tokens

## Run it locally

```bash
git clone https://github.com/elliswerner4/killer-party
cd killer-party
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev                  # http://localhost:3000
```

Keys you need (see `.env.example`):

- **Stripe** secret key, publishable key and webhook secret. Use test mode keys and test card `4242 4242 4242 4242`.
- **Anthropic** API key.
- **Resend** API key and sender address. This is optional: emails are skipped if it isn't set.
- **Vercel KV** URL and token. These are set automatically when you link a KV store in Vercel.
- `NEXT_PUBLIC_BASE_URL`, which is your deployed URL.

## Deploy

Import the repo at [vercel.com/new](https://vercel.com/new), add the environment variables above, link a KV store, turn on Analytics, and deploy.

---

Built by **Ellis Werner** · [LinkedIn](https://www.linkedin.com/in/Ellis-W-Werner) · [GitHub](https://github.com/elliswerner4)
