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
      className="text-sm font-medium text-gray-500 hover:text-gray-900 transition px-2 py-1 rounded-md hover:bg-gray-100"
    >
      {current === 'en' ? 'عربي' : 'EN'}
    </button>
  )
}
