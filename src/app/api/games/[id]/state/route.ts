import { NextRequest } from 'next/server'
import { getGame, getGameState, updateGameState, isHostKey } from '@/lib/storage'

// GET — poll current game state
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const state = await getGameState(params.id)

  if (!state) {
    return new Response(JSON.stringify({ error: 'Game not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(state), {
    headers: { 'Content-Type': 'application/json' },
  })
}

// POST — host advances game state
export async function POST(
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

  const state = await getGameState(params.id)
  if (!state) {
    return new Response(JSON.stringify({ error: 'Game state not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await req.json()
  const { action, playerSlug, playerName, characterSlug, hostKey } = body

  // Only the host can move the game along.
  const hostActions = ['start', 'nextAct', 'accusations', 'reveal', 'finish']
  if (hostActions.includes(action) && !isHostKey(game, hostKey)) {
    return new Response(JSON.stringify({ error: 'Only the host can do that' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  switch (action) {
    case 'join': {
      // A player claims a character
      if (!characterSlug || !playerName) {
        return new Response(JSON.stringify({ error: 'characterSlug and playerName required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      state.players[characterSlug] = playerName
      break
    }
    case 'start': {
      state.phase = 'playing'
      state.currentAct = 1
      state.startedAt = new Date().toISOString()
      break
    }
    case 'nextAct': {
      if (state.currentAct < 4) {
        state.currentAct += 1
      }
      break
    }
    case 'accusations': {
      state.phase = 'accusations'
      break
    }
    case 'vote': {
      if (!playerSlug || !characterSlug) {
        return new Response(JSON.stringify({ error: 'playerSlug and characterSlug required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      state.votes[playerSlug] = characterSlug
      break
    }
    case 'reveal': {
      state.phase = 'reveal'
      break
    }
    case 'finish': {
      state.phase = 'finished'
      break
    }
    default: {
      return new Response(JSON.stringify({ error: 'Unknown action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  await updateGameState(params.id, state)

  return new Response(JSON.stringify(state), {
    headers: { 'Content-Type': 'application/json' },
  })
}
