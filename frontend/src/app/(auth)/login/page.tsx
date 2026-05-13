'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  return (
    <main className="w-full max-w-[440px]">
      <div className="rounded-2xl p-8 md:p-12" style={{
        background: 'linear-gradient(180deg, #F9F3E3 0%, #F0E8D4 100%)',
        border: '1px solid #C8B88A',
        boxShadow: '0 8px 40px rgba(92, 61, 30, 0.1), 0 2px 8px rgba(92, 61, 30, 0.05)',
      }}>
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #033327 0%, #1F4A3D 100%)' }}>
            <span className="material-symbols-outlined text-white text-[28px]">menu_book</span>
          </div>
          <h1 className="text-[28px] text-primary tracking-tight font-bold"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            The Library
          </h1>
          <p className="text-[12px] text-[#7A7067] mt-2 tracking-[0.15em] uppercase font-semibold"
            style={{ fontFamily: 'Literata, Georgia, serif' }}>
            Private Archive &amp; Reading Room
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="flex flex-col">
            <label className="text-[12px] text-[#7A7067] mb-1.5 font-semibold tracking-wide"
              style={{ fontFamily: 'Literata, Georgia, serif' }} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="scholar@library.edu"
              required
              className="ledger-input font-body-md text-body-md"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[12px] text-[#7A7067] font-semibold tracking-wide"
                style={{ fontFamily: 'Literata, Georgia, serif' }} htmlFor="password">
                Password
              </label>
              <a href="#" className="text-[12px] text-secondary font-semibold hover:underline"
                style={{ fontFamily: 'Literata, Georgia, serif' }}>
                Forgot?
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="ledger-input font-body-md text-body-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white text-[14px] font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90"
            style={{
              fontFamily: 'Literata, Georgia, serif',
              background: 'linear-gradient(135deg, #033327 0%, #1F4A3D 100%)',
              boxShadow: '0 4px 12px rgba(3, 51, 39, 0.2)',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in to Archive'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#D4C9A8]"></div>
          </div>
          <div className="relative px-4 text-[#7A7067] text-[13px] italic"
            style={{ fontFamily: 'Literata, Georgia, serif', background: 'linear-gradient(180deg, #F5F0E4 0%, #F0E8D4 100%)' }}>
            or
          </div>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full bg-white border border-[#D4C9A8] text-on-surface text-[14px] font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-3 hover:bg-[#F9F5EC] hover:border-primary"
          style={{
            fontFamily: 'Literata, Georgia, serif',
            boxShadow: '0 1px 4px rgba(92, 61, 30, 0.04)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
            <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
            <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
            <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-[14px] text-[#7A7067]" style={{ fontFamily: 'Literata, Georgia, serif' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-secondary font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* System footer */}
      <div className="mt-8 flex justify-between items-center px-4">
        <div className="flex gap-4">
          <a href="#" className="text-[12px] text-[#A09888] hover:text-primary transition-colors"
            style={{ fontFamily: 'Literata, Georgia, serif' }}>Privacy</a>
          <a href="#" className="text-[12px] text-[#A09888] hover:text-primary transition-colors"
            style={{ fontFamily: 'Literata, Georgia, serif' }}>Terms</a>
        </div>
        <div className="flex items-center text-[#A09888] gap-1.5">
          <span className="material-symbols-outlined text-[14px]">menu_book</span>
          <span className="text-[11px]" style={{ fontFamily: 'Literata, Georgia, serif' }}>Established 1894</span>
        </div>
      </div>
    </main>
  )
}
