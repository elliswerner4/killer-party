import { JoinCodeCard } from '@/components/JoinCodeCard'

export const metadata = { title: 'Join a game | Killer Party' }

export default function JoinPage() {
  return (
    <div className="px-4 sm:px-6 py-16 md:py-24">
      <div className="max-w-sm mx-auto">
        <JoinCodeCard autoFocus headingLevel="h1" />
        <div className="mt-10 space-y-3 text-sm text-gray-400 leading-relaxed">
          <p>
            The code is in the invitation or message from your host and looks like <span className="text-parchment font-semibold tracking-wider">KNIFE-742</span>.
            After you join, you pick your character and get your secrets and clues on this phone.
          </p>
          <p>
            No code? Ask your host, or <a href="/create" className="text-parchment underline underline-offset-4">create your own mystery</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
