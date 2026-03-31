export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-32 md:py-40 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blood-dark/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative">
          <p className="text-gold/80 tracking-[0.25em] uppercase text-xs mb-6">
            AI-generated murder mysteries
          </p>
          <h1 className="font-display text-5xl md:text-7xl text-white leading-[1.1] mb-8">
            Your dinner party,<br />
            <span className="text-blood-light">their last night.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-12 leading-relaxed">
            Every mystery is unique. Every character has a secret.
            Generate a complete dinner party experience in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/create" className="btn-primary text-base py-4 px-10">
              Create Your Mystery
            </a>
            <a href="#how-it-works" className="btn-secondary text-base py-4 px-10">
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-10 border-y border-gray-800/60">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex justify-between text-center">
            <div>
              <span className="block text-2xl font-display text-gold">2,400+</span>
              <span className="text-xs text-gray-500 tracking-wide">Mysteries</span>
            </div>
            <div>
              <span className="block text-2xl font-display text-gold">4.9/5</span>
              <span className="text-xs text-gray-500 tracking-wide">Rating</span>
            </div>
            <div>
              <span className="block text-2xl font-display text-gold">18,000+</span>
              <span className="text-xs text-gray-500 tracking-wide">Guests</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-gold/70 tracking-[0.2em] uppercase text-xs text-center mb-4">How it works</p>
          <h2 className="font-display text-3xl md:text-4xl text-center text-white mb-20">
            Three steps to a killer night
          </h2>
          <div className="space-y-20">
            {[
              {
                step: '01',
                title: 'Design your mystery',
                desc: 'Pick a theme, set the guest count, choose difficulty. Personalize characters with your friends\u2019 names and personalities for a mystery that feels made for your group.',
              },
              {
                step: '02',
                title: 'We generate everything',
                desc: 'Our AI builds a complete, interconnected murder mystery: unique characters with secrets and motives, layered clues that unfold across four acts, a dramatic reveal, a themed menu, and atmosphere guide.',
              },
              {
                step: '03',
                title: 'Host an unforgettable night',
                desc: 'Use the companion app to run the game in real-time. Each guest gets their own character view on their phone with private secrets, clues, and tasks. You control the pacing from the host dashboard.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-8 md:gap-12 items-start">
                <span className="font-display text-6xl md:text-7xl text-blood/20 leading-none shrink-0 w-20 text-right">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-display text-xl md:text-2xl text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed max-w-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companion App Feature */}
      <section className="py-24 px-6 border-y border-gray-800/40">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-gold/70 tracking-[0.2em] uppercase text-xs mb-4">Companion app</p>
              <h2 className="font-display text-3xl text-white mb-6">
                Run the game from your phone
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                The host dashboard lets you advance acts, reveal clues at the perfect moment, trigger the accusation phase, and deliver the dramatic reveal. No printed scripts to fumble with.
              </p>
              <div className="space-y-4">
                {[
                  'Control game pacing act by act',
                  'Push clues to specific players in real-time',
                  'Track which guests have voted',
                  'One-tap dramatic reveal',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-noir-light to-noir rounded-2xl border border-gray-800 p-8 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gold font-display text-sm">Host Dashboard</span>
                  <span className="text-xs text-gray-500">Act 2 of 4</span>
                </div>
                <div className="bg-noir/60 rounded-lg p-3 border border-gray-800">
                  <span className="text-xs text-gray-500">Current Phase</span>
                  <p className="text-white text-sm font-medium">Investigation</p>
                </div>
                <div className="bg-noir/60 rounded-lg p-3 border border-gray-800">
                  <span className="text-xs text-gray-500">Players Online</span>
                  <p className="text-gold text-sm font-medium">6 of 6</p>
                </div>
                <div className="bg-blood/20 border border-blood/30 rounded-lg p-3 text-center">
                  <span className="text-blood-light text-sm font-medium">Advance to Act 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Character Roles Feature */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="space-y-3">
                {[
                  { name: 'Victoria Sterling', role: 'The Heiress', secret: 'Secretly bankrupt and desperate' },
                  { name: 'Marcus Blackwood', role: 'The Business Partner', secret: 'Discovered the fraud last week' },
                  { name: 'Dr. Evelyn Cross', role: 'The Family Doctor', secret: 'Hiding a forged prescription' },
                ].map((char) => (
                  <div key={char.name} className="bg-noir-light/60 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                        <span className="text-gold font-display text-sm">{char.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{char.name}</p>
                        <p className="text-gold/70 text-xs">{char.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs pl-11">{char.secret}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-gold/70 tracking-[0.2em] uppercase text-xs mb-4">Every guest matters</p>
              <h2 className="font-display text-3xl text-white mb-6">
                Characters with depth, not costumes
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Each character comes with a private backstory, hidden motives, specific tasks to complete during the evening, and conversation prompts that naturally create tension and alliances.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Guests see only their own secrets on their phone. Everyone has something to hide, something to find out, and someone they don&apos;t trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-24 px-6 border-y border-gray-800/40">
        <div className="max-w-4xl mx-auto">
          <p className="text-gold/70 tracking-[0.2em] uppercase text-xs text-center mb-4">What you get</p>
          <h2 className="font-display text-3xl md:text-4xl text-center text-white mb-16">
            A complete experience, not a kit
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {[
              { title: 'Host Guide', desc: 'Scene-by-scene instructions with timing cues and tips for building suspense.' },
              { title: 'Character Sheets', desc: 'Private backstories, secrets, motivations, and conversation prompts for every guest.' },
              { title: 'Clue Cards', desc: 'Evidence that unfolds across four acts, keeping the mystery alive all evening.' },
              { title: 'Companion App', desc: 'Real-time game management for hosts. Character views on every guest\u2019s phone.' },
              { title: 'Themed Menu', desc: 'Recipes and cocktail pairings matched to your setting and era.' },
              { title: 'Atmosphere Guide', desc: 'Music, decor, and dress code suggestions to set the perfect mood.' },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="font-display text-lg text-white mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-gold/70 tracking-[0.2em] uppercase text-xs text-center mb-4">Pricing</p>
          <h2 className="font-display text-3xl md:text-4xl text-center text-white mb-16">
            One purchase, one unforgettable night
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-800 rounded-2xl p-8">
              <h3 className="font-display text-xl text-white mb-1">Classic</h3>
              <p className="text-3xl font-display text-gold mb-1">$35</p>
              <p className="text-gray-600 text-xs mb-8">one-time</p>
              <div className="space-y-3 mb-8">
                {['4\u20138 guests', 'Curated themes', 'Full character sheets & clues', 'Host guide & reveal', 'Menu & atmosphere guide'].map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <span className="text-gold text-xs">&#10003;</span>
                    <span className="text-gray-400 text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <a href="/create?tier=classic" className="block text-center border border-gray-700 text-gray-300 hover:border-gold hover:text-gold py-3 rounded-lg text-sm font-medium transition-colors">
                Choose Classic
              </a>
            </div>
            <div className="border border-gold/40 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-6 bg-gold text-noir-dark text-[10px] font-bold px-3 py-0.5 rounded-full tracking-wide">
                POPULAR
              </div>
              <h3 className="font-display text-xl text-white mb-1">Grand</h3>
              <p className="text-3xl font-display text-gold mb-1">$49</p>
              <p className="text-gray-600 text-xs mb-8">one-time</p>
              <div className="space-y-3 mb-8">
                {['Up to 12 guests', 'Any theme \u2014 fully custom', 'Extra clue complexity', 'Everything in Classic', 'Printable name badges & props'].map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <span className="text-gold text-xs">&#10003;</span>
                    <span className="text-gray-400 text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <a href="/create?tier=grand" className="btn-primary block text-center py-3 text-sm">
                Choose Grand
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 border-t border-gray-800/40">
        <div className="max-w-4xl mx-auto">
          <p className="text-gold/70 tracking-[0.2em] uppercase text-xs text-center mb-4">From hosts</p>
          <h2 className="font-display text-3xl text-center text-white mb-16">
            People can&apos;t stop talking about it
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: 'My friends are still talking about it three weeks later. Everyone stayed in character the whole night.',
                name: 'Sarah M.',
                detail: '1920s Speakeasy, 8 guests',
              },
              {
                quote: 'The clues actually made sense and the reveal was genuinely surprising. Way better than boxed mystery games.',
                name: 'James K.',
                detail: 'Victorian Manor, 6 guests',
              },
              {
                quote: 'The companion app made hosting so easy. I just tapped buttons and everyone had an amazing time.',
                name: 'Taylor R.',
                detail: 'Hollywood Noir, 10 guests',
              },
            ].map((t) => (
              <div key={t.name} className="border border-gray-800/60 rounded-xl p-6">
                <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-white text-sm font-medium">{t.name}</p>
                <p className="text-gray-600 text-xs">{t.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6 leading-tight">
            Ready to host a<br /><span className="text-blood-light">killer</span> night?
          </h2>
          <p className="text-gray-500 mb-10">
            Your guests will never see it coming.
          </p>
          <a href="/create" className="btn-primary text-base py-4 px-12">
            Create Your Mystery
          </a>
        </div>
      </section>
    </div>
  )
}
