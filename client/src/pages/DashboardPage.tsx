import { useTranslation } from 'react-i18next'

export default function DashboardPage() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
      <p className="text-gray-500 mt-1">Dashboard coming soon.</p>
    </div>
  )
}
