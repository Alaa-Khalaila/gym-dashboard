import { useTranslation } from 'react-i18next'

export default function SubscriptionsPage() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('nav.subscriptions')}</h1>
      <p className="text-gray-500 mt-1">Subscriptions coming soon.</p>
    </div>
  )
}
