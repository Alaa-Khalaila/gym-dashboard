import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, UserPlus, AlertTriangle, DollarSign } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/ui/StatCard'
import ExpiringList from '../features/dashboard/components/ExpiringList'
import MemberCard from '../features/members/components/MemberCard'
import { getMemberRows, getDashboardStats } from '../services/mockData'

type FilterTab = 'all' | 'active' | 'expiring_soon' | 'expired'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'

  const [filter, setFilter] = useState<FilterTab>('all')

  const rows = useMemo(() => getMemberRows(), [])
  const stats = useMemo(() => getDashboardStats(), [])

  const filtered = useMemo(() => {
    if (filter === 'all') return rows
    return rows.filter((r) => r.status === filter)
  }, [rows, filter])

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all',          label: t('common.all') },
    { key: 'active',       label: t('common.active') },
    { key: 'expiring_soon',label: t('common.expiringSoon') },
    { key: 'expired',      label: t('common.expired') },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t('dashboard.title')}</h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          {t('dashboard.welcomeBack', { name: user?.name })}
        </p>
      </div>

      {/* Stats grid */}
      <div className={`grid gap-4 ${isSuperAdmin ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
        <StatCard
          label={t('dashboard.activeMembers')}
          value={stats.activeMembers}
          description={t('dashboard.totalActiveDesc')}
          icon={<Users className="w-5 h-5 text-emerald-400" />}
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          label={t('dashboard.newThisMonth')}
          value={stats.newThisMonth}
          description={t('dashboard.newThisMonthDesc')}
          icon={<UserPlus className="w-5 h-5 text-blue-400" />}
          iconBg="bg-blue-500/10"
        />
        <StatCard
          label={t('dashboard.expiringSoon')}
          value={stats.expiringSoon}
          description={t('dashboard.expiringSoonDesc')}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          iconBg="bg-amber-500/10"
        />
        {isSuperAdmin && (
          <StatCard
            label={t('dashboard.totalRevenueMonth')}
            value={`$${stats.revenueThisMonth.toLocaleString()}`}
            description={t('dashboard.revenueMonthDesc')}
            icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
            iconBg="bg-emerald-500/10"
          />
        )}
      </div>

      {/* Members + Expiring Soon */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">

        {/* All Members */}
        <div className="space-y-4">
          {/* Section header */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-base font-semibold text-white">{t('dashboard.allMembers')}</h2>
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={[
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    filter === tab.key ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-sm">{t('members.noMembers')}</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((row) => <MemberCard key={row.member.id} row={row} />)}
            </div>
          )}
        </div>

        {/* Expiring Soon panel */}
        <div className="xl:sticky xl:top-0">
          <ExpiringList rows={rows} />
        </div>
      </div>
    </div>
  )
}
