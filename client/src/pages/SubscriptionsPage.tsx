import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { Search, Plus, CreditCard, AlertTriangle, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { useData } from '../context/DataContext'
import { getSubscriptionStatus, getDaysRemaining } from '../utils/subscription'
import MemberAvatar from '../components/ui/MemberAvatar'
import StatusBadge from '../components/ui/StatusBadge'
import type { Member, Plan, Subscription } from '../types'
import type { SubscriptionStatus } from '../types'

type FilterTab = 'all' | SubscriptionStatus

interface SubRow {
  subscription: Subscription & { plan: Plan }
  member: Member
  status: SubscriptionStatus
  daysRemaining: number
}

const PAYMENT_BADGE: Record<string, string> = {
  paid:    'bg-emerald-500/15 text-emerald-400',
  unpaid:  'bg-red-500/15 text-red-400',
  partial: 'bg-amber-500/15 text-amber-400',
}

function fmt(d: string) { return format(new Date(d), 'MMM d, yyyy') }

export default function SubscriptionsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { members, subscriptions } = useData()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')

  const allRows = useMemo<SubRow[]>(() => {
    return subscriptions
      .map((sub) => {
        const member = members.find((m) => m.id === sub.memberId)
        if (!member) return null
        const status = getSubscriptionStatus(sub.endDate)
        const daysRemaining = getDaysRemaining(sub.endDate)
        return { subscription: sub, member, status, daysRemaining }
      })
      .filter((r): r is SubRow => r !== null)
      .sort((a, b) => new Date(b.subscription.startDate).getTime() - new Date(a.subscription.startDate).getTime())
  }, [members, subscriptions])

  const filtered = useMemo(() => {
    let rows = allRows
    if (filter !== 'all') rows = rows.filter((r) => r.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.member.name.toLowerCase().includes(q) ||
          r.member.phone.includes(q) ||
          r.subscription.plan.name.toLowerCase().includes(q)
      )
    }
    return rows
  }, [allRows, filter, search])

  const counts = useMemo(() => ({
    active:        allRows.filter((r) => r.status === 'active').length,
    expiring_soon: allRows.filter((r) => r.status === 'expiring_soon').length,
    expired:       allRows.filter((r) => r.status === 'expired').length,
  }), [allRows])

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all',           label: t('common.all'),            count: allRows.length },
    { key: 'active',        label: t('common.active'),         count: counts.active },
    { key: 'expiring_soon', label: t('common.expiringSoon'),   count: counts.expiring_soon },
    { key: 'expired',       label: t('common.expired'),        count: counts.expired },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('subscriptions.title')}</h1>
        <Link
          to="/subscriptions/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('subscription.newSubscription')}</span>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill
          icon={<CheckCircle className="w-4 h-4 text-emerald-400" />}
          label={t('subscriptions.active')}
          value={counts.active}
          color="text-emerald-400"
        />
        <StatPill
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          label={t('subscriptions.expiringSoon')}
          value={counts.expiring_soon}
          color="text-amber-400"
        />
        <StatPill
          icon={<XCircle className="w-4 h-4 text-red-400" />}
          label={t('subscriptions.expired')}
          value={counts.expired}
          color="text-red-400"
        />
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('members.search')}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg ps-9 pe-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
          />
        </div>
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                filter === tab.key ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white',
              ].join(' ')}
            >
              {tab.label}
              <span className={`text-xs ${filter === tab.key ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-zinc-500">{filtered.length} {t('subscriptions.title').toLowerCase()}</p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <CreditCard className="w-8 h-8 text-zinc-700" />
          <p className="text-sm text-zinc-500">{t('subscriptions.noSubscriptions')}</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="divide-y divide-zinc-800">
            {filtered.map((row) => (
              <SubRow key={row.subscription.id} row={row} onNavigate={navigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */

function StatPill({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className={`text-lg font-bold ${color}`}>{value}</p>
        <p className="text-xs text-zinc-500 truncate">{label}</p>
      </div>
    </div>
  )
}

function SubRow({ row, onNavigate }: {
  row: SubRow
  onNavigate: (path: string) => void
}) {
  const { t } = useTranslation()
  const { subscription: sub, member, status, daysRemaining } = row
  const canRenew = status === 'expired' || status === 'expiring_soon'

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/40 transition-colors">
      {/* Member */}
      <button
        onClick={() => onNavigate(`/members/${member.id}`)}
        className="flex items-center gap-3 flex-1 min-w-0 text-start group"
      >
        <MemberAvatar name={member.name} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
            {member.name}
          </p>
          <p className="text-xs text-zinc-500">{member.phone}</p>
        </div>
      </button>

      {/* Plan */}
      <div className="hidden sm:block w-28 shrink-0">
        <p className="text-sm text-white">{sub.plan.name}</p>
        <p className="text-xs text-zinc-500">{sub.paidAmount} JD</p>
      </div>

      {/* Dates */}
      <div className="hidden md:block w-44 shrink-0">
        <p className="text-xs text-zinc-400">{fmt(sub.startDate)}</p>
        <p className="text-xs text-zinc-500">→ {fmt(sub.endDate)}</p>
      </div>

      {/* Status + days */}
      <div className="shrink-0 text-end w-32 hidden sm:block">
        <StatusBadge status={status} />
        <p className={`text-xs mt-1 font-medium ${
          status === 'expired'       ? 'text-red-400'   :
          status === 'expiring_soon' ? 'text-amber-400' : 'text-zinc-500'
        }`}>
          {status === 'expired'
            ? t('members.expiredDaysAgo', { count: Math.abs(daysRemaining) })
            : status === 'expiring_soon'
            ? t('members.daysRemaining', { count: daysRemaining })
            : t('members.daysRemaining', { count: daysRemaining })}
        </p>
      </div>

      {/* Payment status — mobile shows status badge here */}
      <div className="shrink-0 flex flex-col items-end gap-1.5">
        <span className="sm:hidden"><StatusBadge status={status} /></span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_BADGE[sub.paymentStatus]}`}>
          {t(`subscription.payment.${sub.paymentStatus}`)}
        </span>
      </div>

      {/* Renew action */}
      <div className="shrink-0 w-16 flex justify-end">
        {canRenew ? (
          <button
            onClick={() => onNavigate(`/subscriptions/new?memberId=${member.id}`)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">{t('dashboard.renew')}</span>
          </button>
        ) : (
          <div className="w-16" />
        )}
      </div>
    </div>
  )
}
