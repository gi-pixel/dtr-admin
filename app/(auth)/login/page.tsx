'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, Lock, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0A]">
      {/* Background image */}
      <Image
        src="/login-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Dark warm overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/70 to-black/90" />

      {/* Ambient orange glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-[#F25623]/5 blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#F25623] font-semibold mb-3">
            Admin Panel
          </p>
          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#F5EBDE]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            DTR{' '}
            <span className="text-[#F25623]">Global</span>
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 shadow-2xl"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#B8A493] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B8A493]" />
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[#F5EBDE] placeholder:text-[#7A6B5D] focus:outline-none focus:border-[#F25623]/60 focus:ring-1 focus:ring-[#F25623]/30 transition-colors disabled:opacity-60"
                  placeholder="you@dtrglobal.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#B8A493] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B8A493]" />
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[#F5EBDE] placeholder:text-[#7A6B5D] focus:outline-none focus:border-[#F25623]/60 focus:ring-1 focus:ring-[#F25623]/30 transition-colors disabled:opacity-60"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full inline-flex items-center justify-center gap-2 bg-[#F25623] text-[#0A0A0A] rounded-xl py-3.5 font-bold tracking-wide hover:bg-[#DA4A1C] transition-all disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-center text-[11px] text-[#7A6B5D] mt-6">
            Authorized personnel only.
          </p>
        </form>

        <p className="text-[10px] text-[#7A6B5D] mt-10 tracking-widest uppercase">
          © {new Date().getFullYear()} DTR Global
        </p>
      </div>
    </div>
  )
}