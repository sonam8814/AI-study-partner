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
    <div className="min-h-dvh text-on-surface" style={{
      background: `linear-gradient(180deg, var(--color-landing-start) 0%, var(--color-landing-mid) 40%, var(--color-landing-end) 100%)`,
    }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 md:px-[40px] h-16 w-full max-w-[800px] mx-auto z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)` }}>
            <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--color-on-primary)' }}>menu_book</span>
          </div>
          <span className="text-[20px] text-primary font-bold tracking-tight"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            The Library
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/login" className="text-[13px] font-semibold hover:text-primary transition-colors"
            style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}>
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-all hover:opacity-90"
            style={{
              fontFamily: 'Literata, Georgia, serif',
              background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)`,
              boxShadow: 'var(--shadow-primary)',
            }}
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
            <h1 className="text-[48px] md:text-[56px] font-bold tracking-tight"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              The Library
            </h1>
            <span className="material-symbols-outlined text-4xl opacity-60">auto_stories</span>
          </div>
          <p className="text-[18px] italic max-w-lg"
            style={{ fontFamily: 'Literata, Georgia, serif', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
            Your AI-powered study companion. Master anything through active recall, guided practice, and daily streaks.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full md:w-auto text-white px-10 py-4 rounded-xl text-[16px] font-bold transition-all hover:opacity-90"
              style={{
                fontFamily: 'Literata, Georgia, serif',
                background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)`,
                boxShadow: 'var(--shadow-primary-lg)',
              }}
            >
              Start Studying
            </Link>
            <Link
              href="#features"
              className="w-full md:w-auto border-2 border-primary text-primary px-10 py-4 rounded-xl text-[16px] font-bold transition-all hover:bg-primary hover:text-white"
              style={{ fontFamily: 'Literata, Georgia, serif' }}
            >
              See how it works
            </Link>
          </div>

          {/* Hero illustration */}
          <div className="mt-16 w-full aspect-video rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, var(--color-parchment-start) 0%, var(--color-hover-bg) 100%)`,
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
            }}>
            <div className="text-center space-y-4 p-12">
              <span className="material-symbols-outlined text-primary text-[64px] opacity-40">local_library</span>
              <p className="text-[22px] text-primary font-semibold"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                A sanctuary for the modern scholar.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-12">
          {[
            {
              icon: 'grid_view',
              title: '4 Study Modes',
              desc: 'From active recall flashcards to deep-dive Socratic dialogues. Switch between Peer, Tutor, Examiner, and Feynman modes.',
              gradient: `linear-gradient(135deg, var(--feature-green) 0%, var(--feature-green-end) 100%)`,
            },
            {
              icon: 'format_quote',
              title: 'Your Notes, Cited',
              desc: 'Every AI insight links directly to your source material. Keep your archive rigorous and your memory sharp.',
              gradient: `linear-gradient(135deg, var(--feature-gold) 0%, var(--feature-gold-end) 100%)`,
            },
            {
              icon: 'local_florist',
              title: 'Daily Book Streak',
              desc: 'Watch your virtual bookshelf grow as you study daily. Visual progress through your personal knowledge archive.',
              gradient: `linear-gradient(135deg, var(--feature-teal) 0%, var(--feature-teal-end) 100%)`,
            },
          ].map((feature) => (
            <div key={feature.title} className="card-hover rounded-2xl p-8 flex flex-col items-start space-y-4"
              style={{
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
              }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: feature.gradient }}>
                <span className="material-symbols-outlined text-primary text-[24px]">{feature.icon}</span>
              </div>
              <h3 className="text-[20px] text-primary font-semibold"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                {feature.title}
              </h3>
              <p className="text-[14px] leading-relaxed"
                style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </section>

        {/* Divider */}
        <div className="py-20 ornamental-divider">
          <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--color-aged-paper)' }}>auto_stories</span>
        </div>

        {/* CTA */}
        <section className="p-12 rounded-2xl text-center flex flex-col items-center space-y-6"
          style={{
            background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)`,
            boxShadow: 'var(--shadow-primary-lg)',
          }}>
          <h2 className="text-[28px] text-white font-bold"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Ready to Curate Your Mind?
          </h2>
          <p className="text-[16px] max-w-md italic"
            style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-on-primary-container)' }}>
            Join scholars building their personal archives of knowledge.
          </p>
          <Link
            href="/signup"
            className="px-12 py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-[0.15em] hover:brightness-110 transition-all"
            style={{
              fontFamily: 'Literata, Georgia, serif',
              background: 'var(--color-gilt)',
              color: 'var(--color-on-surface)',
              boxShadow: 'var(--shadow-gilt)',
            }}
          >
            Create Account
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-4 md:px-[40px]"
        style={{
          borderTop: '1px solid var(--color-border)',
          background: `linear-gradient(180deg, var(--color-footer-start) 0%, var(--color-footer-end) 100%)`,
        }}>
        <div className="max-w-[800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <span className="font-bold text-[16px]" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                The Library
              </span>
            </div>
            <p className="text-[14px] italic" style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}>
              A sanctuary for the modern scholar.
            </p>
          </div>
          <div className="flex gap-12 text-[13px] font-semibold"
            style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-muted)' }}>
            <a href="#" className="hover:text-primary transition-colors">Manifesto</a>
            <a href="#" className="hover:text-primary transition-colors">Archive</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          </div>
          <div className="text-[12px]" style={{ fontFamily: 'Literata, Georgia, serif', color: 'var(--color-text-faint)' }}>
            &copy; 1892-2025 The Library Project.
          </div>
        </div>
      </footer>
    </div>
  )
}
