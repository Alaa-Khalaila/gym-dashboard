import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import type { MemberRow } from '../../../services/mockData'
import MemberAvatar from '../../../components/ui/MemberAvatar'

interface Props {
  rows: MemberRow[]
}

export default function ExpiringList({ rows }: Props) {
  const { t } = useTranslation()
  const expiring = rows
    .filter((r) => r.status === 'expiring_soon')
    .sort((a, b) => a.daysRemaining - b.daysRemaining)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">{t('dashboard.expiringSoonList')}</span>
        </div>
        <span className="text-xs text-zinc-500">{t('dashboard.nextNDays')}</span>
      </div>

      {/* List */}
      {expiring.length === 0 ? (
        <p className="px-5 py-8 text-sm text-zinc-500 text-center">{t('dashboard.noExpiring')}</p>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {expiring.map(({ member, subscription, daysRemaining }) => (
            <li key={member.id} className="flex items-center gap-3 px-5 py-3.5">
              <MemberAvatar name={member.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{member.name}</p>
                <p className="text-xs text-zinc-500">{subscription?.plan.name}</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="text-end">
                  <p className="text-sm font-semibold text-amber-400">{daysRemaining}d</p>
                  <p className="text-xs text-zinc-500">{t('dashboard.remaining')}</p>
                </div>
                <button className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors">
                  {t('dashboard.renew')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
