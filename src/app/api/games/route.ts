import { NextRequest } from 'next/server'
import { saveGame, withStorage, StorageUnavailableError } from '@/lib/storage'

async function handlePOST(req: NextRequest) {
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
    if (err instanceof StorageUnavailableError) throw err // withStorage turns this into a clear 503
    console.error('Save game error:', err)
    const message = 'We couldn’t set up your game. Please try again.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const POST = withStorage(handlePOST)
