import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LandingPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-dvh bg-parchment text-on-surface">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 md:px-[40px] h-16 w-full max-w-[800px] mx-auto z-50">
        <div className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">menu_book</span>
          <span>The Library</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/login" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-primary text-surface px-6 py-2 rounded-lg font-label-sm text-label-sm hover:opacity-90 transition-all"
          >
            Join Research
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="w-full max-w-[800px] mx-auto px-4 md:px-[40px] min-h-screen pt-12 pb-24">
        {/* Hero */}
        <section className="flex flex-col items-center text-center space-y-8 py-16 md:py-24">
          <div className="inline-flex items-center gap-4 text-primary">
            <h1 className="font-display-lg text-display-lg">The Library</h1>
            <span className="material-symbols-outlined text-4xl">auto_stories</span>
          </div>
          <p className="font-body-lg text-body-lg italic text-on-surface-variant max-w-lg">
            Your AI-powered study companion. Master anything.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full md:w-auto bg-primary-container text-surface-container-lowest px-10 py-4 rounded-lg font-body-md font-bold transition-all hover:bg-primary shadow-sm"
            >
              Start Studying
            </Link>
            <Link
              href="#features"
              className="w-full md:w-auto border border-primary text-primary px-10 py-4 rounded-lg font-body-md font-bold transition-all hover:bg-primary-fixed/20"
            >
              See how it works
            </Link>
          </div>

          {/* Hero illustration placeholder */}
          <div className="mt-16 w-full aspect-video rounded-xl border border-aged-paper overflow-hidden bg-surface-container-low flex items-center justify-center">
            <div className="text-center space-y-4 p-12">
              <span className="material-symbols-outlined text-primary text-[64px]">local_library</span>
              <p className="font-headline-md text-headline-md text-primary">A sanctuary for the modern scholar.</p>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="bg-surface-container-lowest border border-aged-paper rounded-xl p-8 flex flex-col items-start space-y-4 hover:bg-white transition-colors">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">grid_view</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary">4 Study Modes</h3>
            <p className="font-body-md text-on-surface-variant">
              From active recall flashcards to deep-dive Socratic dialogues. Switch between Peer, Tutor, Examiner, and Feynman modes.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-aged-paper rounded-xl p-8 flex flex-col items-start space-y-4 hover:bg-white transition-colors">
            <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">format_quote</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary">Your Notes, Cited</h3>
            <p className="font-body-md text-on-surface-variant">
              Every AI insight links directly to your source material. Keep your archive rigorous and your memory sharp.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-aged-paper rounded-xl p-8 flex flex-col items-start space-y-4 hover:bg-white transition-colors">
            <div className="w-12 h-12 rounded-full bg-surface-tint/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">local_florist</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary">Daily Garden Streak</h3>
            <p className="font-body-md text-on-surface-variant">
              Watch your digital garden grow as you review concepts. Visual progress through your personal knowledge archive.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="py-20 flex justify-center opacity-30">
          <div className="w-1/2 border-t border-aged-paper"></div>
        </div>

        {/* CTA */}
        <section className="bg-primary p-12 rounded-xl text-center flex flex-col items-center space-y-6">
          <h2 className="font-headline-lg text-headline-lg text-surface-container-lowest">Ready to Curate Your Mind?</h2>
          <p className="font-body-lg text-primary-fixed-dim max-w-md italic">
            Join scholars building their personal archives of knowledge.
          </p>
          <Link
            href="/signup"
            className="bg-secondary-fixed text-on-secondary-fixed px-12 py-3 rounded-lg font-label-sm text-label-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all"
          >
            Create Account
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-parchment border-t border-aged-paper py-12 px-4 md:px-[40px]">
        <div className="max-w-[800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="font-headline-md text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">menu_book</span>
              <span>The Library</span>
            </div>
            <p className="font-body-md text-on-surface-variant italic">A sanctuary for the modern scholar.</p>
          </div>
          <div className="flex gap-12 font-label-sm text-label-sm text-on-surface-variant">
            <a href="#" className="hover:text-primary transition-colors">Manifesto</a>
            <a href="#" className="hover:text-primary transition-colors">Archive</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          </div>
          <div className="text-on-surface-variant font-label-sm text-label-sm">
            © 1892–2025 The Library Project.
          </div>
        </div>
      </footer>
    </div>
  )
}
