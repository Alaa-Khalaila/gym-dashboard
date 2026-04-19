import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react'
import { format, subMonths, startOfMonth } from 'date-fns'
import { useData } from '../context/DataContext'
import MemberAvatar from '../components/ui/MemberAvatar'
import type { Plan, Subscription } from '../types'

type Period = 'month' | 'year' | 'all'

interface MonthBucket {
  label: string
  revenue: number
  count: number
  isCurrent: boolean
}

interface PlanStat {
  plan: Plan
  revenue: number
  count: number
  pct: number
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export default function RevenuePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { subscriptions, members, plans } = useData()

  const [period, setPeriod] = useState<Period>('year')

  const today = new Date()
  const currentMonthKey = getMonthKey(today)
  const currentYearStr  = String(today.getFullYear())

  /* ── Period-filtered subscriptions ── */
  const periodSubs = useMemo(() => {
    switch (period) {
      case 'month': return subscriptions.filter((s) => s.startDate.startsWith(currentMonthKey))
      case 'year':  return subscriptions.filter((s) => s.startDate.startsWith(currentYearStr))
      default:      return subscriptions
    }
  }, [subscriptions, period, currentMonthKey, currentYearStr])

  /* ── Top stats ── */
  const stats = useMemo(() => {
    const total    = periodSubs.reduce((s, sub) => s + sub.paidAmount, 0)
    const paid     = periodSubs.filter((s) => s.paymentStatus === 'paid').reduce((s, sub) => s + sub.paidAmount, 0)
    const unpaid   = periodSubs.filter((s) => s.paymentStatus !== 'paid').reduce((s, sub) => s + sub.paidAmount, 0)
    return { total, paid, unpaid, count: periodSubs.length }
  }, [periodSubs])

  /* ── Monthly buckets (last 12 months) ── */
  const monthlyBuckets = useMemo<MonthBucket[]>(() => {
    const buckets: MonthBucket[] = []
    for (let i = 11; i >= 0; i--) {
      const d   = startOfMonth(subMonths(today, i))
      const key = getMonthKey(d)
      const matching = subscriptions.filter((s) => s.startDate.startsWith(key))
      buckets.push({
        label: format(d, 'MMM'),
        revenue: matching.reduce((s, sub) => s + sub.paidAmount, 0),
        count:   matching.length,
        isCurrent: i === 0,
      })
    }
    return buckets
  }, [subscriptions])

  const maxRevenue = Math.max(...monthlyBuckets.map((b) => b.revenue), 1)

  /* ── Revenue by plan ── */
  const planStats = useMemo<PlanStat[]>(() => {
    const totalAll = periodSubs.reduce((s, sub) => s + sub.paidAmount, 0) || 1
    return plans
      .filter((p) => p.isActive)
      .map((plan) => {
        const subs    = periodSubs.filter((s) => s.planId === plan.id)
        const revenue = subs.reduce((s, sub) => s + sub.paidAmount, 0)
        return { plan, revenue, count: subs.length, pct: Math.round((revenue / totalAll) * 100) }
      })
      .filter((ps) => ps.count > 0)
      .sort((a, b) => b.revenue - a.revenue)
  }, [plans, periodSubs])

