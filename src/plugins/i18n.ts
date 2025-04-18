import Vue from 'vue'
import VueI18n from 'vue-i18n'

// import file language from @/locales
import {en} from '@/locales/en'
import {fr} from '@/locales/fr'
import {de} from '@/locales/de'
import {tr} from '@/locales/tr'
import {ru} from '@/locales/ru'

Vue.use(VueI18n)

const loadLocaleMessages = {
  en,
  ru,
  fr,
  de,
  tr
}

// variable navigator language
let language = (navigator.languages && navigator.languages[0]) || navigator.language

if (language.length > 2) {
  language = language.split('-')[0]
  language = language.split('_')[0]
}
// const localSettings = localStorage.getItem('prefs')
// const selectedLanguage = localSettings ? JSON.parse(localSettings)?.languagePref : false
const selectedLanguage = 'en'
// variable i18n for translation
const i18n = new VueI18n({
  locale: selectedLanguage || language, // use locale from local storage or navigator
  fallbackLocale: 'en', // set fallback locale
  messages: loadLocaleMessages
})

export default i18n
