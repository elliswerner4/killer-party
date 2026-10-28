# Killer Party

**Custom murder mystery dinner parties, generated on demand.**

**Live site:** [killer-party-seven.vercel.app](https://killer-party-seven.vercel.app)

Killer Party is a full-stack web app I designed and built on my own, with AI coding tools. A host picks a theme, guest count and difficulty, checks out through Stripe, and gets a complete party package in minutes. The package includes a host guide, character sheets, clues, a reveal script, a menu and an atmosphere guide. Guests join on their phones with a game code and get their own character page with their private clues.

## What it shows

- **A working product, end to end.** Landing page, checkout, payment webhook, AI generation, delivery, confirmation email, a support form and a guest companion app.
- **A multi-step generation pipeline.** One call writes an outline that fixes the solution, the cast and an evidence plan. The host guide, character sheets, clues and menu are then written from that outline in parallel, so a 10,000 to 20,000-token package finishes inside Vercel's 300-second limit.
- **Checked for consistency.** The reveal is written after the clue cards and may cite only them. A final continuity step compares every claim in the reveal with the exact clue text and rewrites anything it adds or contradicts. Four hand-written plot templates fix who did it.
- **Fails loudly, not silently.** Each step checks the stop reason for truncation, retries once on failure, and runs against a 280-second time budget, so customers see a clear message instead of a stream that just stops.
- **Money is spent only after payment.** The server confirms with Stripe that a checkout session is paid before it calls the model, so unpaid requests can't run up API costs.

## How it works

1. The host customizes a mystery (theme, guests, difficulty, special requests).
2. They pay through Stripe Checkout ($35 Classic / $49 Grand).
3. Checkout saves the full order to Vercel KV, which gets around Stripe's 500-character metadata limit.
4. Once the server confirms with Stripe that the session is paid, it runs the generation pipeline on the Claude API, streaming progress to the browser.
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

- **Templates and the outline hold the logic.** The template fixes who did it; the outline fixes the facts and which clue proves what.
- **AI handles everything else.** Theme, characters, dialogue, menu and atmosphere are rewritten for each order, using real guest names if the host provides them.
- **Cost stays bounded.** Each step has a 16,000-token ceiling, and up-front model thinking is turned off because these steps are writing, not reasoning.

## Costs per sale

- Vercel: free tier covers about 100K requests a month
- Stripe: 2.9% + $0.30 per transaction
- Claude API: one pipeline run per order, 16,000-token ceiling per step

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
