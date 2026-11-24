import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

const CONFIGS: Record<string, { label: string; classes: string }> = {
  ativo: { label: 'Ativo', classes: 'bg-green-100 text-green-700' },
  inativo: { label: 'Inativo', classes: 'bg-gray-100 text-gray-600' },
  pendente: { label: 'Pendente', classes: 'bg-amber-100 text-amber-700' },
  confirmado: { label: 'Confirmado', classes: 'bg-blue-100 text-blue-700' },
  concluido: { label: 'Concluído', classes: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', classes: 'bg-red-100 text-red-700' },
  pago: { label: 'Pago', classes: 'bg-green-100 text-green-700' },
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = CONFIGS[status] ?? { label: status, classes: 'bg-gray-100 text-gray-600' }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', config.classes, className)}>
      {config.label}
    </span>
  )
}
