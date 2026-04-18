import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, UserPlus, AlertTriangle, DollarSign } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import StatCard from '../components/ui/StatCard'
import ExpiringList from '../features/dashboard/components/ExpiringList'
import MemberCard from '../features/members/components/MemberCard'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { getMemberRows, getDashboardStats } = useData()
  const isSuperAdmin = user?.role === 'super_admin'

  const rows = useMemo(() => getMemberRows(), [getMemberRows])
  const stats = useMemo(() => getDashboardStats(), [getDashboardStats])
  const preview = useMemo(() => rows.slice(0, 12), [rows])

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
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 items-start">
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-white">{t('dashboard.allMembers')}</h2>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {preview.map((row) => <MemberCard key={row.member.id} row={row} />)}
          </div>
        </div>

        <div className="xl:sticky xl:top-0">
          <ExpiringList rows={rows} />
        </div>
      </div>
    </div>
  )
}
