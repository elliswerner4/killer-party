import Anthropic from '@anthropic-ai/sdk'
import { selectTemplate, type MysteryTemplate } from './templates'

// Generous timeout: individual steps stream for up to ~2 minutes.
const anthropic = new Anthropic({ timeout: 4 * 60 * 1000, maxRetries: 2 })

// Override with ANTHROPIC_MODEL in Vercel if this model is ever retired
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5'

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

// ---------------------------------------------------------------------------
// Generation pipeline
//
// A full mystery is 10-20k tokens of output. Writing it in one call takes
// 3-6 minutes, which runs past the serverless time limit for larger parties.
// Instead we write a short outline first (the solution, the cast, the plot
// beats), then expand every section from that outline in parallel. Wall time
// is roughly one outline call plus the slowest expansion call.
// ---------------------------------------------------------------------------

const CHARACTERS_PER_BATCH = 3

const DIFFICULTY_GUIDE = {
  casual:
    'Keep clues straightforward. Limit red herrings to 1. The solution should be reachable by casual players who are there for fun, not brain-teasers.',
  intermediate:
    'Include 2-3 red herrings and require connecting at least 2 clues to solve. The solution should be satisfying but not frustratingly hard.',
  devious:
    'Use all red herrings, add extra misleading evidence, and require connecting 3+ clues to solve. Include at least one clue that only makes sense in retrospect.',
}

interface OutlineCharacter {
  name: string
  role: string
  specialSkill: string
  publicBio: string
  secretSummary: string
  plotFunction: string
}

interface MysteryOutline {
  title: string
  tagline: string
  setting: string
  victim: string
  solution: {
    killer: string
    motive: string
    method: string
    weapon: string
    keyEvidence: string
  }
  secondaryCrime: string
  redHerrings: string[]
  actBeats: { act1: string; act2: string; act3: string; act4: string }
  characters: OutlineCharacter[]
}

type ProgressFn = (event: { type: 'progress'; length: number } | { type: 'stage'; message: string }) => void

const JSON_ONLY = 'Respond with valid JSON only: no markdown, no code fences, no commentary before or after.'

function guestSection(config: MysteryConfig): string {
  if (!config.guestProfiles || config.guestProfiles.length === 0) return ''
  return `
## REAL GUESTS
The host listed their real guests. Use these exact names as character names and fit each character to the guest's personality.
${config.guestProfiles
  .map(
    (g, i) =>
      `Guest ${i + 1}: "${g.name}"${g.personality ? ` (personality: ${g.personality})` : ''}${g.dietary ? ` (dietary: ${g.dietary})` : ''}`
  )
  .join('\n')}
- A shy guest gets a bold, dramatic character to draw them out.
- A guest who loves drama sits at the center of the intrigue.
- A competitive guest gets the most complex investigation angle.
- If fewer names are given than the guest count, invent names for the rest.
`
}

function basics(config: MysteryConfig): string {
  return `- Theme/setting: ${config.theme}
- Number of guests (= number of playable characters): ${config.guestCount}
- Difficulty: ${config.difficulty}. ${DIFFICULTY_GUIDE[config.difficulty]}
- Tier: ${config.tier}${config.specialRequests ? `\n- Special requests from the host: ${config.specialRequests}` : ''}`
}

