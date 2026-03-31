import { NextRequest } from 'next/server'
import { getGameByCode } from '@/lib/storage'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code) {
    return new Response(JSON.stringify({ error: 'Code is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const game = await getGameByCode(code)

  if (!game) {
    return new Response(JSON.stringify({ error: 'Game not found. Check the code and try again.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({
      gameId: game.id,
      title: game.mystery.title,
      theme: game.mystery.theme,
      characterSlugs: game.characterSlugs,
      characters: game.mystery.characters.map((c) => ({
        name: c.name,
        role: c.role,
        publicBio: c.publicBio,
      })),
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
