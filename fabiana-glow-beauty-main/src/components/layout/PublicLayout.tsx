import { Outlet, Link } from 'react-router-dom'
import { Phone, Instagram, MapPin, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useConfiguracoes } from '@/hooks/useConfiguracoes'

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: config } = useConfiguracoes()

  const navLinks = [
    { href: '/#servicos', label: 'Serviços' },
    { href: '/#sobre', label: 'Sobre' },
    { href: '/#contato', label: 'Contato' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-rose-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary overflow-hidden flex items-center justify-center">
              <img src="/icons/favicon.ico" alt="Glow Beauty" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif font-semibold text-lg text-foreground">
              Glow Beauty
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/agendar"
              className="bg-primary text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-primary/90 transition-colors"
            >
              Agendar Agora
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        <div className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          menuOpen ? 'max-h-64' : 'max-h-0'
        )}>
          <nav className="px-4 pb-4 flex flex-col gap-3 border-t border-rose-100 pt-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-1"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/agendar"
              className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors text-center mt-1"
              onClick={() => setMenuOpen(false)}
            >
              Agendar Agora
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/icons/favicon.ico" alt="Glow Beauty" className="w-5 h-5 object-contain" />
                <span className="font-serif text-lg font-semibold">{config?.nome_clinica ?? 'Glow Beauty'}</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                {config?.sobre ?? 'Sua clínica de estética premium. Cuidamos de você com carinho e profissionalismo.'}
              </p>
            </div>
            <div>
              <p className="font-semibold mb-3 text-rose-200">Contato</p>
              <div className="flex flex-col gap-2 text-sm text-white/70">
                {(config?.telefone ?? config?.whatsapp) && (
                  <a href={`tel:${(config?.telefone ?? config?.whatsapp ?? '').replace(/\D/g, '')}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone className="w-4 h-4" /> {config?.telefone ?? config?.whatsapp}
                  </a>
                )}
                {config?.instagram && (
                  <a href={`https://instagram.com/${config.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Instagram className="w-4 h-4" /> {config.instagram.startsWith('@') ? config.instagram : `@${config.instagram}`}
                  </a>
                )}
                {config?.cidade && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" /> {config.cidade}
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="font-semibold mb-3 text-rose-200">Horários</p>
              <div className="text-sm text-white/70 space-y-1">
                {config?.horario_funcionamento
                  ? config.horario_funcionamento.split('\n').map((linha, i) => (
                      <p key={i}>{linha}</p>
                    ))
                  : <p className="text-white/40">—</p>
                }
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
            <p>© 2026 {config?.nome_clinica ?? 'Glow Beauty'}. Todos os direitos reservados.</p>
            <Link to="/login" className="hover:text-white/60 transition-colors">Área Administrativa</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
