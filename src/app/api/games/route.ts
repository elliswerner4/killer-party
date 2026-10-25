import { NextRequest } from 'next/server'
import { saveGame } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const { mystery } = await req.json()

    if (!mystery || !mystery.characters || !Array.isArray(mystery.characters)) {
      return new Response(JSON.stringify({ error: 'Invalid mystery data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const game = await saveGame(mystery)

    return new Response(
      JSON.stringify({
        gameId: game.id,
        gameCode: game.code,
        hostKey: game.hostKey,
        characterSlugs: game.characterSlugs,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err: unknown) {
    console.error('Save game error:', err)
    const message = err instanceof Error ? err.message : 'Failed to save game'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