  /* ── Recent transactions ── */
  const recent = useMemo(() => {
    return [...periodSubs]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 12)
      .map((sub) => ({ sub, member: members.find((m) => m.id === sub.memberId) }))
      .filter((r): r is { sub: Subscription & { plan: Plan }; member: NonNullable<typeof r['member']> } => !!r.member)
  }, [periodSubs, members])

  const periods: { key: Period; label: string }[] = [
    { key: 'month', label: t('revenue.thisMonth') },
    { key: 'year',  label: t('revenue.thisYear') },
    { key: 'all',   label: t('revenue.allTime') },
  ]

  const PAYMENT_BADGE: Record<string, string> = {
    paid:    'bg-emerald-500/15 text-emerald-400',
    unpaid:  'bg-red-500/15 text-red-400',
    partial: 'bg-amber-500/15 text-amber-400',
  }

  return (
    <div className="space-y-6">
      {/* Header + period selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('revenue.title')}</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{t('dashboard.revenueMonthDesc')}</p>
        </div>
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={[
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                period === p.key ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white',
              ].join(' ')}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <RevenueCard
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          iconBg="bg-emerald-500/10"
          label={t('revenue.totalRevenue')}
          value={`${stats.total.toLocaleString()} JD`}
        />
        <RevenueCard
          icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
          iconBg="bg-blue-500/10"
          label={t('revenue.paidRevenue')}
          value={`${stats.paid.toLocaleString()} JD`}
        />
        <RevenueCard
          icon={<AlertCircle className="w-5 h-5 text-amber-400" />}
          iconBg="bg-amber-500/10"
          label={t('revenue.unpaidRevenue')}
          value={`${stats.unpaid.toLocaleString()} JD`}
        />
        <RevenueCard
          icon={<CreditCard className="w-5 h-5 text-violet-400" />}
          iconBg="bg-violet-500/10"
          label={t('revenue.totalSubscriptions')}
          value={stats.count}
        />
      </div>

      {/* Monthly chart + plan breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">

        {/* Bar chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">{t('revenue.monthlyRevenue')}</h2>
            <span className="text-xs text-zinc-500">{t('revenue.last12Months')}</span>
          </div>

          <div className="flex items-end gap-1.5 h-40 pt-2">
            {monthlyBuckets.map((bucket, i) => {
              const heightPct = maxRevenue > 0 ? (bucket.revenue / maxRevenue) * 100 : 0
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  {bucket.revenue > 0 && (
                    <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {bucket.revenue.toLocaleString()} JD
                      {bucket.count > 0 && <span className="text-zinc-400"> · {bucket.count}</span>}
                    </div>
                  )}
                  <div className="w-full flex items-end" style={{ height: '100%' }}>
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        bucket.isCurrent
                          ? 'bg-emerald-500'
                          : bucket.revenue > 0
                          ? 'bg-zinc-700 group-hover:bg-zinc-600'
                          : 'bg-zinc-800'
                      }`}
                      style={{ height: `${Math.max(heightPct, bucket.revenue > 0 ? 4 : 2)}%` }}
                    />
                  </div>
                  <span className={`text-xs ${bucket.isCurrent ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    {bucket.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Revenue by plan */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">{t('revenue.revenueByPlan')}</h2>

          {planStats.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4 text-center">{t('revenue.noTransactions')}</p>
          ) : (
            <div className="space-y-3">
              {planStats.map(({ plan, revenue, count, pct }) => (
                <div key={plan.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300 font-medium">{plan.name}</span>
                    <span className="text-white font-semibold">{revenue.toLocaleString()} JD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500 w-14 text-end shrink-0">
                      {count} {t('revenue.subs')} · {pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">{t('revenue.recentTransactions')}</h2>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{recent.length}</span>
        </div>

        {recent.length === 0 ? (
          <p className="px-5 py-10 text-sm text-zinc-500 text-center">{t('revenue.noTransactions')}</p>
        ) : (
          <div className="divide-y divide-zinc-800">
            {recent.map(({ sub, member }) => (
              <div key={sub.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/40 transition-colors">
                <button
                  onClick={() => navigate(`/members/${member.id}`)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-start group"
                >
                  <MemberAvatar name={member.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-zinc-500">{sub.plan.name}</p>
                  </div>
                </button>

                <div className="hidden sm:block text-xs text-zinc-500 shrink-0">
                  {format(new Date(sub.startDate), 'MMM d, yyyy')}
                </div>

                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_BADGE[sub.paymentStatus]}`}>
                  {t(`subscription.payment.${sub.paymentStatus}`)}
                </span>

                <p className="text-sm font-bold text-white shrink-0 w-16 text-end">
                  {sub.paidAmount.toLocaleString()} JD
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── RevenueCard ─────────────────────────────────────────────── */

function RevenueCard({ icon, iconBg, label, value }: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string | number
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-start gap-3">
      <div className={`${iconBg} p-2 rounded-lg shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-400 truncate">{label}</p>
        <p className="text-xl font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  )
}
