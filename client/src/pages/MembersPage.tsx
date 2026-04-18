import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, UserPlus, Phone, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import MemberAvatar from '../components/ui/MemberAvatar'
import StatusBadge from '../components/ui/StatusBadge'
import { getMemberRows, type MemberRow } from '../services/mockData'

type FilterTab = 'all' | 'active' | 'expiring_soon' | 'expired'

export default function MembersPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')

  const allRows = useMemo(() => getMemberRows(), [])

  const filtered = useMemo(() => {
    let rows = allRows

    if (filter !== 'all') {
      rows = rows.filter((r) => r.status === filter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.member.name.toLowerCase().includes(q) ||
          r.member.phone.includes(q)
      )
    }

    return rows
  }, [allRows, filter, search])

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: t('common.all') },
    { key: 'active', label: t('common.active') },
    { key: 'expiring_soon', label: t('common.expiringSoon') },
    { key: 'expired', label: t('common.expired') },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('members.title')}</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors">
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('members.addNew')}</span>
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
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

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={[
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                filter === tab.key
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-zinc-500">
        {filtered.length} {t('members.title').toLowerCase()}
      </p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 text-sm">{t('members.noMembers')}</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <MemberCard key={row.member.id} row={row} canDelete={isSuperAdmin} />
          ))}
        </div>
      )}
    </div>
  )
}

function MemberCard({ row }: { row: MemberRow; canDelete: boolean }) {
  const { t } = useTranslation()
  const { member, subscription, status, daysRemaining } = row

  const daysLabel = useMemo(() => {
    if (status === 'no_subscription') return null
    if (status === 'expired') return t('members.expiredAgo', { count: Math.abs(daysRemaining) })
    return t('members.daysLeft', { count: daysRemaining })
  }, [status, daysRemaining, t])

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4 hover:border-zinc-700 transition-colors cursor-pointer">
      {/* Top: avatar + name + plan */}
      <div className="flex items-start gap-3">
        <MemberAvatar name={member.name} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{member.name}</p>
          <p className="text-xs text-zinc-500">{subscription?.plan.name ?? '—'}</p>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Phone className="w-3.5 h-3.5 shrink-0" />
          <span>{member.phone}</span>
        </div>
        {member.email && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>
        )}
      </div>

      {/* Bottom: status + days */}
      <div className="flex items-center justify-between">
        <StatusBadge status={status === 'no_subscription' ? 'no_subscription' : status} />
        {daysLabel && (
          <span className={`text-xs font-medium ${
            status === 'expiring_soon' ? 'text-amber-400' :
            status === 'expired' ? 'text-red-400' : 'text-zinc-400'
          }`}>
            {daysLabel}
          </span>
        )}
      </div>
    </div>
  )
}
