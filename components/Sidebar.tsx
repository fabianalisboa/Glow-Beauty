import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Briefcase,
  CalendarDays,
  DollarSign,
  Package,
  Settings,
  BarChart3,
  Clock3,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-72 bg-pink-700 text-white min-h-screen p-6">
      <h2 className="text-3xl font-bold mb-2">Glow Beauty</h2>

      <p className="text-pink-200 mb-8">Gestão Inteligente</p>

      <nav className="flex flex-col gap-5">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 hover:text-pink-200"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          href="/admin/clientes"
          className="flex items-center gap-3 hover:text-pink-200"
        >
          <Users size={20} />
          Clientes
        </Link>

        <Link
          href="/admin/profissionais"
          className="flex items-center gap-3 hover:text-pink-200"
        >
          <UserCog size={20} />
          Profissionais
        </Link>

        <Link
          href="/admin/usuarios"
          className="flex items-center gap-3 hover:text-pink-200"
        >
          <Users size={20} />
          Usuários
        </Link>

        <Link
          href="/admin/servicos"
          className="flex items-center gap-3 hover:text-pink-200"
        >
          <Briefcase size={20} />
          Serviços
        </Link>

        <Link
          href="/admin/agendamentos"
          className="flex items-center gap-3 hover:text-pink-200"
        >
          <CalendarDays size={20} />
          Agendamentos
        </Link>

        <Link
          href="/admin/agenda"
          className="flex items-center gap-3 hover:text-pink-200"
        >
          <Clock3 size={20} />
          Agenda do Dia
        </Link>
        <Link
          href="/admin/financeiro"
          className="flex items-center gap-3 hover:text-pink-200"
        >
          <DollarSign size={20} />
          Financeiro
        </Link>

        <Link
          href="/admin/estoque"
          className="flex items-center gap-3 hover:text-pink-200"
        >
          <Package size={20} />
          Estoque
        </Link>

        <Link
          href="/admin/relatorios"
          className="flex items-center gap-3 hover:text-pink-200"
        >
          <BarChart3 size={20} />
          Relatórios
        </Link>

        <Link
          href="/admin/configuracoes"
          className="flex items-center gap-3 hover:text-pink-200"
        >
          <Settings size={20} />
          Configurações
        </Link>
      </nav>
    </aside>
  );
}
