import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, User, CreditCard } from 'lucide-react'
import { addMonths, format } from 'date-fns'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import type { Gender, PaymentStatus } from '../types'

const INPUT = 'w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors'
const INPUT_ERROR = 'w-full bg-zinc-900 border border-red-500/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-colors'
const LABEL = 'block text-xs font-medium text-zinc-400 mb-1.5'

export default function AddMemberPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { plans, addMember } = useData()

  const activePlans = plans.filter((p) => p.isActive)
  const today = format(new Date(), 'yyyy-MM-dd')

  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [email, setEmail]         = useState('')
  const [gender, setGender]       = useState<Gender>('male')
  const [birthDate, setBirthDate] = useState('')
  const [notes, setNotes]         = useState('')

  const [planId, setPlanId]               = useState(activePlans[0]?.id ?? '')
  const [startDate, setStartDate]         = useState(today)
  const [paidAmount, setPaidAmount]       = useState<number>(activePlans[0]?.price ?? 0)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid')

  const selectedPlan = activePlans.find((p) => p.id === planId)
  const endDate = selectedPlan && startDate
    ? format(addMonths(new Date(startDate), selectedPlan.durationMonths), 'yyyy-MM-dd')
    : ''

  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim())  e.name  = t('common.required')
    if (!phone.trim()) e.phone = t('common.required')
    if (!planId)       e.planId = t('common.required')
    return e
  }

  function handlePlanSelect(id: string) {
    setPlanId(id)
    const p = activePlans.find((pl) => pl.id === id)
    if (p) setPaidAmount(p.price)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const memberId = `m${Date.now()}`
    const plan = activePlans.find((p) => p.id === planId)!

    addMember(
      {
        id: memberId,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        gender,
        birthDate: birthDate || undefined,
        notes: notes.trim() || undefined,
        createdAt: today,
        createdBy: user?.id ?? '1',
      },
      {
        id: `s${Date.now()}`,
        memberId,
        planId,
        plan,
        startDate,
        endDate,
        paidAmount: Number(paidAmount),
        paymentStatus,
        createdAt: today,
        createdBy: user?.id ?? '1',
      },
    )
    navigate(`/members/${memberId}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/members"
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{t('members.addMember')}</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{t('members.backToMembers')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Member Info */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-1">
            <User className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">{t('members.memberInfo')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className={LABEL}>
                {t('common.name')} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: '' })) }}
                className={errors.name ? INPUT_ERROR : INPUT}
                placeholder="John Smith"
                autoComplete="name"
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className={LABEL}>
                {t('common.phone')} <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setErrors((prev) => ({ ...prev, phone: '' })) }}
                className={errors.phone ? INPUT_ERROR : INPUT}
                placeholder="+1 (555) 000-0000"
                autoComplete="tel"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className={LABEL}>
                {t('common.email')}{' '}
                <span className="text-zinc-600 font-normal">({t('common.optional')})</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT}
                placeholder="john@example.com"
                autoComplete="email"
              />
            </div>

            {/* Gender */}
            <div>
              <label className={LABEL}>
                {t('common.gender')} <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                {(['male', 'female'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={[
                      'flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors',
                      gender === g
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white',
                    ].join(' ')}
                  >
                    {t(`members.gender.${g}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Birth Date */}
            <div>
              <label className={LABEL}>
                {t('common.birthDate')}{' '}
                <span className="text-zinc-600 font-normal">({t('common.optional')})</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className={INPUT + ' [color-scheme:dark]'}
                max={today}
              />
            </div>

            {/* Notes */}
            <div>
              <label className={LABEL}>
                {t('common.notes')}{' '}
                <span className="text-zinc-600 font-normal">({t('common.optional')})</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={INPUT}
                placeholder="..."
              />
            </div>
          </div>
        </section>

        {/* First Subscription */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-1">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">{t('members.firstSubscription')}</h2>
          </div>

          {/* Plan picker */}
          <div>
            <label className={LABEL}>
              {t('subscription.plan')} <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activePlans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => handlePlanSelect(plan.id)}
                  className={[
                    'p-3 rounded-xl border text-start transition-all',
                    planId === plan.id
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-600',
                  ].join(' ')}
                >
                  <p className={`font-semibold text-sm ${planId === plan.id ? 'text-white' : 'text-zinc-300'}`}>
                    {plan.name}
                  </p>
                  <p className={`text-xs mt-0.5 ${planId === plan.id ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    ${plan.price}
                  </p>
                </button>
              ))}
            </div>
            {errors.planId && <p className="mt-1 text-xs text-red-400">{errors.planId}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className={LABEL}>{t('common.startDate')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={INPUT + ' [color-scheme:dark]'}
              />
            </div>

            {/* End Date (readonly) */}
            <div>
              <label className={LABEL}>{t('common.endDate')}</label>
              <input
                type="text"
                value={endDate}
                readOnly
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-400 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-zinc-600">{t('subscription.autoEndDate')}</p>
            </div>

            {/* Paid Amount */}
            <div>
              <label className={LABEL}>{t('common.paidAmount')}</label>
              <div className="relative">
                <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">$</span>
                <input
                  type="number"
                  min={0}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className={INPUT + ' ps-7'}
                />
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className={LABEL}>{t('common.paymentStatus')}</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className={INPUT + ' [color-scheme:dark]'}
              >
                <option value="paid">{t('subscription.payment.paid')}</option>
                <option value="unpaid">{t('subscription.payment.unpaid')}</option>
                <option value="partial">{t('subscription.payment.partial')}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Link
            to="/members"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            {t('members.addMember')}
          </button>
        </div>
      </form>
    </div>
  )
}
