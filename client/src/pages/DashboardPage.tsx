import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, UserPlus, AlertTriangle, DollarSign } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/ui/StatCard'
import ExpiringList from '../features/dashboard/components/ExpiringList'
import { getMemberRows, getDashboardStats } from '../services/mockData'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'

  const rows = useMemo(() => getMemberRows(), [])
  const stats = useMemo(() => getDashboardStats(), [])

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

      {/* Expiring soon */}
      <div className="max-w-lg">
        <ExpiringList rows={rows} />
      </div>
    </div>
  )
}
