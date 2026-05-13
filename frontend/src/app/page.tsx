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
      background: 'linear-gradient(180deg, #FAF6EF 0%, #F5EFE0 40%, #F0E8D4 100%)',
    }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 md:px-[40px] h-16 w-full max-w-[800px] mx-auto z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #033327 0%, #1F4A3D 100%)' }}>
            <span className="material-symbols-outlined text-white text-[18px]">menu_book</span>
          </div>
          <span className="text-[20px] text-primary font-bold tracking-tight"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            The Library
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/login" className="text-[13px] text-[#7A7067] font-semibold hover:text-primary transition-colors"
            style={{ fontFamily: 'Literata, Georgia, serif' }}>
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-all hover:opacity-90"
            style={{
              fontFamily: 'Literata, Georgia, serif',
              background: 'linear-gradient(135deg, #033327 0%, #1F4A3D 100%)',
              boxShadow: '0 2px 8px rgba(3, 51, 39, 0.2)',
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
          <p className="text-[18px] italic text-[#7A7067] max-w-lg"
            style={{ fontFamily: 'Literata, Georgia, serif', lineHeight: 1.6 }}>
            Your AI-powered study companion. Master anything through active recall, guided practice, and daily streaks.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full md:w-auto text-white px-10 py-4 rounded-xl text-[16px] font-bold transition-all hover:opacity-90"
              style={{
                fontFamily: 'Literata, Georgia, serif',
                background: 'linear-gradient(135deg, #033327 0%, #1F4A3D 100%)',
                boxShadow: '0 4px 16px rgba(3, 51, 39, 0.25)',
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
              background: 'linear-gradient(135deg, #F9F3E3 0%, #EDE7D9 100%)',
              border: '1px solid #D4C9A8',
              boxShadow: '0 8px 32px rgba(92, 61, 30, 0.08)',
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
              gradient: 'linear-gradient(135deg, rgba(3,51,39,0.08) 0%, rgba(3,51,39,0.02) 100%)',
            },
            {
              icon: 'format_quote',
              title: 'Your Notes, Cited',
              desc: 'Every AI insight links directly to your source material. Keep your archive rigorous and your memory sharp.',
              gradient: 'linear-gradient(135deg, rgba(123,88,0,0.08) 0%, rgba(123,88,0,0.02) 100%)',
            },
            {
              icon: 'local_florist',
              title: 'Daily Book Streak',
              desc: 'Watch your virtual bookshelf grow as you study daily. Visual progress through your personal knowledge archive.',
              gradient: 'linear-gradient(135deg, rgba(31,74,61,0.08) 0%, rgba(31,74,61,0.02) 100%)',
            },
          ].map((feature) => (
            <div key={feature.title} className="card-hover rounded-2xl p-8 flex flex-col items-start space-y-4"
              style={{
                background: '#FDFBF7',
                border: '1px solid #D4C9A8',
                boxShadow: '0 1px 4px rgba(92, 61, 30, 0.04)',
              }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: feature.gradient }}>
                <span className="material-symbols-outlined text-primary text-[24px]">{feature.icon}</span>
              </div>
              <h3 className="text-[20px] text-primary font-semibold"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                {feature.title}
              </h3>
              <p className="text-[14px] text-[#7A7067] leading-relaxed"
                style={{ fontFamily: 'Literata, Georgia, serif' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </section>

        {/* Divider */}
        <div className="py-20 ornamental-divider">
          <span className="material-symbols-outlined text-[#D4C9A8] text-[16px]">auto_stories</span>
        </div>

        {/* CTA */}
        <section className="p-12 rounded-2xl text-center flex flex-col items-center space-y-6"
          style={{
            background: 'linear-gradient(135deg, #033327 0%, #1F4A3D 100%)',
            boxShadow: '0 8px 32px rgba(3, 51, 39, 0.25)',
          }}>
          <h2 className="text-[28px] text-white font-bold"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Ready to Curate Your Mind?
          </h2>
          <p className="text-[16px] text-[#8CB9A8] max-w-md italic"
            style={{ fontFamily: 'Literata, Georgia, serif' }}>
            Join scholars building their personal archives of knowledge.
          </p>
          <Link
            href="/signup"
            className="bg-[#C8A472] text-[#1A1A1A] px-12 py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-[0.15em] hover:brightness-110 transition-all"
            style={{
              fontFamily: 'Literata, Georgia, serif',
              boxShadow: '0 2px 8px rgba(200, 164, 114, 0.3)',
            }}
          >
            Create Account
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#D4C9A8] py-12 px-4 md:px-[40px]"
        style={{ background: 'linear-gradient(180deg, #F5EFE0 0%, #EDE7D9 100%)' }}>
        <div className="max-w-[800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <span className="font-bold text-[16px]" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                The Library
              </span>
            </div>
            <p className="text-[14px] text-[#7A7067] italic" style={{ fontFamily: 'Literata, Georgia, serif' }}>
              A sanctuary for the modern scholar.
            </p>
          </div>
          <div className="flex gap-12 text-[13px] text-[#7A7067] font-semibold"
            style={{ fontFamily: 'Literata, Georgia, serif' }}>
            <a href="#" className="hover:text-primary transition-colors">Manifesto</a>
            <a href="#" className="hover:text-primary transition-colors">Archive</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          </div>
          <div className="text-[#A09888] text-[12px]" style={{ fontFamily: 'Literata, Georgia, serif' }}>
            &copy; 1892-2025 The Library Project.
          </div>
        </div>
      </footer>
    </div>
  )
}
