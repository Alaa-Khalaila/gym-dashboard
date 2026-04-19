import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { addMonths, format } from 'date-fns'
import { useData } from '../context/DataContext'
import MemberAvatar from '../components/ui/MemberAvatar'
import type { PaymentStatus } from '../types'

const INPUT = 'w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors'
const INPUT_ERROR = 'w-full bg-zinc-900 border border-red-500/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-colors'
const LABEL = 'block text-xs font-medium text-zinc-400 mb-1.5'

export default function NewSubscriptionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { members, plans, getMemberById, addSubscription } = useData()

  const preselectedId = searchParams.get('memberId') ?? ''
  const activePlans = plans.filter((p) => p.isActive)
  const today = format(new Date(), 'yyyy-MM-dd')

  const [memberId, setMemberId]           = useState(preselectedId)
  const [planId, setPlanId]               = useState(activePlans[0]?.id ?? '')
  const [startDate, setStartDate]         = useState(today)
  const [paidAmount, setPaidAmount]       = useState<number>(activePlans[0]?.price ?? 0)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid')
  const [errors, setErrors]               = useState<Record<string, string>>({})
  const [submitting, setSubmitting]       = useState(false)
  const [apiError, setApiError]           = useState('')

  const selectedPlan = activePlans.find((p) => p.id === planId)
  const endDate = selectedPlan && startDate
    ? format(addMonths(new Date(startDate), selectedPlan.durationMonths), 'yyyy-MM-dd')
    : ''

  const selectedMember = getMemberById(memberId)

  function handlePlanSelect(id: string) {
    setPlanId(id)
    const p = activePlans.find((pl) => pl.id === id)
    if (p) setPaidAmount(p.price)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!memberId) e.memberId = t('common.required')
    if (!planId)   e.planId   = t('common.required')
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    setApiError('')
    try {
      await addSubscription({ memberId, planId, startDate, paidAmount: Number(paidAmount), paymentStatus })
      navigate(`/members/${memberId}`)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const backHref = preselectedId ? `/members/${preselectedId}` : '/members'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={backHref}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{t('subscription.newSubscription')}</h1>
          {selectedMember && (
            <p className="text-sm text-zinc-400 mt-0.5">
              {t('subscription.renewFor', { name: selectedMember.name })}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-1">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">{t('subscription.newSubscription')}</h2>
          </div>

          {/* Member selector */}
          {preselectedId && selectedMember ? (
            <div>
              <label className={LABEL}>{t('subscription.selectMember')}</label>
              <div className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <MemberAvatar name={selectedMember.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-white">{selectedMember.name}</p>
                  <p className="text-xs text-zinc-500">{selectedMember.phone}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className={LABEL}>
                {t('subscription.selectMember')} <span className="text-red-400">*</span>
              </label>
              <select
                value={memberId}
                onChange={(e) => { setMemberId(e.target.value); setErrors((p) => ({ ...p, memberId: '' })) }}
                className={errors.memberId ? INPUT_ERROR + ' [color-scheme:dark]' : INPUT + ' [color-scheme:dark]'}
              >
                <option value="">{t('subscription.selectMember')}</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — {m.phone}</option>
                ))}
              </select>
              {errors.memberId && <p className="mt-1 text-xs text-red-400">{errors.memberId}</p>}
            </div>
          )}

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
                    {plan.price} JD
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
                <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">JD</span>
                <input
                  type="number"
                  min={0}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className={INPUT + ' ps-10'}
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

        <div className="space-y-3 pb-6">
          {apiError && <p className="text-sm text-red-400 text-end">{apiError}</p>}
          <div className="flex items-center justify-end gap-3">
            <Link
              to={backHref}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              {t('common.cancel')}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? t('common.saving') : t('subscription.newSubscription')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
