import { useCallback, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Sparkles, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, loading, error } = useAuth()
  const [email, setEmail] = useState(import.meta.env.DEV ? (import.meta.env.VITE_DEV_EMAIL_GLOW ?? '') : '')
  const [password, setPassword] = useState(import.meta.env.DEV ? (import.meta.env.VITE_DEV_SENHA_GLOW ?? '') : '')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await signIn(email, password)
    if (ok) navigate('/admin/dashboard')
  }, [email, password, signIn, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Glow Beauty</h1>
          <p className="text-muted-foreground text-sm mt-1">Área administrativa</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-5">Entrar na conta</h2>

          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg px-3 py-2.5 text-sm mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Email ou senha incorretos</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Voltar para o site
          </Link>
        </p>
      </div>
    </div>
  )
}
