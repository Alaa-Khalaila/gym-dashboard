import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en.json'
import ar from '../locales/ar.json'
import { LANG_KEY } from '../constants'
import type { Language } from '../types'

const savedLang = (localStorage.getItem(LANG_KEY) as Language) ?? 'en'

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export function setLanguage(lang: Language) {
  i18n.changeLanguage(lang)
  localStorage.setItem(LANG_KEY, lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

// Apply on initial load
document.documentElement.lang = savedLang
document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr'

export default i18n
