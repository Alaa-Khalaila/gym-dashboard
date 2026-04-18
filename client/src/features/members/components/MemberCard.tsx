import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Phone, Mail } from 'lucide-react'
import MemberAvatar from '../../../components/ui/MemberAvatar'
import StatusBadge from '../../../components/ui/StatusBadge'
import type { MemberRow } from '../../../services/mockData'

interface Props {
  row: MemberRow
}

export default function MemberCard({ row }: Props) {
  const { t } = useTranslation()
  const { member, subscription, status, daysRemaining } = row

  const daysLabel = useMemo(() => {
    if (status === 'no_subscription') return null
    if (status === 'expired') return t('members.expiredAgo', { count: Math.abs(daysRemaining) })
    return t('members.daysLeft', { count: daysRemaining })
  }, [status, daysRemaining, t])

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4 hover:border-zinc-700 transition-colors cursor-pointer">
      <div className="flex items-start gap-3">
        <MemberAvatar name={member.name} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{member.name}</p>
          <p className="text-xs text-zinc-500">{subscription?.plan.name ?? '—'}</p>
        </div>
      </div>

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

      <div className="flex items-center justify-between">
        <StatusBadge status={status === 'no_subscription' ? 'no_subscription' : status} />
        {daysLabel && (
          <span className={`text-xs font-medium ${
            status === 'expiring_soon' ? 'text-amber-400' :
            status === 'expired'       ? 'text-red-400'   : 'text-zinc-400'
          }`}>
            {daysLabel}
          </span>
        )}
      </div>
    </div>
  )
}
