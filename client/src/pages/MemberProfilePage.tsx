import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Phone, Mail, Calendar, Venus, Mars, Edit, Trash2, RotateCcw, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import MemberAvatar from '../components/ui/MemberAvatar'
import StatusBadge from '../components/ui/StatusBadge'
import { getSubscriptionStatus, getDaysRemaining } from '../utils/subscription'

const PAYMENT_BADGE: Record<string, string> = {
  paid:    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  unpaid:  'bg-red-500/15 text-red-400 border border-red-500/25',
  partial: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
}

function fmt(dateStr: string) {
  return format(new Date(dateStr), 'MMM d, yyyy')
}

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { getMemberById, getSubscriptionsForMember, getLatestSubscription, deleteMember } = useData()

  const [confirmDelete, setConfirmDelete] = useState(false)
  const isSuperAdmin = user?.role === 'super_admin'

  const member = getMemberById(id!)
  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <p className="text-xl font-semibold text-white">{t('members.notFound')}</p>
        <p className="text-sm text-zinc-400">{t('members.notFoundDesc')}</p>
        <Link to="/members" className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-white transition-colors">
          {t('members.backToMembers')}
        </Link>
      </div>
    )
  }

  const allSubs = getSubscriptionsForMember(id!)
  const currentSub = getLatestSubscription(id!)
  const status = currentSub ? getSubscriptionStatus(currentSub.endDate) : ('no_subscription' as const)
  const daysRemaining = currentSub ? getDaysRemaining(currentSub.endDate) : 0

  function handleDelete() {
    deleteMember(id!)
    navigate('/members')
  }

  const canRenew = status === 'expired' || status === 'expiring_soon' || status === 'no_subscription'

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/members"
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white flex-1">{t('members.memberProfile')}</h1>
        <div className="flex items-center gap-2">
          {canRenew && (
            <Link
              to={`/subscriptions/new?memberId=${id}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">{t('members.renewSubscription')}</span>
            </Link>
          )}
          <Link
            to={`/members/${id}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.edit')}</span>
          </Link>
          {isSuperAdmin && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.delete')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="text-sm text-red-300 flex-1">{t('members.deleteConfirm')}</p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors"
            >
              {t('common.delete')}
            </button>
          </div>
        </div>
      )}

      {/* Info card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <MemberAvatar name={member.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-white">{member.name}</h2>
                <p className="text-sm text-zinc-400 mt-0.5">
                  {t('members.memberSince')} {fmt(member.createdAt)}
                </p>
              </div>
              <StatusBadge status={status} />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Phone className="w-4 h-4 shrink-0 text-zinc-500" />
                <span>{member.phone}</span>
              </div>
              {member.email && (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Mail className="w-4 h-4 shrink-0 text-zinc-500" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                {member.gender === 'male'
                  ? <Mars className="w-4 h-4 shrink-0 text-zinc-500" />
                  : <Venus className="w-4 h-4 shrink-0 text-zinc-500" />
                }
                <span>{t(`members.gender.${member.gender}`)}</span>
              </div>
              {member.birthDate && (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Calendar className="w-4 h-4 shrink-0 text-zinc-500" />
                  <span>{fmt(member.birthDate)}</span>
                </div>
              )}
            </div>

            {member.notes && (
              <p className="mt-3 text-sm text-zinc-500 italic">"{member.notes}"</p>
            )}
          </div>
        </div>
      </div>

      {/* Current Subscription */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">{t('members.currentSubscription')}</h3>
        </div>

        {currentSub ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{currentSub.plan.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {fmt(currentSub.startDate)} → {fmt(currentSub.endDate)}
                </p>
              </div>
              <div className="text-end">
                <StatusBadge status={status} />
                {status !== 'no_subscription' && (
                  <p className={`text-xs mt-1 font-medium ${
                    status === 'expired'       ? 'text-red-400'   :
                    status === 'expiring_soon' ? 'text-amber-400' : 'text-zinc-400'
                  }`}>
                    {status === 'expired'
                      ? t('members.expiredDaysAgo', { count: Math.abs(daysRemaining) })
                      : t('members.daysRemaining', { count: daysRemaining })}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-zinc-800">
              <div>
                <p className="text-xs text-zinc-500">{t('common.paidAmount')}</p>
                <p className="text-sm font-semibold text-white mt-0.5">${currentSub.paidAmount}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">{t('common.paymentStatus')}</p>
                <span className={`inline-flex mt-0.5 items-center px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_BADGE[currentSub.paymentStatus]}`}>
                  {t(`subscription.payment.${currentSub.paymentStatus}`)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">{t('members.noSubscription')}</p>
        )}
      </div>

      {/* Subscription History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">{t('members.subscriptionHistory')}</h3>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{allSubs.length}</span>
        </div>

        {allSubs.length === 0 ? (
          <p className="px-5 py-8 text-sm text-zinc-500 text-center">{t('members.noHistory')}</p>
        ) : (
          <div className="divide-y divide-zinc-800">
            {allSubs.map((sub, i) => {
              const s = getSubscriptionStatus(sub.endDate)
              return (
                <div key={sub.id} className={`px-5 py-4 flex items-center gap-4 ${i === 0 ? '' : 'opacity-75'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-white">{sub.plan.name}</p>
                      <StatusBadge status={s} />
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {fmt(sub.startDate)} → {fmt(sub.endDate)}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-sm font-semibold text-white">${sub.paidAmount}</p>
                    <span className={`text-xs ${PAYMENT_BADGE[sub.paymentStatus].split(' ')[1]}`}>
                      {t(`subscription.payment.${sub.paymentStatus}`)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
