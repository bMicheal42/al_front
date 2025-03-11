import UsersApi from '@/services/api/user.service'
import stateMerge from 'vue-object-merge'
import i18n from '@/plugins/i18n'

const getDefaults = () => {
  const storedSettings = localStorage.getItem('prefs')
  if (storedSettings) return JSON.parse(storedSettings)
  return {
    isDark: false,
    isMute: true,
    languagePref: i18n.locale,
    audioURL: './audio/alert_high-intensity.ogg',
    dates: {
      longDate: null,
      mediumDate: null,
      shortTime: null
    },
    timezone: 'local', // 'local' or 'utc'
    displayDensity: null, // 'comfortable' or 'compact'
    showAllowedEnvs: false,
    showNotesIcon: false,
    font: {
      'font-family': null,
      'font-size': null,
      'font-weight': null
    },
    rowsPerPage: 20,
    valueWidth: 50, // px
    textWidth: 400, // px
    refreshInterval: 5 * 1000, // milliseconds
    ackTimeout: null,
    shelveTimeout: null,
    blackoutStartNow: true,
    blackoutPeriod: null,
    queries: []
  }
}

const state = getDefaults()

const mutations = {
  SET_PREFS(state, prefs) {
    stateMerge(state, prefs)
    localStorage.setItem('prefs', JSON.stringify(state))
  },
  RESET_PREFS(state) {
    let q = state.queries
    Object.assign(state, getDefaults())
    stateMerge(state, {queries: q})
    localStorage.setItem('prefs', JSON.stringify(state))
  },
  SET_QUERIES(state, queries) {
    stateMerge(state, {queries: queries || []})
    localStorage.setItem('prefs', JSON.stringify(state))
  },
  RESET_QUERIES(state) {
    Object.assign(state, {queries: []})
    localStorage.setItem('prefs', JSON.stringify(state))
  }
}

const actions = {
  getUserPrefs({dispatch, commit}) {
    return UsersApi.getMeAttributes()
      .then(({attributes}) => {
        commit('SET_PREFS', attributes.prefs)
      })
      .catch(error =>
        dispatch('notifications/error', Error('' + i18n.t('SettingsError')), {
          root: true
        })
      )
  },
  toggle({dispatch, commit}, [s, v]) {
    commit('SET_PREFS', {[s]: v})
    return UsersApi.updateMeAttributes({prefs: {[s]: v}}).then(() =>
      dispatch('notifications/success', i18n.t('SettingsSaved'), {
        root: true
      })
    )
  },
  setUserPrefs({dispatch, commit}, prefs) {
    commit('SET_PREFS', prefs)
    return UsersApi.updateMeAttributes({prefs: prefs}).then(() =>
      dispatch('notifications/success', i18n.t('SettingsSaved'), {
        root: true
      })
    )
  },
  resetUserPrefs({dispatch, commit}) {
    commit('RESET_PREFS')
    return UsersApi.updateMeAttributes({prefs: null}).then(() =>
      dispatch('notifications/success', i18n.t('SettingsReset'), {
        root: true
      })
    )
  },
  clearUserPrefs({commit}) {
    commit('RESET_PREFS')
  },
  getUserQueries({dispatch, commit}) {
    return UsersApi.getMeAttributes()
      .then(({attributes}) => {
        commit('SET_QUERIES', attributes.queries)
      })
      .catch(error =>
        dispatch('notifications/error', Error('' + i18n.t('SettingsError')), {
          root: true
        })
      )
  },
  addUserQuery({dispatch, state}, query) {
    let qlist = state.queries.filter(q => q.text != query.text).concat([query])
    return UsersApi.updateMeAttributes({queries: qlist})
      .then(response => dispatch('getUserQueries'))
      .then(() =>
        dispatch('notifications/success', i18n.t('SettingsSaved'), {
          root: true
        })
      )
  },
  removeUserQuery({dispatch, state}, query) {
    let qlist = state.queries.filter(q => q.text != query.text)
    return UsersApi.updateMeAttributes({queries: qlist})
      .then(response => dispatch('getUserQueries'))
      .then(() =>
        dispatch('notifications/success', i18n.t('SettingsSaved'), {
          root: true
        })
      )
  },
  resetUserQueries({dispatch, commit}) {
    commit('RESET_QUERIES')
    return UsersApi.updateMeAttributes({queries: null}).then(() =>
      dispatch('notifications/success', i18n.t('SettingsReset'), {
        root: true
      })
    )
  }
}

const getters = {
  getPreference: state => pref => {
    return state[pref]
  },
  getUserQueries: state => {
    return state.queries ? state.queries : []
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
