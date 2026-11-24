import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Session } from '@supabase/supabase-js'

import PublicLayout from '@/components/layout/PublicLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import HomePage from '@/pages/public/HomePage'
import AgendarPage from '@/pages/public/AgendarPage'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/admin/DashboardPage'
import ClientesPage from '@/pages/admin/ClientesPage'
import ProfissionaisPage from '@/pages/admin/ProfissionaisPage'
import ServicosPage from '@/pages/admin/ServicosPage'
import AgendamentosPage from '@/pages/admin/AgendamentosPage'
import FinanceiroPage from '@/pages/admin/FinanceiroPage'
import EstoquePage from '@/pages/admin/EstoquePage'
import UsuariosPage from '@/pages/admin/UsuariosPage'
import ConfiguracoesPage from '@/pages/admin/ConfiguracoesPage'

function ProtectedRoute({ children, session }: { children: React.ReactNode; session: Session | null }) {
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/agendar" element={<AgendarPage />} />
        <Route path="/agendar/:slug" element={<AgendarPage />} />
      </Route>

      <Route path="/login" element={
        session ? <Navigate to="/admin/dashboard" replace /> : <LoginPage />
      } />

      <Route path="/admin" element={
        <ProtectedRoute session={session}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="profissionais" element={<ProfissionaisPage />} />
        <Route path="servicos" element={<ServicosPage />} />
        <Route path="agendamentos" element={<AgendamentosPage />} />
        <Route path="financeiro" element={<FinanceiroPage />} />
        <Route path="estoque" element={<EstoquePage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="configuracoes" element={<ConfiguracoesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
