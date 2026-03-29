import Anthropic from '@anthropic-ai/sdk'
import { selectTemplate, type MysteryTemplate } from './templates'

const anthropic = new Anthropic()

export interface MysteryConfig {
  tier: 'classic' | 'grand'
  theme: string
  guestCount: number
  difficulty: 'casual' | 'intermediate' | 'devious'
  specialRequests: string
}

export interface GeneratedMystery {
  title: string
  tagline: string
  theme: string
  guestCount: number
  difficulty: string
  hostGuide: {
    overview: string
    timeline: string
    act1: string
    act2: string
    act3: string
    act4: string
    tips: string
  }
  characters: {
    name: string
    role: string
    publicBio: string
    privateSecrets: string
    goals: string
    relationships: string
    conversationPrompts: string[]
  }[]
  clues: {
    id: string
    title: string
    content: string
    revealedIn: string
    givenTo: string
  }[]
  reveal: {
    buildup: string
    accusationPrompt: string
    revealScript: string
    epilogue: string
  }
  menu: {
    theme: string
    appetizers: string[]
    mains: string[]
    desserts: string[]
    cocktails: string[]
    nonAlcoholic: string[]
  }
  atmosphere: {
    decorations: string
    music: string
    dressCode: string
    lighting: string
    tableSettings: string
  }
}

function buildPrompt(config: MysteryConfig, template: MysteryTemplate): string {
  const difficultyGuide = {
    casual: 'Keep clues straightforward and obvious. Limit red herrings to 1. Make the solution reachable by casual players who are there for fun, not brain-teasers.',
    intermediate: 'Include 2-3 red herrings and require connecting at least 2 clues to solve. The solution should be satisfying but not frustratingly hard.',
    devious: 'Use all red herrings, add extra misleading evidence, require connecting 3+ clues to solve. Include at least one clue that only makes sense in retrospect. Challenge experienced players.',
  }

  return `You are a professional mystery writer creating a complete murder mystery dinner party package.

## TEMPLATE STRUCTURE (use this exact plot skeleton — do NOT deviate from the logical structure)
${JSON.stringify(template.structure, null, 2)}

## CLUE LOGIC (follow this framework exactly)
${JSON.stringify(template.clueLogic, null, 2)}

## CHARACTER ARCHETYPES (adapt these to the theme)
${template.characterArchetypes.join(', ')}

## CUSTOMIZATION PARAMETERS
- Theme/Setting: ${config.theme}
- Number of guests: ${config.guestCount}
- Difficulty: ${config.difficulty} — ${difficultyGuide[config.difficulty]}
- Tier: ${config.tier}
${config.specialRequests ? `- Special requests: ${config.specialRequests}` : ''}

## YOUR TASK
Take the template structure above and bring it to life in the "${config.theme}" setting. Create:

1. A compelling title and tagline
2. A detailed host guide with scene-by-scene instructions and timing
3. ${config.guestCount} unique character sheets (adapt the archetypes to fit the theme and guest count — combine or split archetypes as needed)
4. Clue cards that follow the clue logic framework
5. A complete accusation and reveal sequence
6. A themed dinner menu with cocktails
7. An atmosphere guide (decorations, music, dress code)

IMPORTANT RULES:
- Every character must have at least one secret that affects the story
- Clue logic must be airtight — the solution must be definitively provable
- The experience should last 2.5-3.5 hours
- Character sheets should have enough material for guests to improvise naturally
- The menu should be actually cookable by a home cook
- All content must be themed to "${config.theme}"

Respond with valid JSON matching this exact schema (no markdown, no backticks, just JSON):
{
  "title": "string",
  "tagline": "string",
  "theme": "string",
  "guestCount": number,
  "difficulty": "string",
  "hostGuide": {
    "overview": "string (2-3 paragraph overview of the evening)",
    "timeline": "string (minute-by-minute schedule)",
    "act1": "string (detailed host instructions for act 1)",
    "act2": "string (detailed host instructions for act 2)",
    "act3": "string (detailed host instructions for act 3)",
    "act4": "string (detailed host instructions for act 4)",
    "tips": "string (hosting tips and contingencies)"
  },
  "characters": [
    {
      "name": "string",
      "role": "string (their public role in the setting)",
      "publicBio": "string (what everyone knows about them — 2-3 sentences)",
      "privateSecrets": "string (what only they know — this drives their behavior)",
      "goals": "string (what they want to achieve tonight)",
      "relationships": "string (how they relate to every other character)",
      "conversationPrompts": ["string (5 things they might say to spark interaction)"]
    }
  ],
  "clues": [
    {
      "id": "string (clue-1, clue-2, etc.)",
      "title": "string",
      "content": "string (the actual clue text players read)",
      "revealedIn": "string (act1, act2, act3, or act4)",
      "givenTo": "string (character name or 'all')"
    }
  ],
  "reveal": {
    "buildup": "string (the host reads this to build tension before accusations)",
    "accusationPrompt": "string (what the host says to prompt guests to accuse)",
    "revealScript": "string (the full dramatic reveal — who did it, how, and why)",
    "epilogue": "string (what happened to each character after — a satisfying ending)"
  },
  "menu": {
    "theme": "string (the culinary direction)",
    "appetizers": ["string (dish name — brief description)"],
    "mains": ["string"],
    "desserts": ["string"],
    "cocktails": ["string (cocktail name — ingredients — brief instructions)"],
    "nonAlcoholic": ["string"]
  },
  "atmosphere": {
    "decorations": "string (specific, actionable decoration ideas)",
    "music": "string (genre, artists, or playlist suggestions)",
    "dressCode": "string (what guests should wear)",
    "lighting": "string (lighting recommendations)",
    "tableSettings": "string (table and place setting ideas)"
  }
}`
}

export async function generateMystery(config: MysteryConfig): Promise<GeneratedMystery> {
  const template = selectTemplate(config.guestCount)
  const prompt = buildPrompt(config, template)

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  })

  const finalMessage = await stream.finalMessage()
  const text = finalMessage.content[0].type === 'text' ? finalMessage.content[0].text : ''

  // Parse the JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to generate mystery — invalid response format')
  }

  return JSON.parse(jsonMatch[0]) as GeneratedMystery
}

export function generateMysteryStream(config: MysteryConfig): ReadableStream {
  const template = selectTemplate(config.guestCount)
  const prompt = buildPrompt(config, template)

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000,
          messages: [{ role: 'user', content: prompt }],
        })

        let fullText = ''

        stream.on('text', (text) => {
          fullText += text
          // Send a heartbeat to keep connection alive
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'progress', length: fullText.length })}\n\n`))
        })

        const finalMessage = await stream.finalMessage()
        const responseText = finalMessage.content[0].type === 'text' ? finalMessage.content[0].text : ''

        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'error', error: 'Invalid response format' })}\n\n`))
          controller.close()
          return
        }

        const mystery = JSON.parse(jsonMatch[0])
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'complete', mystery })}\n\n`))
        controller.close()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Generation failed'
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`))
        controller.close()
      }
    },
  })
}
