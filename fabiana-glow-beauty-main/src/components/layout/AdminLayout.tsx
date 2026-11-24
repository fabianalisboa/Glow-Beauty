import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import {
  LayoutDashboard, Users, Scissors, Calendar, DollarSign,
  Package, UserCog, Sparkles, Menu, LogOut, ChevronRight, Settings
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'
import NotificacaoBell from '@/components/shared/NotificacaoBell'
import SeletorUnidade from '@/components/layout/SeletorUnidade'

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/agendamentos', icon: Calendar, label: 'Agendamentos' },
  { to: '/admin/clientes', icon: Users, label: 'Clientes' },
  { to: '/admin/profissionais', icon: UserCog, label: 'Profissionais' },
  { to: '/admin/servicos', icon: Scissors, label: 'Serviços' },
  { to: '/admin/financeiro', icon: DollarSign, label: 'Financeiro' },
  { to: '/admin/estoque', icon: Package, label: 'Estoque' },
  { to: '/admin/usuarios', icon: Users, label: 'Usuários' },
  { to: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }, [navigate])

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white/20">
          <img src="/icons/favicon.ico" alt="Glow Beauty" className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="font-serif text-white text-sm font-semibold leading-tight">Glow Beauty</p>
          <p className="text-white/50 text-xs">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-white/20 text-white'
                : 'text-white/65 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/65 hover:bg-white/10 hover:text-white transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-56 flex-shrink-0 bg-gradient-to-b from-[#a0536a] to-[#7a3a50] flex-col">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 w-64 h-full bg-gradient-to-b from-[#a0536a] to-[#7a3a50] flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 flex-shrink-0">
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
          </div>
          <SeletorUnidade />
          <div className="flex items-center gap-2">
            <NotificacaoBell />
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
