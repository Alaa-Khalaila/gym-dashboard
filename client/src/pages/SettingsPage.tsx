import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Building2, Tag, Users, ChevronRight, Check } from 'lucide-react'
import { useData } from '../context/DataContext'
import type { Plan } from '../types'

const INPUT = 'w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50'
const LABEL = 'block text-xs font-medium text-zinc-400 mb-1.5'

const GYM_NAME_KEY = 'gym_name'

function SectionCard({ icon, title, children }: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
        <div className="bg-zinc-800 p-2 rounded-lg">{icon}</div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function PlanRow({ plan, onSave }: { plan: Plan; onSave: (id: string, price: number) => void }) {
  const { t } = useTranslation()
  const [price, setPrice] = useState(String(plan.price))
  const [saved, setSaved] = useState(false)

  const dirty = Number(price) !== plan.price && price !== '' && Number(price) >= 0

  function handleSave() {
    const val = Number(price)
    if (isNaN(val) || val < 0) return
    onSave(plan.id, val)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="flex items-center gap-4 py-3 border-b border-zinc-800 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{plan.name}</p>
        <p className="text-xs text-zinc-500">
          {plan.durationMonths} {t('common.months')}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm text-zinc-400">JD</span>
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => { setPrice(e.target.value); setSaved(false) }}
          className="w-24 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={handleSave}
          disabled={!dirty}
          className={[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            saved
              ? 'bg-emerald-500/20 text-emerald-400'
              : dirty
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed',
          ].join(' ')}
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : null}
          {saved ? t('common.save') : t('common.save')}
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { plans, updatePlan } = useData()

  const [gymName, setGymName] = useState(() => localStorage.getItem(GYM_NAME_KEY) ?? '')
  const [gymNameSaved, setGymNameSaved] = useState(false)

  function handleSaveGymInfo() {
    localStorage.setItem(GYM_NAME_KEY, gymName)
    setGymNameSaved(true)
    setTimeout(() => setGymNameSaved(false), 2000)
  }

  async function handleSavePlanPrice(id: string, price: number) {
    await updatePlan(id, price)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('settings.title')}</h1>
      </div>

      {/* Gym Information */}
      <SectionCard
        icon={<Building2 className="w-4 h-4 text-zinc-400" />}
        title={t('settings.gymInfo')}
      >
        <div className="space-y-4">
          <div>
            <label className={LABEL}>{t('settings.gymName')}</label>
            <input
              type="text"
              value={gymName}
              onChange={(e) => { setGymName(e.target.value); setGymNameSaved(false) }}
              placeholder={t('settings.gymNamePlaceholder')}
              className={INPUT}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveGymInfo}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {gymNameSaved && <Check className="w-4 h-4" />}
              {t('common.save')}
            </button>
            {gymNameSaved && (
              <span className="text-xs text-emerald-400">{t('settings.savedSuccess')}</span>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Subscription Plans */}
      <SectionCard
        icon={<Tag className="w-4 h-4 text-zinc-400" />}
        title={t('settings.subscriptionPlans')}
      >
        <p className="text-xs text-zinc-500 mb-4">{t('settings.plansDesc')}</p>
        <div>
          {plans.map((plan) => (
            <PlanRow key={plan.id} plan={plan} onSave={handleSavePlanPrice} />
          ))}
        </div>
      </SectionCard>

      {/* Admin Accounts */}
      <SectionCard
        icon={<Users className="w-4 h-4 text-zinc-400" />}
        title={t('settings.manageAdmins')}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400">{t('settings.manageAdminsDesc')}</p>
          <button
            onClick={() => navigate('/settings/admins')}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors shrink-0 ms-4"
          >
            {t('settings.goToAdmins')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </SectionCard>
    </div>
  )
}
