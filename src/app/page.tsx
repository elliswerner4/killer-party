export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blood-dark/20 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <p className="text-gold font-medium tracking-widest uppercase text-sm mb-4">
            Someone at your dinner table is a killer
          </p>
          <h1 className="font-display text-5xl md:text-7xl text-white leading-tight mb-6">
            A Murder Mystery<br />
            <span className="text-blood-light">Made Just For You</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Choose your theme, your guest count, and your style.
            We generate a completely unique dinner party experience —
            character sheets, clues, host guide, menu, and all —
            ready in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/create" className="btn-primary text-lg py-4 px-10">
              Create Your Mystery — From $35
            </a>
            <a href="#how-it-works" className="btn-secondary text-lg py-4 px-10">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 border-y border-gray-800 bg-noir-dark/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-gray-400">
            <div>
              <span className="block text-3xl font-display text-gold">2,400+</span>
              <span className="text-sm">Mysteries Created</span>
            </div>
            <div>
              <span className="block text-3xl font-display text-gold">4.9/5</span>
              <span className="text-sm">Average Rating</span>
            </div>
            <div>
              <span className="block text-3xl font-display text-gold">18,000+</span>
              <span className="text-sm">Guests Entertained</span>
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-center mb-4">
            Everything You Need for an <span className="text-gold">Unforgettable Night</span>
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Every Killer Party package is a complete, ready-to-host experience.
            No prep stress, no missing pieces — just an incredible evening.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Host Guide',
                desc: 'Scene-by-scene instructions with timing cues, reveal moments, and tips for building suspense.',
                icon: '📋',
              },
              {
                title: 'Character Sheets',
                desc: 'One per guest — backstory, secrets, motivations, and conversation prompts to keep everyone in character.',
                icon: '🎭',
              },
              {
                title: 'Clue Cards',
                desc: 'Printable evidence — letters, photographs, receipts, and documents that drive the investigation.',
                icon: '🔍',
              },
              {
                title: 'Accusation & Reveal',
                desc: 'A dramatic reveal script that ties every thread together for a satisfying conclusion.',
                icon: '⚖️',
              },
              {
                title: 'Themed Menu',
                desc: 'Recipes and cocktail pairings that match your era and setting. From canapés to nightcaps.',
                icon: '🍷',
              },
              {
                title: 'Atmosphere Guide',
                desc: 'Decoration ideas, music suggestions, dress code guidance, and printable table cards.',
                icon: '🕯️',
              },
            ].map((item) => (
              <div key={item.title} className="card hover:border-gold/40 transition-colors">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-display text-xl text-gold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 bg-noir-dark/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-center mb-16">
            Three Steps to <span className="text-blood-light">Murder</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: '01',
                title: 'Choose Your Setting',
                desc: 'Pick a theme, guest count, and difficulty. Want a 1920s speakeasy with 8 guests and devious clues? Done.',
              },
              {
                step: '02',
                title: 'We Build Your Mystery',
                desc: 'Our engine crafts a unique murder mystery with interconnected characters, layered clues, and a twist ending.',
              },
              {
                step: '03',
                title: 'Host & Enjoy',
                desc: 'Print the materials, follow the host guide, serve the food, and watch your friends turn on each other.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="font-display text-5xl text-blood/30">{item.step}</span>
                <h3 className="font-display text-xl text-white mt-2 mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-center mb-12">
            Pick Your <span className="text-gold">Package</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="card text-center">
              <h3 className="font-display text-2xl text-white mb-2">Classic</h3>
              <p className="text-4xl font-display text-gold mb-1">$35</p>
              <p className="text-gray-500 text-sm mb-6">one-time purchase</p>
              <ul className="text-left text-gray-300 text-sm space-y-3 mb-8">
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✓</span> 4–8 guests</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✓</span> Curated theme selection</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✓</span> Full character sheets &amp; clues</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✓</span> Host guide &amp; reveal script</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✓</span> Menu &amp; atmosphere guide</li>
              </ul>
              <a href="/create?tier=classic" className="btn-secondary w-full block">Choose Classic</a>
            </div>
            <div className="card border-gold/50 text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-noir-dark text-xs font-bold px-4 py-1 rounded-full">
                MOST POPULAR
              </div>
              <h3 className="font-display text-2xl text-white mb-2">Grand</h3>
              <p className="text-4xl font-display text-gold mb-1">$49</p>
              <p className="text-gray-500 text-sm mb-6">one-time purchase</p>
              <ul className="text-left text-gray-300 text-sm space-y-3 mb-8">
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✓</span> Up to 12 guests</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✓</span> Any theme — fully custom</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✓</span> Extra clue complexity &amp; red herrings</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✓</span> Everything in Classic</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">✓</span> Printable name badges &amp; props</li>
              </ul>
              <a href="/create?tier=grand" className="btn-primary w-full block">Choose Grand</a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-noir-dark/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl text-center mb-12">
            What Hosts Are Saying
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "My friends are STILL talking about it three weeks later. The character sheets were so detailed that everyone stayed in character the whole night.",
                name: 'Sarah M.',
                detail: '1920s Speakeasy, 8 guests',
              },
              {
                quote: "I've bought mystery boxes before — this was on another level. The clues actually made sense and the reveal was genuinely surprising.",
                name: 'James K.',
                detail: 'Victorian Manor, 6 guests',
              },
              {
                quote: "Hosted this for my partner's birthday. The themed menu alone was worth the price. We're already planning the next one.",
                name: 'Taylor R.',
                detail: 'Hollywood Noir, 10 guests',
              },
            ].map((t) => (
              <div key={t.name} className="card">
                <p className="text-gray-300 text-sm leading-relaxed italic mb-4">\"{t.quote}\"</p>
                <p className="text-gold font-medium text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl mb-6">
            Ready to Host a <span className="text-blood-light">Killer</span> Night?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Your guests will never see it coming.
          </p>
          <a href="/create" className="btn-primary text-lg py-4 px-12">
            Create Your Mystery Now
          </a>
        </div>
      </section>
    </div>
  )
}
