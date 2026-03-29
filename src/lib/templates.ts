// Pre-crafted mystery STRUCTURES \u2014 the logical skeleton that guarantees
// the puzzle works. The AI layer customizes characters, dialogue, and
// flavor text on top of these proven frameworks.

export interface MysteryTemplate {
  id: string
  name: string
  structure: {
    act1: string // Setup \u2014 introduce characters, establish setting
    act2: string // Discovery \u2014 the body is found, investigation begins
    act3: string // Revelations \u2014 secrets surface, alliances shift
    act4: string // Accusation & reveal
  }
  clueLogic: {
    // How clues interconnect. Each clue has a type and a logical role.
    murderWeapon: string
    motive: string
    opportunity: string
    redHerrings: string[]
    keyClue: string // The clue that definitively solves it
  }
  characterArchetypes: string[] // Roles that must exist for the plot to work
  minGuests: number
  maxGuests: number
}

export const TEMPLATES: MysteryTemplate[] = [
  {
    id: 'betrayal-at-the-top',
    name: 'Betrayal at the Top',
    structure: {
      act1: 'Guests gather for a celebration hosted by a powerful figure. Each guest has a personal connection to the host and a reason to want something from them. The host makes a dramatic announcement that threatens at least half the guests\' interests.',
      act2: 'The host is found dead. The last person seen with them becomes the prime suspect, but they have an alibi that depends on another guest confirming it. Initial clues point in at least two different directions.',
      act3: 'A secret document is discovered that reveals the host was not who they claimed to be. This reframes every guest\'s motive. A second, smaller crime is revealed (theft, blackmail, or fraud) that involves two guests conspiring. The alibi from Act 2 is partially disproven.',
      act4: 'The killer is the person who seemed to have the LEAST motive initially. Their real connection to the host is revealed through the key clue. The murder weapon connects to something established in Act 1 that seemed insignificant.',
    },
    clueLogic: {
      murderWeapon: 'An item that was part of the celebration setup \u2014 initially overlooked because it belonged in the scene.',
      motive: 'The killer was protecting someone else (a loved one the host was about to destroy). The motive is sympathetic.',
      opportunity: 'The killer used the moment when the host\'s announcement caused chaos and everyone was distracted.',
      redHerrings: [
        'A guest with a loud, obvious grudge who was actually reconciling with the host',
        'A piece of evidence planted by the guest committing the secondary crime',
        'A mysterious note that seems threatening but is actually a love letter',
      ],
      keyClue: 'A physical item on the killer\'s person that could only have been obtained from the host during the murder window.',
    },
    characterArchetypes: [
      'The Host (victim)',
      'The Protector (killer \u2014 protecting someone)',
      'The Rival (obvious suspect, actually innocent)',
      'The Secret Lover (provides/complicates alibis)',
      'The Blackmailer (secondary crime)',
      'The Newcomer (discovers the body, audience surrogate)',
      'The Loyalist (knows more than they say)',
      'The Opportunist (involved in secondary crime)',
    ],
    minGuests: 4,
    maxGuests: 12,
  },
  {
    id: 'the-inheritance',
    name: 'The Inheritance',
    structure: {
      act1: 'A recently deceased patriarch/matriarch has gathered their heirs for the reading of the will. The executor reveals the inheritance is conditional \u2014 they must spend the evening together to qualify. Each heir has a strained relationship with at least one other heir.',
      act2: 'The executor is murdered before revealing the will\'s contents. A partial document is found suggesting the bulk of the estate goes to the least-expected heir. Suspicion falls on those who stood to lose the most.',
      act3: 'Hidden rooms or compartments in the venue reveal the deceased had secrets \u2014 affairs, debts, a secret child, or a criminal past. Each revelation reshuffles who benefits from the executor\'s death. Two heirs discover they\'re not who they think they are.',
      act4: 'The killer murdered the executor to prevent revelation of a document that would invalidate their entire claim. The key clue connects the killer to the hidden room, proving they knew about the secrets before anyone else.',
    },
    clueLogic: {
      murderWeapon: 'A heavy antique from the estate \u2014 something that was part of the inheritance itself.',
      motive: 'The killer\'s entire identity/claim to the inheritance is fraudulent, and the executor was about to prove it.',
      opportunity: 'The killer excused themselves during a staged argument between two other heirs (an argument the killer secretly provoked).',
      redHerrings: [
        'A heir who loudly threatened to \"destroy\" the executor over a past legal dispute',
        'A forged page of the will that implicates an innocent heir',
        'A mysterious stranger seen outside who is actually just a delivery person',
      ],
      keyClue: 'A key or access card to the hidden room found in the killer\'s possession, proving prior knowledge.',
    },
    characterArchetypes: [
      'The Executor (victim)',
      'The Fraud (killer \u2014 identity is fabricated)',
      'The Disinherited (obvious suspect, bitter but innocent)',
      'The Favorite (expected heir, has own dark secret)',
      'The Black Sheep (family outcast who actually has the best alibi)',
      'The Spouse (married into the family, divided loyalties)',
      'The Secret Heir (didn\'t know they were related)',
      'The Family Lawyer (knows partial truths)',
    ],
    minGuests: 4,
    maxGuests: 12,
  },
  {
    id: 'the-final-curtain',
    name: 'The Final Curtain',
    structure: {
      act1: 'A group assembles for a creative premiere or grand opening \u2014 a play, gallery show, album launch, or film screening. The creative lead is a brilliant but toxic personality who has wronged almost everyone present. During the event, the lights go out briefly.',
      act2: 'When the lights return, the creative lead is dead. The performance/show was being recorded, creating a partial alibi timeline \u2014 but there\'s a 4-minute gap in the recording. Everyone was supposedly in the audience, but the seating doesn\'t quite account for everyone.',
      act3: 'The creative work itself contains hidden messages \u2014 references to real events and real people in the room. Someone was being exposed through the art. A collaborator reveals they helped create the work and hid their own messages inside it. The 4-minute gap narrows suspects to three people.',
      act4: 'The killer was the person being exposed by the creative work. They realized during Act 1 what the premiere would reveal and improvised the murder during the blackout. The key clue is a detail from the creative work that only the killer would want suppressed.',
    },
    clueLogic: {
      murderWeapon: 'A piece of the creative equipment \u2014 a prop, a display fixture, or a technical instrument.',
      motive: 'The creative work was about to publicly expose the killer\'s worst secret.',
      opportunity: 'The 4-minute blackout during the event, which the killer may or may not have caused.',
      redHerrings: [
        'A bitter ex-collaborator who had been publicly humiliated by the victim',
        'Evidence of sabotage to the event that was actually just technical failure',
        'A threatening review/critique written by a guest that sounds like a death threat in context',
      ],
      keyClue: 'A piece of the creative work (a page, file, or recording) that the killer tried to destroy during the blackout but failed to fully eliminate.',
    },
    characterArchetypes: [
      'The Creative Visionary (victim)',
      'The Exposed One (killer \u2014 secret about to be revealed)',
      'The Ex-Collaborator (obvious suspect, actually mourning)',
      'The Critic (sharp-tongued but ultimately an ally of the victim)',
      'The Muse (inspired the work, knows its secrets)',
      'The Investor (cares about money, not art)',
      'The Prot\u00E9g\u00E9 (worshipped the victim, devastated)',
      'The Technician (controlled the lights and recording)',
    ],
    minGuests: 4,
    maxGuests: 12,
  },
  {
    id: 'dead-on-arrival',
    name: 'Dead on Arrival',
    structure: {
      act1: 'Guests are stranded together \u2014 a remote lodge, a train, a ship, or an island. Someone or something has cut them off from the outside world. Each guest has a reason to be there and a reason they wish they weren\'t. An uneasy alliance forms.',
      act2: 'One guest is found dead in a locked or seemingly impossible location. The method of death suggests planning \u2014 this wasn\'t impulsive. Everyone has a gap in their timeline. The group realizes someone among them is not a stranger but has a hidden connection to the victim.',
      act3: 'The isolation intensifies. A second incident occurs (not another death, but a threat: poisoning attempt, sabotage, or a terrifying discovery). This proves the killer is still active. Hidden connections between guests emerge \u2014 several of them share a past event that links them to the victim.',
      act4: 'The killing was revenge for the past event, which the victim orchestrated. The killer is the person most recently connected to its consequences. The locked-room element is explained by a clever but simple mechanism established in Act 1.',
    },
    clueLogic: {
      murderWeapon: 'Something available in the isolated setting that was modified or repurposed.',
      motive: 'Revenge for a past event the victim orchestrated that destroyed the killer\'s life.',
      opportunity: 'The isolation itself \u2014 the killer chose this specific gathering because escape was impossible and the victim couldn\'t flee.',
      redHerrings: [
        'A guest who is secretly an investigator/journalist researching the past event',
        'Physical evidence suggesting an outside intruder when there is none',
        'A guest\'s hidden medical condition that mimics suspicious behavior',
      ],
      keyClue: 'A personal memento connecting the killer to the past event, hidden but discoverable in their belongings.',
    },
    characterArchetypes: [
      'The Organizer (victim \u2014 brought everyone together, hiding why)',
      'The Avenger (killer \u2014 life destroyed by the past event)',
      'The Investigator (secretly researching, obvious suspect)',
      'The Innocent Bystander (genuinely has no connection, provides outside perspective)',
      'The Accomplice (helped the victim in the past, feels guilty)',
      'The Survivor (also suffered from the past event, empathizes with killer)',
      'The Skeptic (doesn\'t believe anyone present is capable)',
      'The Wild Card (unpredictable, complicates everyone\'s plans)',
    ],
    minGuests: 4,
    maxGuests: 12,
  },
]

export function selectTemplate(guestCount: number): MysteryTemplate {
  // Randomly select from templates that fit the guest count
  const valid = TEMPLATES.filter(t => guestCount >= t.minGuests && guestCount <= t.maxGuests)
  return valid[Math.floor(Math.random() * valid.length)] || TEMPLATES[0]
}