function outlinePrompt(config: MysteryConfig, template: MysteryTemplate): string {
  return `You are a professional murder mystery writer planning a dinner party game. Write the OUTLINE only: later writers will expand each part from it, so it must be precise and internally consistent.

## PLOT SKELETON (keep this logical structure)
${JSON.stringify(template.structure, null, 2)}

## CLUE LOGIC
${JSON.stringify(template.clueLogic, null, 2)}

## ARCHETYPES (adapt to the theme; combine or split to match the guest count)
${template.characterArchetypes.join(', ')}

## PARAMETERS
${basics(config)}
${guestSection(config)}
## RULES
- Exactly ${config.guestCount} playable characters. The victim is NOT a playable character; they die before or during Act 1.
- Exactly one playable character is the killer. The solution must be provable from the evidence.
- Every character has a unique investigative skill that others must seek out, and a secret that links them to at least one other character.
- Everything is themed to "${config.theme}".

${JSON_ONLY}
{
  "title": "string",
  "tagline": "string (one evocative line)",
  "setting": "string (2-3 sentences: where and when the party takes place)",
  "victim": "string (name and who they were, 1-2 sentences)",
  "solution": {
    "killer": "string (exact name of one playable character)",
    "motive": "string",
    "method": "string",
    "weapon": "string",
    "keyEvidence": "string (the clue that proves it)"
  },
  "secondaryCrime": "string (the smaller crime and which characters are involved)",
  "redHerrings": ["string"],
  "actBeats": { "act1": "string", "act2": "string", "act3": "string", "act4": "string" },
  "characters": [
    {
      "name": "string",
      "role": "string (public role in the setting)",
      "specialSkill": "string (unique investigative ability others must seek out)",
      "publicBio": "string (what everyone knows, 2-3 sentences)",
      "secretSummary": "string (their secrets in brief, naming the characters they link to)",
      "plotFunction": "string (killer / red herring / secondary crime / alibi witness / etc.)"
    }
  ]
}`
}

function outlineContext(config: MysteryConfig, outline: MysteryOutline): string {
  return `## THE MYSTERY OUTLINE (canonical; do not contradict it)
${JSON.stringify(outline, null, 2)}

## PARAMETERS
${basics(config)}`
}

function hostGuidePrompt(config: MysteryConfig, outline: MysteryOutline): string {
  return `You are a professional murder mystery writer. Write the HOST GUIDE for this dinner party game.

${outlineContext(config, outline)}

## RULES
- The evening lasts 2.5 to 3.5 hours across four acts.
- Give the host concrete, scene-by-scene instructions: what to say, when to hand out clues, and when to steer attention to quieter characters.
- Reference the characters' special skills so the host knows when to direct players to use them.
- The host does not play a character and knows the solution.

${JSON_ONLY}
{
  "overview": "string (2-3 paragraphs on the evening)",
  "timeline": "string (minute-by-minute schedule)",
  "act1": "string (detailed host instructions)",
  "act2": "string",
  "act3": "string",
  "act4": "string",
  "tips": "string (hosting tips and contingencies)"
}`
}

function cluesPrompt(config: MysteryConfig, outline: MysteryOutline, template: MysteryTemplate): string {
  return `You are a professional murder mystery writer. Write the CLUE CARDS for this dinner party game.

${outlineContext(config, outline)}

## CLUE LOGIC
${JSON.stringify(template.clueLogic, null, 2)}

## RULES
- The clues must make the solution definitively provable, with the key evidence revealed no earlier than act3.
- Include the red herrings from the outline.
- Spread clues so every character receives at least 2. Use exact character names in "givenTo", or "all" for clues read to everyone.
- About ${Math.max(10, config.guestCount * 2 + 4)} clues in total.

${JSON_ONLY}
{
  "clues": [
    {
      "id": "clue-1",
      "title": "string",
      "content": "string (the clue text players read)",
      "revealedIn": "act1 | act2 | act3 | act4",
      "givenTo": "string (character name or 'all')"
    }
  ]
}`
}

function revealPrompt(config: MysteryConfig, outline: MysteryOutline): string {
  return `You are a professional murder mystery writer. Write the ACCUSATION AND REVEAL scripts the host reads aloud at the end of this dinner party game.

${outlineContext(config, outline)}

${JSON_ONLY}
{
  "buildup": "string (read aloud to build tension before accusations)",
  "accusationPrompt": "string (what the host says to prompt guests to accuse)",
  "revealScript": "string (the full dramatic reveal: who did it, how, and why, walking through the evidence)",
  "epilogue": "string (what became of each character afterwards)"
}`
}

