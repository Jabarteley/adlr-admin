import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users as UsersIcon, ChevronRight, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { ConfirmDialog } from '../components/ConfirmDialog'

type UserRow = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  role: string | null
  account_mode: string | null
  account_status: string | null
  is_admin: boolean
  created_at: string
}

const PAGE_SIZE = 20

function statusBadge(status: string | null) {
  if (status === 'pending_deletion') return <Badge variant="warning">Pending deletion</Badge>
  if (status === 'deleted') return <Badge variant="danger">Deleted</Badge>
  return <Badge variant="success">Active</Badge>
}

export function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  function load() {
    setLoading(true)
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
    if (search) params.set('search', search)

    api
      .get<{ data: UserRow[]; pagination: { count: number } }>(`/admin/users?${params}`)
      .then((res) => {
        setUsers(res.data)
        setCount(res.pagination.count)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [offset, search])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/admin/users/${deleteTarget.id}`)
      setDeleteTarget(null)
      load()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Users" subtitle={`${count} total`} />

      <div className="relative max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => {
            setOffset(0)
            setSearch(e.target.value)
          }}
          className="w-full rounded-lg border border-adlr-border bg-white py-2 pl-9 pr-3 text-sm focus:border-adlr-purple focus:outline-none focus:ring-2 focus:ring-adlr-purple-light"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-adlr-border bg-white shadow-sm shadow-slate-100/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-adlr-border bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => {
              const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || '(no name)'
              return (
                <tr key={u.id} className="group hover:bg-slate-50/80">
                  <td className="px-5 py-3">
                    <Link to={`/users/${u.id}`} className="flex items-center gap-3">
                      <Avatar name={name} size="sm" />
                      <div>
                        <p className="font-medium text-slate-900 group-hover:text-adlr-purple-deep">
                          {name}
                          {u.is_admin && (
                            <span className="ml-2 align-middle">
                              <Badge variant="purple">Admin</Badge>
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600 capitalize">{(u.role || '—').replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3">{statusBadge(u.account_status)}</td>
                  <td className="px-5 py-3 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => setDeleteTarget(u)}
                        title="Delete user"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-adlr-danger-light hover:text-adlr-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                      <Link
                        to={`/users/${u.id}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!loading && users.length === 0 && (
          <EmptyState icon={UsersIcon} title="No users found" subtitle="Try a different search." />
        )}
      </div>

      {count > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-sm text-adlr-muted">
          <span>
            {count === 0 ? 0 : offset + 1}–{Math.min(offset + PAGE_SIZE, count)} of {count}
          </span>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              className="rounded-lg border border-adlr-border px-3 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={offset + PAGE_SIZE >= count}
              onClick={() => setOffset(offset + PAGE_SIZE)}
              className="rounded-lg border border-adlr-border px-3 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this user?"
          description="This permanently deletes the account, every network they own (and all its data), and removes their memberships elsewhere. This cannot be undone."
          confirmWord={deleteTarget.email || 'delete'}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
