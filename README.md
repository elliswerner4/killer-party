# Killer Party \u2014 Custom Murder Mystery Dinner Parties

A Next.js web app that generates unique murder mystery dinner party packages. Customers choose their theme, guest count, and difficulty, pay via Stripe, and receive a complete party package instantly.

## How It Works

1. Customer visits the landing page and clicks \"Create Your Mystery\"
2. They customize their mystery (theme, guests, difficulty, special requests)
3. They pay via Stripe Checkout ($35 Classic / $49 Grand)
4. After payment, the app generates a unique mystery using AI (Claude) layered on top of pre-built plot templates
5. Customer receives their complete package: host guide, character sheets, clues, reveal script, menu, and atmosphere guide

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Stripe** (payments)
- **Anthropic Claude API** (mystery customization)
- **Vercel KV** (game state + checkout configs)
- **Vercel Analytics** (funnel tracking)
- **Resend** (purchase confirmation emails)

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd killer-party
npm install
```

### 2. Set environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

You need:
- **Stripe Secret Key** \u2014 from https://dashboard.stripe.com/apikeys
- **Stripe Publishable Key** \u2014 same page
- **Stripe Webhook Secret** \u2014 from https://dashboard.stripe.com/webhooks (required for confirmation emails)
- **Anthropic API Key** \u2014 from https://console.anthropic.com
- **Resend API Key** \u2014 from https://resend.com/api-keys (purchase confirmation emails; falls back to a no-op if unset)
- **Resend From Email** \u2014 a verified sender address; defaults to Resend's `onboarding@resend.dev` for testing

### 3. Run locally

```bash
npm run dev
```

Visit http://localhost:3000

### 4. Test with Stripe

Use Stripe test mode keys (sk_test_... / pk_test_...) for development.
Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

## Deploy to Vercel

### One-click deploy:

1. Push this repo to GitHub
2. Go to https://vercel.com/new and import the repo
3. Add environment variables in Vercel's dashboard:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `ANTHROPIC_API_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `KV_REST_API_URL` / `KV_REST_API_TOKEN` (auto-set when you link a Vercel KV store)
   - `NEXT_PUBLIC_BASE_URL` (your Vercel URL, e.g., https://killerparty.vercel.app)
4. Enable Vercel Analytics in the project's Analytics tab (no extra config required — the app already includes `<Analytics />`)
5. Deploy

## Architecture

### Hybrid Generation Model

The app uses **pre-crafted mystery templates** (plot skeletons with proven clue logic) combined with **AI customization** (theming, characters, dialogue, menus). This gives you:

- **Reliability**: The underlying puzzle always works because the logic is hand-crafted
- **Uniqueness**: Every package feels custom because the AI adapts everything to the theme
- **Low cost**: AI only generates the customization layer (~$0.05-0.15 per generation)

## Costs

- **Vercel**: Free tier handles ~100K requests/month
- **Stripe**: 2.9% + $0.30 per transaction
- **Anthropic API**: ~$0.05-0.15 per mystery generation
- **Total cost per sale**: ~$1.50 on a $35 sale \u2192 ~96% margin
