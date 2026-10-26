import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorker'

// Self-hosted so builds never depend on reaching Google Fonts (OFL licensed, see src/fonts/LICENSE.txt)
const fell = localFont({
  src: [
    { path: '../fonts/im-fell-english-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/im-fell-english-latin-400-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-fell',
  display: 'swap',
})
const publicSans = localFont({
  src: '../fonts/public-sans-latin-wght-normal.woff2',
  weight: '100 900',
  variable: '--font-public',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Killer Party: murder mystery dinner parties, written for your group',
  description:
    'A one-off murder mystery for your dinner party: characters for every guest, clues, a host script and the final reveal. Guests join on their phones with a code.',
  openGraph: {
    title: 'Killer Party',
    description: 'A murder mystery dinner party, written for your group.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fell.variable} ${publicSans.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#12302A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen font-body antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] btn-primary">
          Skip to content
        </a>
        <nav className="no-print border-b border-parchment/10 bg-noir/90 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            <a href="/" className="font-display text-2xl text-parchment shrink-0">
              Killer Party
            </a>
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="/join"
                className="inline-flex items-center gap-2 rounded-md border border-gold/60 px-3 sm:px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/10 transition-colors"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M2 4.5h12v7H2z" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M4.5 8h3M10 8h1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span>Join a game</span>
              </a>
              <a href="/create" className="btn-primary text-sm py-2 px-3 sm:px-4">
                <span className="sm:hidden">Host</span>
                <span className="hidden sm:inline">Create a mystery</span>
              </a>
            </div>
          </div>
        </nav>
        <ServiceWorkerRegistration />
        <Analytics />
        <main id="main">{children}</main>
        <footer className="no-print border-t border-parchment/10 mt-24 py-12 text-sm text-gray-500">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
            <p className="font-display text-xl text-parchment">Killer Party</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li><a href="/join" className="hover:text-parchment">Join a game</a></li>
              <li><a href="/create" className="hover:text-parchment">Create a mystery</a></li>
              <li><a href="/support" className="hover:text-parchment">Customer support</a></li>
            </ul>
            <p>&copy; {new Date().getFullYear()} Killer Party</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
