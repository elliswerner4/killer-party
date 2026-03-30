import { NextRequest } from 'next/server'
import { getGame, getCharacterBySlug } from '@/lib/storage'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const game = await getGame(params.id)

  if (!game) {
    return new Response(JSON.stringify({ error: 'Game not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // If a character slug is provided via query param, return just that character
  const charSlug = req.nextUrl.searchParams.get('character')

  if (charSlug) {
    const result = getCharacterBySlug(game, charSlug)
    if (!result) {
      return new Response(JSON.stringify({ error: 'Character not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(
      JSON.stringify({
        title: game.mystery.title,
        theme: game.mystery.theme,
        tagline: game.mystery.tagline,
        character: result.character,
        // Include clues assigned to this character
        clues: game.mystery.clues.filter(
          (c) => c.givenTo.toLowerCase() === result.character.name.toLowerCase() || c.givenTo === 'all'
        ),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Return full game info (for host)
  return new Response(
    JSON.stringify({
      id: game.id,
      mystery: game.mystery,
      characterSlugs: game.characterSlugs,
      createdAt: game.createdAt,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
