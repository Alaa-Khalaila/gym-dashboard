import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, User } from 'lucide-react'
import { useData } from '../context/DataContext'
import type { Gender } from '../types'

const INPUT = 'w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors'
const INPUT_ERROR = 'w-full bg-zinc-900 border border-red-500/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-colors'
const LABEL = 'block text-xs font-medium text-zinc-400 mb-1.5'

export default function EditMemberPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { getMemberById, updateMember } = useData()

  const member = getMemberById(id!)
  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <p className="text-xl font-semibold text-white">{t('members.notFound')}</p>
        <Link to="/members" className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-white transition-colors">
          {t('members.backToMembers')}
        </Link>
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)

  const [name, setName]           = useState(member.name)
  const [phone, setPhone]         = useState(member.phone)
  const [email, setEmail]         = useState(member.email ?? '')
  const [gender, setGender]       = useState<Gender>(member.gender)
  const [birthDate, setBirthDate] = useState(member.birthDate ?? '')
  const [notes, setNotes]         = useState(member.notes ?? '')
  const [errors, setErrors]       = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim())  e.name  = t('common.required')
    if (!phone.trim()) e.phone = t('common.required')
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    updateMember(id!, {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      gender,
      birthDate: birthDate || undefined,
      notes: notes.trim() || undefined,
    })
    navigate(`/members/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/members/${id}`}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{t('members.editMember')}</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{member.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
                className={errors.name ? INPUT_ERROR : INPUT}
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
                onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: '' })) }}
                className={errors.phone ? INPUT_ERROR : INPUT}
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
                autoComplete="email"
              />
            </div>

            {/* Gender */}
            <div>
              <label className={LABEL}>{t('common.gender')}</label>
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
              />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 pb-6">
          <Link
            to={`/members/${id}`}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            {t('common.save')}
          </button>
        </div>
      </form>
    </div>
  )
}
