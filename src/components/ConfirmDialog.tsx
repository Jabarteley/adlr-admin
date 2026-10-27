import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

type Props = {
  title: string
  description: string
  confirmWord: string
  confirmLabel?: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ title, description, confirmWord, confirmLabel = 'Delete', busy, onConfirm, onCancel }: Props) {
  const [typed, setTyped] = useState('')
  const matches = typed.trim() === confirmWord

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-adlr-danger-light">
          <AlertTriangle size={20} className="text-adlr-danger" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-adlr-text">{title}</h2>
        <p className="mt-2 text-sm text-adlr-muted">{description}</p>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Type <span className="font-mono font-bold text-slate-900">{confirmWord}</span> to confirm
          <input
            autoFocus
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-adlr-danger focus:outline-none"
          />
        </label>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!matches || busy}
            className="rounded-lg bg-adlr-danger px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40"
          >
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
