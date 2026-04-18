import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import MemberCard from '../features/members/components/MemberCard'
import { getMemberRows } from '../services/mockData'

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
    if (filter !== 'all') rows = rows.filter((r) => r.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (r) => r.member.name.toLowerCase().includes(q) || r.member.phone.includes(q)
      )
    }
    return rows
  }, [allRows, filter, search])

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all',          label: t('common.all') },
    { key: 'active',       label: t('common.active') },
    { key: 'expiring_soon',label: t('common.expiringSoon') },
    { key: 'expired',      label: t('common.expired') },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('members.title')}</h1>
        {isSuperAdmin && (
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('members.addNew')}</span>
          </button>
        )}
      </div>

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

      <p className="text-xs text-zinc-500">{filtered.length} {t('members.title').toLowerCase()}</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 text-sm">{t('members.noMembers')}</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => <MemberCard key={row.member.id} row={row} />)}
        </div>
      )}
    </div>
  )
}
