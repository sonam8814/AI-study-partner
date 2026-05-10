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
      <div className="bg-elevated-panels border border-aged-paper rounded-lg p-8 md:p-12">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">The Library</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-2 tracking-wide uppercase">
            Private Archive &amp; Reading Room
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col">
            <label className="font-label-sm text-label-sm text-on-surface-variant mb-1" htmlFor="email">
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
            <div className="flex justify-between items-center mb-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="password">
                Password
              </label>
              <a href="#" className="font-label-sm text-label-sm text-secondary hover:underline">
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
            className="w-full bg-forest-green text-white font-label-sm text-label-sm py-4 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in to Archive'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-aged-paper"></div>
          </div>
          <div className="relative px-4 bg-elevated-panels text-on-surface-variant font-label-sm text-label-sm italic">
            or
          </div>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full bg-white border border-forest-green text-forest-green font-label-sm text-label-sm py-4 rounded-lg hover:bg-surface-container-low active:scale-[0.98] transition-all flex items-center justify-center gap-3"
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
          <p className="font-body-md text-body-md text-on-surface-variant">
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
          <a href="#" className="font-label-sm text-label-sm text-outline hover:text-ink transition-colors">Privacy</a>
          <a href="#" className="font-label-sm text-label-sm text-outline hover:text-ink transition-colors">Terms</a>
        </div>
        <div className="flex items-center text-outline gap-1">
          <span className="material-symbols-outlined text-[16px]">menu_book</span>
          <span className="font-label-sm text-label-sm">Established 1894</span>
        </div>
      </div>
    </main>
  )
}