function extrasPrompt(config: MysteryConfig, outline: MysteryOutline): string {
  const dietary = config.guestProfiles?.filter((g) => g.dietary).map((g) => `${g.name}: ${g.dietary}`)
  return `You are planning the food and atmosphere for a murder mystery dinner party.

- Title: ${outline.title}
- Setting: ${outline.setting}
- Theme: ${config.theme}
- Guests: ${config.guestCount}${dietary && dietary.length ? `\n- Dietary needs (include alternatives): ${dietary.join('; ')}` : ''}

## RULES
- The menu must be cookable by a home cook.
- Music must name specific artists and songs, not just genres.

${JSON_ONLY}
{
  "menu": {
    "theme": "string (the culinary direction)",
    "appetizers": ["string (dish name: brief description)"],
    "mains": ["string"],
    "desserts": ["string"],
    "cocktails": ["string (name: ingredients: brief method)"],
    "nonAlcoholic": ["string"]
  },
  "atmosphere": {
    "decorations": "string",
    "music": "string",
    "dressCode": "string",
    "lighting": "string",
    "tableSettings": "string"
  }
}`
}

function charactersPrompt(config: MysteryConfig, outline: MysteryOutline, names: string[]): string {
  return `You are a professional murder mystery writer. Write the full CHARACTER SHEETS for these characters only: ${names.map((n) => `"${n}"`).join(', ')}.

${outlineContext(config, outline)}
${guestSection(config)}
## RULES ("no boring characters")
- Keep each character's name, role, specialSkill and publicBio consistent with the outline.
- privateSecrets: at least 2 secrets, one tied to the murder plot and one personal, and they must implicate or link to other named characters.
- goals: must directly conflict with at least one other character's goals.
- tasks: 3-5 concrete actions. At least one requires cooperating with a specific named character and at least one puts them in conflict with someone. Avoid vague tasks like "investigate the crime".
- relationships: how they relate to every other character, including at least one hidden connection.
- conversationPrompts: exactly 5 lines they might say to spark interaction and surface clues.
- The killer's sheet must not state outright that they are the killer, but must give them what they need to play the role convincingly.

${JSON_ONLY}
{
  "characters": [
    {
      "name": "string",
      "role": "string",
      "specialSkill": "string",
      "publicBio": "string",
      "privateSecrets": "string",
      "goals": "string",
      "tasks": ["string"],
      "relationships": "string",
      "conversationPrompts": ["string"]
    }
  ]
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
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  throw new Error('No complete JSON object found in response')
}

/**
 * Run one generation call and parse its JSON. Retries once on a cut-off or
 * unparseable response; the SDK already retries rate limits and overloads.
 */
async function callJSON<T>(
  label: string,
  prompt: string,
  maxTokens: number,
  onText: (delta: number) => void
): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const stream = anthropic.messages.stream({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      })
      stream.on('text', (t) => onText(t.length))
      const message = await stream.finalMessage()
      if (message.stop_reason === 'max_tokens') {
        throw new Error(`${label} was cut off at ${maxTokens} tokens`)
      }
      const text = message.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
      return JSON.parse(extractJSON(text)) as T
    } catch (err) {
      lastError = err
      // Model or auth problems will not fix themselves on retry.
      const status = (err as { status?: number })?.status
      if (status === 400 || status === 401 || status === 403 || status === 404) break
      console.error(`Generation step "${label}" failed (attempt ${attempt}):`, err)
    }
  }
  const detail = lastError instanceof Error ? lastError.message : String(lastError)
  throw new Error(`Could not write the ${label}. ${detail}`)
}

export async function generateMystery(config: MysteryConfig, onProgress: ProgressFn = () => {}): Promise<GeneratedMystery> {
  const template = selectTemplate(config.guestCount)

  let total = 0
  let lastSent = 0
  const onText = (n: number) => {
    total += n
    if (total - lastSent >= 400) {
      lastSent = total
      onProgress({ type: 'progress', length: total })
    }
  }

  onProgress({ type: 'stage', message: 'Plotting the murder' })
  const outline = await callJSON<MysteryOutline>('outline', outlinePrompt(config, template), 8000, onText)

  if (!Array.isArray(outline.characters) || outline.characters.length === 0) {
    throw new Error('Could not write the outline. It had no characters.')
  }

  onProgress({ type: 'stage', message: 'Writing characters, clues and the reveal' })

  const names = outline.characters.map((c) => c.name)
  const batches: string[][] = []
  for (let i = 0; i < names.length; i += CHARACTERS_PER_BATCH) {
    batches.push(names.slice(i, i + CHARACTERS_PER_BATCH))
  }

  const [hostGuide, clueResult, reveal, extras, ...characterBatches] = await Promise.all([
    callJSON<GeneratedMystery['hostGuide']>('host guide', hostGuidePrompt(config, outline), 8000, onText),
    callJSON<{ clues: GeneratedMystery['clues'] }>('clues', cluesPrompt(config, outline, template), 8000, onText),
    callJSON<GeneratedMystery['reveal']>('reveal', revealPrompt(config, outline), 6000, onText),
    callJSON<Pick<GeneratedMystery, 'menu' | 'atmosphere'>>('menu', extrasPrompt(config, outline), 4000, onText),
    ...batches.map((batch, i) =>
      callJSON<{ characters: GeneratedMystery['characters'] }>(
        `character sheets (${i + 1}/${batches.length})`,
        charactersPrompt(config, outline, batch),
        8000,
        onText
      )
    ),
  ])

  // Keep the outline's cast order; fall back to the outline entry if a sheet is missing.
  const written = new Map<string, GeneratedMystery['characters'][0]>()
  for (const batch of characterBatches) {
    for (const c of batch.characters || []) written.set(c.name.trim().toLowerCase(), c)
  }
  const characters = outline.characters.map((o) => {
    const c = written.get(o.name.trim().toLowerCase())
    return {
      name: o.name,
      role: c?.role || o.role,
      specialSkill: c?.specialSkill || o.specialSkill,
      publicBio: c?.publicBio || o.publicBio,
      privateSecrets: c?.privateSecrets || o.secretSummary,
      goals: c?.goals || '',
      tasks: Array.isArray(c?.tasks) ? c!.tasks : [],
      relationships: c?.relationships || '',
      conversationPrompts: Array.isArray(c?.conversationPrompts) ? c!.conversationPrompts : [],
    }
  })

  onProgress({ type: 'progress', length: total })

  return {
    title: outline.title,
    tagline: outline.tagline,
    theme: config.theme,
    guestCount: characters.length,
    difficulty: config.difficulty,
    hostGuide,
    characters,
    clues: Array.isArray(clueResult.clues) ? clueResult.clues : [],
    reveal,
    menu: extras.menu,
    atmosphere: extras.atmosphere,
  }
}

/**
 * Server-sent events stream for the browser. Emits `stage` and `progress`
 * events while writing, then a single `complete` or `error` event.
 * A comment line every 10s keeps proxies from closing an idle connection.
 */
export function generateMysteryStream(
  config: MysteryConfig,
  hooks: {
    onComplete?: (mystery: GeneratedMystery) => Promise<void>
    onError?: () => Promise<void>
  } = {}
): ReadableStream {
  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      const keepAlive = setInterval(() => controller.enqueue(encoder.encode(': keep-alive\n\n')), 10000)
      try {
        const mystery = await generateMystery(config, send)
        if (hooks.onComplete) {
          try {
            await hooks.onComplete(mystery)
          } catch (err) {
            console.error('Saving the generated mystery failed:', err)
          }
        }
        send({ type: 'complete', mystery })
      } catch (err) {
        console.error('Generation failed:', err)
        await hooks.onError?.().catch(() => {})
        const message = err instanceof Error ? err.message : 'Generation failed'
        send({ type: 'error', error: message })
      } finally {
        clearInterval(keepAlive)
        controller.close()
      }
    },
  })
}

/** SSE stream that sends an already-written mystery straight away. */
export function completedMysteryStream(mystery: GeneratedMystery): ReadableStream {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete', mystery })}\n\n`))
      controller.close()
    },
  })
}

/**
 * SSE stream for a second tab or a refresh while another request is still
 * writing the same purchase: waits for that result instead of paying twice.
 */
export function waitForMysteryStream(
  lookup: () => Promise<GeneratedMystery | null>,
  timeoutMs = 280_000
): ReadableStream {
  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      send({ type: 'stage', message: 'Your mystery is already being written' })
      const deadline = Date.now() + timeoutMs
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 4000))
        const mystery = await lookup().catch(() => null)
        if (mystery) {
          send({ type: 'complete', mystery })
          controller.close()
          return
        }
        controller.enqueue(encoder.encode(': keep-alive\n\n'))
      }
      send({ type: 'error', error: 'Your mystery is taking longer than expected. Please refresh this page in a minute.' })
      controller.close()
    },
  })
}
