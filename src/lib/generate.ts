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

## TEMPLATE STRUCTURE (use this exact plot skeleton \u2014 do NOT deviate from the logical structure)
${JSON.stringify(template.structure, null, 2)}

## CLUE LOGIC (follow this framework exactly)
${JSON.stringify(template.clueLogic, null, 2)}

## CHARACTER ARCHETYPES (adapt these to the theme)
${template.characterArchetypes.join(', ')}

## CUSTOMIZATION PARAMETERS
- Theme/Setting: ${config.theme}
- Number of guests: ${config.guestCount}
- Difficulty: ${config.difficulty} \u2014 ${difficultyGuide[config.difficulty]}
- Tier: ${config.tier}
${config.specialRequests ? `- Special requests: ${config.specialRequests}` : ''}

## YOUR TASK
Take the template structure above and bring it to life in the "${config.theme}" setting. Create:

1. A compelling title and taglineSwitch to streaming API to fix Vercel timeout
2. A detailed host guide with scene-by-scene instructions and timing
3. ${config.guestCount} unique character sheets (adapt the archetypes to fit the theme and guest count \u2014 combine or split archetypes as needed)
4. Clue cards that follow the clue logic framework
5. A complete accusation and reveal sequence
6. A themed dinner menu with cocktails
7. An atmosphere guide (decorations, music, dress code)

IMPORTANT RULES:
- Every character must have at least one secret that affects the story
- Clue logic must be airtight \u2014 the solution must be definitively provable
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
      "publicBio": "string (what everyone knows about them \u2014 2-3 sentences)",
      "privateSecrets": "string (what only they know \u2014 this drives their behavior)",
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
    "revealScript": "string (the full dramatic reveal \u2014 who did it, how, and why)",
    "epilogue": "string (what happened to each character after \u2014 a satisfying ending)"
  },
  "menu": {
    "theme": "string (the culinary direction)",
    "appetizers": ["string (dish name \u2014 brief description)"],
    "mains": ["string"],
    "desserts": ["string"],
    "cocktails": ["string (cocktail name \u2014 ingredients \u2014 brief instructions)"],
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

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse the JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to generate mystery \u2014 invalid response format')
  }

  return JSON.parse(jsonMatch[0]) as GeneratedMystery
}
