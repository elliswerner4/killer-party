import { JoinCodeCard } from '@/components/JoinCodeCard'

const STEPS = [
  {
    title: 'Set the table',
    body: 'Pick a setting, the number of guests and how hard the puzzle should be. Add your friends’ names and a word about each of them if you want characters written for them.',
  },
  {
    title: 'Get your mystery',
    body: 'In a few minutes you have the whole evening: a character for every guest, clues spread over four acts, a host script, the reveal, and a menu to match.',
  },
  {
    title: 'Host the night',
    body: 'Guests join on their phones with your game code and see only their own character. You run the acts from a host dashboard and read the reveal when the votes are in.',
  },
]

const CONTENTS = [
  ['Character sheets', 'A public bio, two secrets, goals that clash with someone else’s, and tasks for the evening. Nobody gets a walk-on part.'],
  ['Clue cards', 'Evidence that comes out act by act, with red herrings matched to the difficulty you chose.'],
  ['Host script', 'What to say and when, act by act, with timings for a two-and-a-half to three-and-a-half hour evening.'],
  ['The reveal', 'A read-aloud accusation scene and a reveal that walks through the evidence, plus an epilogue for every character.'],
  ['Menu and drinks', 'Dishes and cocktails a home cook can make, in keeping with the setting.'],
  ['Atmosphere', 'Music with named artists and songs, dress code, lighting and table ideas.'],
]

