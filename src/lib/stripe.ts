import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PRICES = {
  classic: 3500, // $35.00 in cents
  grand: 4900,   // $49.00 in cents
} as const
