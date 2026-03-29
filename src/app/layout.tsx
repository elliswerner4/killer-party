import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Killer Party \u2014 Custom Murder Mystery Dinner Parties',
  description: 'Generate a completely unique murder mystery dinner party in minutes. Custom characters, clues, host guide, menu, and more.',
  openGraph: {
    title: 'Killer Party \u2014 Custom Murder Mystery Dinner Parties',
    description: 'Generate a completely unique murder mystery dinner party in minutes.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-body antialiased">
        <nav className="border-b border-gray-800 bg-noir-dark/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-display text-2xl text-gold tracking-wide">
              Killer Party
            </a>
            <a href="/create" className="btn-primary text-sm py-2 px-6">
              Create Your Mystery
            </a>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-gray-800 mt-24 py-12 text-center text-gray-500 text-sm">
          <div className="max-w-6xl mx-auto px-6">
            <p className="font-display text-gold text-lg mb-2">Killer Party</p>
            <p>&copy; {new Date().getFullYear()} Killer Party. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
