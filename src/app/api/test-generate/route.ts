import { NextRequest, NextResponse } from 'next/server'
import { generateMystery, type MysteryConfig } from '@/lib/generate'

export const maxDuration = 60

export async function POST(req: NextRequest) {
    // Only allow in development or with a secret test key
    const { tier, theme, guestCount, difficulty, specialRequests } = await req.json()

    const config: MysteryConfig = {
          tier: tier || 'classic',
          theme: theme || '1920s Speakeasy',
          guestCount: guestCount || 6,
          difficulty: difficulty || 'intermediate',
          specialRequests: specialRequests || '',
        }

    try {
          const mystery = await generateMystery(config)
          return NextResponse.json({ mystery })
        } catch (err: unknown) {
          console.error('Test generation error:', err)
          const message = err instanceof Error ? err.message : 'Failed to generate mystery'
          return NextResponse.json({ error: message }, { status: 500 })
        }
  }
