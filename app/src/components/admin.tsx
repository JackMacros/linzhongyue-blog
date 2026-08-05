import { type ReactNode } from 'react'
import { X } from 'lucide-react'

/** Card container for admin pages. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/[0.07] bg-white/[0.02] ${className}`}>{children}</div>
  )
}

/** Status pill. */
export function Badge({ tone, children }: { tone: 'teal' | 'gray' | 'red' | 'violet' | 'amber'; children: ReactNode }) {
  const map = {
    teal: 'border-teal-400/40 bg-teal-400/10 text-teal-300',
    gray: 'border-white/15 bg-white/[0.04] text-white/50',
    red: 'border-red-400/40 bg-red-400/10 text-red-300',
    violet: 'border-violet-400/40 bg-violet-400/10 text-violet-300',
    amber: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] ${map[tone]}`}>
      {children}
    </span>
  )
}

/** Simple dark modal. */
export function Modal({
  open, title, onClose, children, footer, className = '',
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-lg rounded-xl border border-white/10 bg-[#12121c] shadow-2xl ${className}`}>
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
          <h3 className="font-display text-base font-medium">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-white/50 hover:bg-white/[0.06] hover:text-white">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-white/[0.07] px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

/** Buttons */
export function Btn({
  children, onClick, variant = 'ghost', className = '',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'danger'
  className?: string
}) {
  const map = {
    primary: 'bg-teal-400 text-[#08080e] hover:bg-teal-300 font-medium',
    ghost: 'border border-white/12 text-white/70 hover:border-white/30 hover:text-white',
    danger: 'border border-red-400/30 text-red-300 hover:bg-red-400/10',
  }
  return (
    <button onClick={onClick} className={`rounded-lg px-4 py-2 text-sm transition-colors ${map[variant]} ${className}`}>
      {children}
    </button>
  )
}

/** Form field */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-white/50">{label}</span>
      {children}
    </label>
  )
}

export const inputCls =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-teal-400/50'

/** Table shell */
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.07] text-left">
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-white/40">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

/** Pagination footer */
export function Pagination({ total, page, pageSize, onPage }: { total: number; page: number; pageSize: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3.5 text-xs text-white/45">
      <span>共 {total} 条</span>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`h-7 w-7 rounded-md text-xs transition-colors ${
              p === page ? 'bg-teal-400 text-[#08080e]' : 'text-white/55 hover:bg-white/[0.06]'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
