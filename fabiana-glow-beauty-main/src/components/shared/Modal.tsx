import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative bg-white w-full sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col',
        size === 'sm' && 'sm:max-w-sm',
        size === 'md' && 'sm:max-w-lg',
        size === 'lg' && 'sm:max-w-2xl',
        'rounded-t-2xl sm:rounded-2xl'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
