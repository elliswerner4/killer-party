import Anthropic from '@anthropic-ai/sdk'
import { selectTemplate, type MysteryTemplate } from './templates'

const anthropic = new Anthropic()

// Override with ANTHROPIC_MODEL in Vercel if this model is ever retired
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5'
const MAX_TOKENS = 32000

function getResponseText(message: Anthropic.Message): string {
  if (message.stop_reason === 'max_tokens') {
    throw new Error('The mystery was too long and got cut off before finishing. Please try again.')
  }
  return message.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('')
}

export interface GuestProfile {
  name: string
  personality: string
  dietary: string
}

export interface MysteryConfig {
  tier: 'classic' | 'grand'
  theme: string
  guestCount: number
  difficulty: 'casual' | 'intermediate' | 'devious'
  specialRequests: string
  guestProfiles?: GuestProfile[]
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
    specialSkill: string
    publicBio: string
    privateSecrets: string
    goals: string
    tasks: string[]
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

## TEMPLATE STRUCTURE (use this exact plot skeleton â do NOT deviate from the logical structure)
${JSON.stringify(template.structure, null, 2)}

## CLUE LOGIC (follow this framework exactly)
${JSON.stringify(template.clueLogic, null, 2)}

## CHARACTER ARCHETYPES (adapt these to the theme)
${template.characterArchetypes.join(', ')}

## CUSTOMIZATION PARAMETERS
- Theme/Setting: ${config.theme}
- Number of guests: ${config.guestCount}
- Difficulty: ${config.difficulty} â ${difficultyGuide[config.difficulty]}
- Tier: ${config.tier}
${config.specialRequests ? `- Special requests: ${config.specialRequests}` : ''}
${config.guestProfiles && config.guestProfiles.length > 0 ? `
## GUEST PERSONALIZATION
The host has provided information about their real guests. Use their REAL NAMES as character names and design characters that match each guest's personality. This is critical â it makes the experience personal and memorable.

${config.guestProfiles.map((g, i) => `Guest ${i + 1}: "${g.name}"${g.personality ? ` â Personality: ${g.personality}` : ''}${g.dietary ? ` â Dietary: ${g.dietary}` : ''}`).join('\n')}

PERSONALIZATION RULES:
- Use these exact real names as the character names
- If a guest is described as "shy", give them a bold/dramatic character to help them break out of their shell
- If a guest "loves drama", give them a character at the center of the intrigue with lots of confrontation tasks
- If a guest is "competitive", give them the most complex investigation angle
- Adapt the menu to accommodate any dietary restrictions listed (provide alternative dishes where needed)
- If fewer names are provided than the guest count, create original names for the remaining characters
` : ''}

## YOUR TASK
Take the template structure above and bring it to life in the "${config.theme}" setting. Create:

1. A compelling title and tagline
2. A detailed host guide with scene-by-scene instructions and timing
3. ${config.guestCount} unique character sheets (adapt the archetypes to fit the theme and guest count â combine or split archetypes as needed)
4. Clue cards that follow the clue logic framework
5. A complete accusation and reveal sequence
6. A themed dinner menu with cocktails
7. An atmosphere guide (decorations, music, dress code)

CRITICAL CHARACTER DESIGN RULES â "NO BORING CHARACTERS":
Every single character must feel ESSENTIAL to the evening. No extras, no filler roles, no one watching from the sidelines. Apply ALL of the following:

1. UNIQUE MECHANICAL ABILITY ("specialSkill"): Every character has a specific investigative ability that ONLY they can perform. Other players MUST seek them out to use it. This makes every character a hub of interaction.
   Examples: "Handwriting analyst â can verify if a document was forged (other players bring you documents to examine)", "Toxicologist â can identify any poison from its description (players consult you about suspicious substances)", "Locksmith â can determine how a lock was bypassed (the host will ask you to examine the crime scene lock in Act 2)".
   The host guide should reference these abilities so the host knows to direct players to use them.

2. PERSONAL MISSIONS ("tasks"): 3-5 concrete actions that create player-to-player interaction and dramatic moments. At least one task should REQUIRE cooperation with another specific character, and at least one should put them in CONFLICT with someone.
   Good: "Before Act 3, privately show the photograph to [character] and gauge their reaction â their response determines your next move"
   Bad: "Investigate the crime" (too vague, doesn't create interaction)

3. INTERCONNECTED SECRETS ("privateSecrets"): Minimum 2 secrets per character. One tied to the murder plot, one personal. But here's the key: secrets must LINK characters together. Character A's secret should implicate Character B. Character B's alibi depends on Character C staying quiet. This web ensures everyone is entangled.

4. CONFLICTING GOALS: Every character's goals should directly oppose at least one other character's goals, creating natural dramatic tension without anyone needing to "act."

5. EQUAL SCREEN TIME: Distribute clues, tasks, and dramatic moments evenly. Count them. No character should have fewer than 3 clues or tasks. The host guide should direct attention to quieter characters at specific moments.

ADDITIONAL RULES:
- Clue logic must be airtight â the solution must be definitively provable
- The experience should last 2.5-3.5 hours
- Character sheets should have enough material for guests to improvise naturally
- The menu should be actually cookable by a home cook${config.guestProfiles?.some(g => g.dietary) ? ` â include alternatives for dietary restrictions` : ''}
- All content must be themed to "${config.theme}"
- The atmosphere.music field should include SPECIFIC artist names and song suggestions, not just genres

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
      "specialSkill": "string (a unique ability or expertise that only this character has â relevant to investigation, e.g., 'Expert forger â can analyze handwriting and detect fakes' or 'Former locksmith â can determine how any lock was picked')",
      "publicBio": "string (what everyone knows about them â 2-3 sentences)",
      "privateSecrets": "string (at least 2 secrets: one tied to the murder plot, one personal â both creating dramatic tension)",
      "goals": "string (specific objectives for the evening that conflict with at least one other character's goals)",
      "tasks": ["string (3-5 specific actions the player must accomplish during the game, e.g., 'Privately confront X about the missing documents before Act 3', 'Plant the red envelope in Y's coat pocket without being seen')"],
      "relationships": "string (how they relate to every other character â include at least one hidden connection)",
      "conversationPrompts": ["string (5 things they might say to spark interaction and organically surface clues)"]
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
    "revealScript": "string (the full dramatic reveal â who did it, how, and why)",
    "epilogue": "string (what happened to each character after â a satisfying ending)"
  },
  "menu": {
    "theme": "string (the culinary direction)",
    "appetizers": ["string (dish name â brief description)"],
    "mains": ["string"],
    "desserts": ["string"],
    "cocktails": ["string (cocktail name â ingredients â brief instructions)"],
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

// Extract the first complete JSON object from a string using brace counting.
// Handles braces inside strings and escaped quotes correctly.
function extractJSON(text: string): string {
  const start = text.indexOf('{')
  if (start === -1) throw new Error('No JSON object found in response')

  let depth = 0
  let inString = false
  let escape = false

  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escape) { escape = false; continue }
    if (ch === '\\' && inString) { escape = true; continue }
    if (ch === '"' && !escape) { inString = !inString; continue }
    if (inString) continue
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  throw new Error('No complete JSON object found in response')
}

export async function generateMystery(config: MysteryConfig): Promise<GeneratedMystery> {
  const template = selectTemplate(config.guestCount)
  const prompt = buildPrompt(config, template)

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }],
  })

  const finalMessage = await stream.finalMessage()
  const text = getResponseText(finalMessage)

  const jsonStr = extractJSON(text)
  return JSON.parse(jsonStr) as GeneratedMystery
}

export function generateMysteryStream(config: MysteryConfig): ReadableStream {
  const template = selectTemplate(config.guestCount)
  const prompt = buildPrompt(config, template)

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          messages: [{ role: 'user', content: prompt }],
        })

        let fullText = ''
        let lastProgressSent = 0

        stream.on('text', (text) => {
          fullText += text
          // Only send progress every 500 chars to avoid flooding
          if (fullText.length - lastProgressSent >= 500) {
            lastProgressSent = fullText.length
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'progress', length: fullText.length })}\n\n`))
          }
        })

        const finalMessage = await stream.finalMessage()
        const responseText = getResponseText(finalMessage)

        let jsonStr: string
        try {
          jsonStr = extractJSON(responseText)
        } catch {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'error', error: 'Invalid response format â could not extract JSON from AI response' })}\n\n`))
          controller.close()
          return
        }

        let mystery: unknown
        try {
          mystery = JSON.parse(jsonStr)
        } catch {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'error', error: 'The AI returned a malformed mystery. Please try again.' })}\n\n`))
          controller.close()
          return
        }
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
