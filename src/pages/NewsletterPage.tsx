import { useEffect, useState } from 'react'
import { Search, Mail, Send, History } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { Badge } from '../components/Badge'
import { ConfirmDialog } from '../components/ConfirmDialog'

type Subscriber = {
  id: string
  email: string
  name: string | null
  source: 'waitlist' | 'app_signup'
  subscribed_at: string
  unsubscribed_at: string | null
}

type Campaign = {
  id: string
  subject: string
  recipient_count: number
  sent_at: string
}

const PAGE_SIZE = 20

function sourceBadge(source: Subscriber['source']) {
  if (source === 'app_signup') return <Badge variant="success">App signup</Badge>
  return <Badge variant="purple">Waitlist</Badge>
}

export function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)

  function loadSubscribers() {
    setLoading(true)
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
    if (search) params.set('search', search)

    api
      .get<{ data: Subscriber[]; pagination: { count: number } }>(`/admin/newsletter/subscribers?${params}`)
      .then((res) => {
        setSubscribers(res.data)
        setCount(res.pagination.count)
      })
      .finally(() => setLoading(false))
  }

  function loadCampaigns() {
    api
      .get<{ data: Campaign[] }>('/admin/newsletter/campaigns?limit=10&offset=0')
      .then((res) => setCampaigns(res.data))
  }

  useEffect(loadSubscribers, [offset, search])
  useEffect(loadCampaigns, [])

  const activeCount = subscribers.filter((s) => !s.unsubscribed_at).length

  async function handleSend() {
    setSending(true)
    setSendError(null)
    try {
      const res = await api.post<{ message: string }>('/admin/newsletter/send', {
        subject,
        html: `<p>${body.replace(/\n/g, '</p><p>')}</p>`
      })
      setSendSuccess(res.message)
      setSubject('')
      setBody('')
      setShowConfirm(false)
      loadCampaigns()
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : 'Failed to send newsletter.')
      setShowConfirm(false)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <PageHeader title="Newsletter" subtitle={`${count} subscribers (waitlist + app signups)`} />

      <div className="rounded-2xl border border-adlr-border bg-white p-6 shadow-sm shadow-slate-100/50">
        <h2 className="flex items-center gap-2 text-sm font-bold text-adlr-text">
          <Send size={16} className="text-adlr-purple-deep" /> Compose newsletter
        </h2>
        <p className="mt-1 text-xs text-adlr-muted">
          Sends to every subscriber who hasn&apos;t unsubscribed. Plain paragraphs — wrap in your own HTML if you need more.
        </p>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="Subject line"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-adlr-border bg-white px-3 py-2 text-sm focus:border-adlr-purple focus:outline-none focus:ring-2 focus:ring-adlr-purple-light"
          />
          <textarea
            placeholder="Write your update here…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-adlr-border bg-white px-3 py-2 text-sm focus:border-adlr-purple focus:outline-none focus:ring-2 focus:ring-adlr-purple-light"
          />
        </div>

        {sendError && <p className="mt-3 text-sm text-adlr-danger">{sendError}</p>}
        {sendSuccess && <p className="mt-3 text-sm text-emerald-600">{sendSuccess}</p>}

        <div className="mt-4 flex justify-end">
          <button
            disabled={!subject.trim() || !body.trim()}
            onClick={() => setShowConfirm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-adlr-purple-deep px-4 py-2 text-sm font-semibold text-white hover:bg-adlr-purple disabled:opacity-40"
          >
            <Send size={14} /> Send to subscribers
          </button>
        </div>
      </div>

      {campaigns.length > 0 && (
        <div className="mt-6">
          <h2 className="flex items-center gap-2 text-sm font-bold text-adlr-text">
            <History size={16} className="text-adlr-muted" /> Past campaigns
          </h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-adlr-border bg-white shadow-sm shadow-slate-100/50">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-adlr-border bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Recipients</th>
                  <th className="px-5 py-3">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-medium text-slate-900">{c.subject}</td>
                    <td className="px-5 py-3 text-slate-600">{c.recipient_count}</td>
                    <td className="px-5 py-3 text-slate-400">{new Date(c.sent_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-sm font-bold text-adlr-text">Subscribers</h2>
        <div className="relative mt-3 max-w-sm">
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
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3 font-medium text-slate-900">{s.name || '(no name)'}</td>
                  <td className="px-5 py-3 text-slate-600">{s.email}</td>
                  <td className="px-5 py-3">{sourceBadge(s.source)}</td>
                  <td className="px-5 py-3 text-slate-400">{new Date(s.subscribed_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    {s.unsubscribed_at ? <Badge variant="danger">Unsubscribed</Badge> : <Badge variant="success">Subscribed</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && subscribers.length === 0 && (
            <EmptyState icon={Mail} title="No subscribers found" subtitle="Try a different search." />
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
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Send this newsletter?"
          description={`This emails every active subscriber (${activeCount} on this page; the backend sends to all of them, not just this page) right now and can't be undone.`}
          confirmWord="SEND"
          confirmLabel="Send now"
          busy={sending}
          onConfirm={handleSend}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
