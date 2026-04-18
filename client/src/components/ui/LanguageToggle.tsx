import { useTranslation } from 'react-i18next'
import { setLanguage } from '../../utils/i18n'
import type { Language } from '../../types'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const current = i18n.language as Language

  function toggle() {
    setLanguage(current === 'en' ? 'ar' : 'en')
  }

  return (
    <button
      onClick={toggle}
      className="text-sm font-medium text-zinc-400 hover:text-white transition px-2 py-1 rounded-md hover:bg-zinc-800"
    >
      {current === 'en' ? 'عربي' : 'EN'}
    </button>
  )
}
