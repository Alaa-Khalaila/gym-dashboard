import { useTranslation } from 'react-i18next'
import type { SubscriptionStatus } from '../../types'

interface Props {
  status: SubscriptionStatus | 'no_subscription'
}

const STYLES: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  expiring_soon: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  expired: 'bg-red-500/15 text-red-400 border border-red-500/25',
  no_subscription: 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/25',
}

const KEY_MAP: Record<string, string> = {
  active: 'subscription.status.active',
  expiring_soon: 'subscription.status.expiring_soon',
  expired: 'subscription.status.expired',
  no_subscription: 'members.noSubscription',
}

export default function StatusBadge({ status }: Props) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STYLES[status]}`}>
      {t(KEY_MAP[status])}
    </span>
  )
}