export default function Home() {
  return (
    <div>
      {/* Hero: hosts on the left, invited guests on the place card */}
      <section className="px-4 sm:px-6 pt-14 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1.25fr_1fr] gap-12 md:gap-16 items-center">
          <div>
            <h1 className="font-display text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-7xl text-parchment max-w-[14ch]">
              A murder at your dinner table.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-300 max-w-[46ch]">
              Killer Party writes a one-off murder mystery for your friends: a character for every guest, the clues,
              a script for the host and the final reveal. You bring dinner.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a href="/create" className="btn-primary text-base px-7 py-3.5">
                Create a mystery
              </a>
              <a href="#how-it-works" className="text-parchment underline decoration-parchment/30 underline-offset-4 hover:decoration-parchment">
                How it works
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500">From $35 for up to 8 guests. Paid once, yours to keep.</p>
          </div>

          <div className="flex md:justify-end">
            <div className="w-full max-w-sm md:rotate-[1.5deg]">
              <JoinCodeCard />
            </div>
          </div>
        </div>
      </section>

      {/* How it works: a real sequence, so numbered */}
      <section id="how-it-works" className="px-4 sm:px-6 py-20 border-t border-parchment/10 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-parchment max-w-[20ch]">How an evening comes together</h2>
          <ol className="mt-12 grid md:grid-cols-3 gap-10 md:gap-12">
            {STEPS.map((step, i) => (
              <li key={step.title} className="border-t border-gold/40 pt-5">
                <p className="font-display text-gold text-xl">{i + 1}.</p>
                <h3 className="mt-2 font-display text-2xl text-parchment">{step.title}</h3>
                <p className="mt-3 text-gray-300 leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What's in the package */}
      <section className="px-4 sm:px-6 py-20 border-t border-parchment/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_2fr] gap-10 md:gap-16">
          <div>
            <h2 className="font-display text-4xl md:text-5xl text-parchment">What you get</h2>
            <p className="mt-4 text-gray-400 leading-relaxed max-w-[36ch]">
              Everything is written for your setting and guest count, and you can print the whole package or run it from your phone.
            </p>
          </div>
          <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
            {CONTENTS.map(([term, desc]) => (
              <div key={term}>
                <dt className="font-display text-xl text-parchment">{term}</dt>
                <dd className="mt-1.5 text-gray-400 leading-relaxed">{desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* On the night */}
      <section className="px-4 sm:px-6 py-20 border-t border-parchment/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <h2 className="font-display text-4xl md:text-5xl text-parchment">On the night, everyone plays from their phone</h2>
            <ul className="mt-8 space-y-4 text-gray-300 leading-relaxed">
              <li><span className="text-parchment font-semibold">Guests</span> open this site, tap Join a game, enter your code and pick their character. They see their own secrets and clues, and nobody else’s.</li>
              <li><span className="text-parchment font-semibold">You</span> keep the host dashboard open: it shows who has joined, what to read in each act and which clues to hand to whom.</li>
              <li><span className="text-parchment font-semibold">At the end</span> everyone votes on their phone, then you reveal the killer.</li>
            </ul>
          </div>

          {/* A quiet rendering of the host dashboard */}
          <figure className="card max-w-md md:ml-auto w-full" aria-label="Example host dashboard">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-xl text-parchment">Death at the Gilded Lily</p>
              <p className="text-sm text-gray-500">Act 2 of 4</p>
            </div>
            <p className="mt-1 text-sm text-gray-500">Game code <span className="text-gold font-semibold tracking-wider">RAVEN-3185</span></p>
            <div className="mt-5 border-t border-parchment/10 pt-4">
              <p className="text-sm font-semibold text-parchment">Clues to hand out</p>
              <ul className="mt-2 space-y-2 text-sm">
                <li className="flex justify-between gap-4"><span className="text-gray-300">A torn bar tab</span><span className="text-gray-500">to Ada Fairweather</span></li>
                <li className="flex justify-between gap-4"><span className="text-gray-300">Lipstick on the glass</span><span className="text-gray-500">to everyone</span></li>
              </ul>
            </div>
            <div className="mt-5 border-t border-parchment/10 pt-4 flex items-center justify-between text-sm">
              <span className="text-gray-400">6 of 6 guests joined</span>
              <span className="rounded-md bg-blood px-3 py-1.5 font-semibold text-parchment">Start act 3</span>
            </div>
          </figure>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 sm:px-6 py-20 border-t border-parchment/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-parchment">Pricing</h2>
          <p className="mt-4 text-gray-400">One payment per mystery. No subscription.</p>
          <div className="mt-10 grid md:grid-cols-2 gap-6 max-w-4xl">
            <div className="rounded-lg border border-parchment/15 p-7 flex flex-col">
              <h3 className="font-display text-3xl text-parchment">Classic</h3>
              <p className="mt-1"><span className="font-display text-4xl text-parchment">$35</span></p>
              <ul className="mt-6 space-y-2 text-gray-300 flex-1">
                <li>4 to 8 guests</li>
                <li>Choose from eight settings</li>
                <li>Every part of the package</li>
              </ul>
              <a href="/create?tier=classic" className="btn-secondary mt-8">Create a Classic mystery</a>
            </div>
            <div className="rounded-lg border border-gold/50 bg-noir-light p-7 flex flex-col">
              <h3 className="font-display text-3xl text-parchment">Grand</h3>
              <p className="mt-1"><span className="font-display text-4xl text-parchment">$49</span></p>
              <ul className="mt-6 space-y-2 text-gray-300 flex-1">
                <li>Up to 12 guests</li>
                <li>Any setting you can describe</li>
                <li>Every part of the package</li>
              </ul>
              <a href="/create?tier=grand" className="btn-primary mt-8">Create a Grand mystery</a>
            </div>
          </div>
        </div>
      </section>

      {/* Close: both audiences again */}
      <section className="px-4 sm:px-6 py-20 border-t border-parchment/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-display text-4xl text-parchment">Hosting?</h2>
            <p className="mt-3 text-gray-300 max-w-[40ch]">Set up your mystery now and it’s ready to send to your guests in a few minutes.</p>
            <a href="/create" className="btn-primary mt-6">Create a mystery</a>
          </div>
          <div>
            <h2 className="font-display text-4xl text-parchment">Got a code?</h2>
            <p className="mt-3 text-gray-300 max-w-[40ch]">Your host sent you a game code like KNIFE-7421. Enter it to pick your character.</p>
            <a href="/join" className="btn-secondary mt-6">Join a game</a>
          </div>
        </div>
      </section>
    </div>
  )
}
