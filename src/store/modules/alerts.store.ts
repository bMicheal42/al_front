import AlertsApi from '@/services/api/alert.service'

import moment from 'moment'
import utils from '@/common/utils'
import { CancelTokenSource } from 'axios'
import { createNanoEvents } from '@/lib/emitter'

const namespaced = true

interface Events {
  fetchIssues(): void
}

export const emitter = createNanoEvents<Events>()


const state = {
  // new issue state start
  expandedIssues: [],
  selectedTree: {},
  // new issue state end


  isLoading: false,
  isSearching: false,
  isMoving: false,

  alerts: [],
  selected: [], // used by multi-select checkboxes
  nestedSelected: {}, // used by nested checkboxes
  environments: [],
  services: [],
  groups: [],
  tags: [],

  alert: {},
  notes: [],

  // not persisted
  isWatch: false,
  isKiosk: false,
  showPanel: false,
  displayDensity: 'comfortable', // 'comfortable' or 'compact'
  abort: {
    getIssues: null
  },

  // query, filter and pagination
  query: {}, // URLSearchParams
  filter: {
    // local defaults
    environment: null,
    ackedBy: null,
    text: null,
    status: ['open', 'ack'],
    customer: null,
    service: null,
    group: null,
    dateRange: [null, null]
  },

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'default',
    descending: false,
    rowsPerPageItems: [5, 10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_EXPANDED_ISSUES(state, issues) {
    state.expandedIssues = issues
  },
  SET_SELECTED_TREE(state, tree) {
    state.selectedTree = tree
  },
  SET_LOADING(state): any {
    state.isLoading = true
  },
  SET_SEARCH_QUERY(state, query): any {
    state.isSearching = true
    state.query = query
  },
  SET_ALERTS(state, [issues, total, pageSize, incidentTotal]): any {
    state.abort.getIssues = null
    state.isLoading = false
    state.isSearching = false
    state.alerts = issues
    state.issuesMap = issues.reduce((acc: any, issue) => {
      acc[issue.id] = issue
      return acc
    }, {})
    state.pagination.totalItems = incidentTotal
    state.pagination.alertItems = total
    state.pagination.rowsPerPage = pageSize
  },
  RESET_LOADING(state): any {
    state.isLoading = false
    state.isSearching = false
  },
  SET_KIOSK(state, isKiosk): any {
    state.isKiosk = isKiosk
  },
  SET_SELECTED(state, selected) {
    state.selected = selected
  },
  APPLY_MOVE(state, updates = {}, close_updates={}) {
    state.alerts = state.alerts.map(alert => {
      if (close_updates?.[alert.id]) return close_updates?.[alert.id]
      if (updates[alert.id]) {
        alert.attributes = {
          ...(alert?.attributes || {}),
          ...(updates?.[alert.id] || {})
        }
      }
      return alert
    })
  },
  SET_NESTED_SELECTED(state, selected) {
    state.nestedSelected = selected
  },
  SET_ALERT(state, alert): any {
    state.alert = alert
  },
  SET_NOTES(state, notes): any {
    state.notes = notes
  },
  SET_ENVIRONMENTS(state, environments): any {
    state.environments = environments
  },
  SET_SERVICES(state, services): any {
    state.services = services
  },
  SET_GROUPS(state, groups): any {
    state.groups = groups
  },
  SET_TAGS(state, tags): any {
    state.tags = tags
  },
  SET_SETTING(state, {s, v}) {
    state[s] = v
  },
  SET_FILTER(state, filter): any {
    state.filter = Object.assign({}, state.filter, filter)
    state.pagination.page = 1
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = Object.assign({}, state.pagination, pagination)
  },
  SET_PANEL(state, panel) {
    state.showPanel = panel
  },
  SET_ABORT_CONTROLLER(state, controller) {
    state.abort.getIssues = controller
  },
  ABORT_QUERY(state, name) {
    if (state.abort[name]) {
      state.abort[name].cancel('Too many search requests. Cancelling current query.')
      state.abort[name] = null
    }
  }
}

const actions = {
  makeMerge({commit, state}) {  
    // @ts-ignore
    const items = Object.entries(state.selectedTree).map(([issueId, data]) => ({ issue_id: issueId, alert_ids: data.alert_ids, all: data.all }))
    return AlertsApi.mergeIssues(items)
  },
  clearSelected({commit, state}) {
    commit('SET_SELECTED_TREE', {})
    commit('SET_SELECTED_ISSUES', [])
    commit('SET_SELECTED_ISSUE_ALERTS', [])
  },
  toggleIssueSelection({commit, state}, issue) {
    const hasIssue = Boolean(state.selectedTree[issue.id])

    // если элемент выбран, то переключаем выбор алертов
    if (hasIssue) {
      const selectedIssue = state.selectedTree[issue.id]
      // если все алерты выбраны, то удаляем ишью
      if (selectedIssue.all) {
        commit('SET_SELECTED_TREE', Object.fromEntries(Object.entries(state.selectedTree).filter(([key]) => key !== issue.id)))
      } else {
        commit('SET_SELECTED_TREE', {
          ...state.selectedTree,
          [issue.id]: {
            ...selectedIssue,
            all: true,
            alert_ids: issue.alerts
          }
        })
      }

      return
    }

    // если элемент выбран, и есть алерты, то переключаем выбор алертов
    commit('SET_SELECTED_TREE', {
      ...state.selectedTree,
      [issue.id]: {
        id: issue.id,
        all: true,
        alert_ids: issue.alerts
      }
    })
  },
  toggleIssueAlertSelection({commit, state}, { alert, issue }) {
    const selectedIssue = state.selectedTree[issue.id]
    const selectedIssueAlert = selectedIssue?.alert_ids.find(id => id === alert.id) ?? null

    // если элемент выбран, то переключаем выбор алертов
    if (selectedIssue) {
      if (selectedIssueAlert) {
        const isLastAlert = selectedIssue.alert_ids.length === 1

        if (isLastAlert) {
          commit('SET_SELECTED_TREE', Object.fromEntries(Object.entries(state.selectedTree).filter(([key]) => key !== issue.id)))
          return
        } 

        commit('SET_SELECTED_TREE', {
          ...state.selectedTree,
          [issue.id]: {
            ...selectedIssue,
            id: issue.id,
            all: false,
            alert_ids: selectedIssue.alert_ids.filter(id => id !== alert.id)
          }
        })

        return
      }

      commit('SET_SELECTED_TREE', {
        ...state.selectedTree,
          [issue.id]: {
            ...selectedIssue,
            id: issue.id,
            alert_ids: [...selectedIssue.alert_ids, alert.id]
          }
      })

      return
    }

    // если элемент не выбран, то добавляем его
    commit('SET_SELECTED_TREE', {
      ...state.selectedTree,
      [issue.id]: {
        id: issue.id,
        all: false,
        alert_ids: [alert.id]
      }
    })
  },

  getIssues({rootGetters, commit, state}) {
    commit('SET_LOADING')
    // get "lucene" query params (?q=)
    let params = new URLSearchParams(state.query)

    // append filter params to query params
    state.filter.environment && params.append('environment', state.filter.environment)
    state.filter.status && state.filter.status.map(st => params.append('status', st))
    state.filter.customer && state.filter.customer.map(c => params.append('customer', c))
    state.filter.service && state.filter.service.map(s => params.append('service', s))
    state.filter.group && state.filter.group.map(g => params.append('group', g))

    // add server-side sorting
    let sortBy = state.pagination.sortBy
    if (sortBy === 'default' || !sortBy) {
      sortBy = rootGetters['getConfig']('sort_by')
    }

    if (typeof sortBy === 'string') {
      params.append('sort-by', (state.pagination.descending ? '-' : '') + sortBy)
    } else {
      sortBy.map(sb => params.append('sort-by', sb))
    }

    // need notes from alert history if showing notes icons
    if (rootGetters.getPreference('showNotesIcon')) {
      params.append('show-history', 'true')
    }

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // apply any date/time filters
    if (state.filter.dateRange[0] > 0) {
      params.append(
        'from-date',
        moment.unix(state.filter.dateRange[0]).toISOString() // epoch seconds
      )
    } else if (state.filter.dateRange[0] < 0) {
      params.append(
        'from-date',
        moment().utc().add(state.filter.dateRange[0], 'seconds').toISOString() // seconds offset
      )
    }
    if (state.filter.dateRange[1] > 0) {
      params.append(
        'to-date',
        moment.unix(state.filter.dateRange[1]).toISOString() // epoch seconds
      )
    } else if (state.filter.dateRange[1] < 0) {
      params.append(
        'to-date',
        moment().utc().add(state.filter.dateRange[1], 'seconds').toISOString() // seconds offset
      )
    }

    if (state.filter.ackedBy) {
      params.append('acked-by', state.filter.ackedBy)
    }

    const setAbortToken = (controller) => {
      commit('SET_ABORT_CONTROLLER', controller)
    }

    commit('ABORT_QUERY', 'getIssues')

    emitter.emit('fetchIssues')

    return AlertsApi.getIssues(params, setAbortToken)
      .then(({issues, total, pageSize, incidentTotal}) => {
        return commit('SET_ALERTS', [issues, total, pageSize, incidentTotal])
      })
      .catch(err => {
        if (err.message !== 'Too many search requests. Cancelling current query.') commit('RESET_LOADING')
      })
  },
  toggleExpandedIssue({commit, state}, issueId) {
    const index = state.expandedIssues.indexOf(issueId)
      if (index > -1) {
        commit('SET_EXPANDED_ISSUES', state.expandedIssues.filter(id => id !== issueId))
      } else {
        commit('SET_EXPANDED_ISSUES', [...state.expandedIssues, issueId])
      }
  },
  abortGetAlerts({commit}) {
    commit('ABORT_QUERY', 'getIssues')
  },
  updateQuery({commit}, query) {
    commit('SET_SEARCH_QUERY', query)
  },
  updateKiosk({commit}, isKiosk) {
    commit('SET_KIOSK', isKiosk)
  },
  updateSelected({commit}, selected) {
    commit('SET_SELECTED', selected)
  },
  updateNestedSelected({commit, state}, selected) {
    commit('SET_NESTED_SELECTED', selected)
  },

  getAlert({commit}, alertId) {
    return AlertsApi.getAlert(alertId).then(({alert}) => {
      commit('SET_ALERT', alert)
    })
  },

  watchAlert({commit, dispatch, rootState}, alertId) {
    const username = rootState.auth.payload.preferred_username
    const tag = `watch:${username}`
    return AlertsApi.tagAlert(alertId, {tags: [tag]})
  },
  unwatchAlert({commit, dispatch, rootState}, alertId) {
    const username = rootState.auth.payload.preferred_username
    const tag = `watch:${username}`
    return AlertsApi.untagAlert(alertId, {tags: [tag]})
  },
  takeAction({commit, dispatch}, [alertId, action, text, timeout]) {
    return AlertsApi.actionAlert(alertId, {
      action: action,
      text: text,
      timeout: timeout
    })
  },
  takeBulkAction({commit, dispatch}, [alertIds, action, text, timeout]) {
    return AlertsApi.bulkActionAlerts({
      alert_ids: alertIds,
      action: action,
      text: text,
      timeout: timeout
    })
  },
  move({commit, dispatch}, {movingObjects, target}) {
    return AlertsApi.moveAlerts(movingObjects, target).then(answer => {
      if (answer && answer.status === 'ok' && answer.updates) {
        commit('ABORT_QUERY', 'getIssues')
        commit('APPLY_MOVE', answer.updates, answer.close_updates)
      }
    })
  },
  tagAlert({commit, dispatch}, [alertId, tags]) {
    return AlertsApi.tagAlert(alertId, tags)
  },
  untagAlert({commit, dispatch}, [alertId, tags]) {
    return AlertsApi.untagAlert(alertId, tags)
  },

  addNote({commit, dispatch}, [alertId, text]) {
    return AlertsApi.addNote(alertId, {
      text: text
    }).then(response => dispatch('getIssues'))
  },
  getNotes({commit}, alertId) {
    return AlertsApi.getNotes(alertId).then(({notes}) => {
      commit('SET_NOTES', notes)
    })
  },
  updateNote({commit, dispatch}, [alertId, noteId, note]) {
    return AlertsApi.updateNote(alertId, noteId, {
      note: note
    }).then(response => dispatch('getNotes'))
  },
  deleteNote({commit, dispatch}, [alertId, noteId]) {
    return AlertsApi.deleteNote(alertId, noteId).then(response => dispatch('getNotes', [alertId]))
  },

  deleteAlert({commit, dispatch}, alertId) {
    return AlertsApi.deleteAlert(alertId)
  },

  getEnvironments({commit, state}) {
    // get "lucene" query params (?q=)
    let params = new URLSearchParams(state.query)

    // append filter params to query params
    state.filter.status && state.filter.status.map(st => params.append('status', st))
    state.filter.customer && state.filter.customer.map(c => params.append('customer', c))
    state.filter.service && state.filter.service.map(s => params.append('service', s))
    state.filter.group && state.filter.group.map(g => params.append('group', g))

    // apply any date/time filters
    if (state.filter.dateRange[0] > 0) {
      params.append(
        'from-date',
        moment.unix(state.filter.dateRange[0]).toISOString() // epoch seconds
      )
    } else if (state.filter.dateRange[0] < 0) {
      params.append(
        'from-date',
        moment().utc().add(state.filter.dateRange[0], 'seconds').toISOString() // seconds offset
      )
    }
    if (state.filter.dateRange[1] > 0) {
      params.append(
        'to-date',
        moment.unix(state.filter.dateRange[1]).toISOString() // epoch seconds
      )
    } else if (state.filter.dateRange[1] < 0) {
      params.append(
        'to-date',
        moment().utc().add(state.filter.dateRange[1], 'seconds').toISOString() // seconds offset
      )
    }

    return AlertsApi.getEnvironments(params).then(({environments}) => commit('SET_ENVIRONMENTS', environments))
  },
  getServices({commit}) {
    return AlertsApi.getServices({}).then(({services}) => commit('SET_SERVICES', services))
  },
  getGroups({commit}) {
    return AlertsApi.getGroups({}).then(({groups}) => commit('SET_GROUPS', groups))
  },
  getTags({commit}) {
    return AlertsApi.getTags({}).then(({tags}) => commit('SET_TAGS', tags))
  },

  toggle({commit}, [s, v]) {
    commit('SET_SETTING', {s, v})
  },
  set({commit}, [s, v]) {
    commit('SET_SETTING', {s, v})
  },
  setFilter({commit}, filter) {
    commit('SET_FILTER', filter)
  },
  resetFilter({commit, rootState}) {
    commit('SET_FILTER', rootState.config.filter)
  },
  setPagination({commit}, pagination) {
    commit('SET_PAGINATION', pagination)
  },
  setPanel({commit}, panel) {
    commit('SET_PANEL', panel)
  }
}

const getters = {
  // TODO: refactor
  selectedIssues: (state) =>
    Object.values(state.selectedTree)
    .map((data: any) => {
      const issue = state.issuesMap[data.id] ?? null
      return {issue, ...data}
    }),
  
  selectedIssueById: (state, getters) => (id: string) => {
    return state.selectedTree[id] ?? null
  },
  issueById: (state, getters, rootState) => (id: string) => {
    return getters.issuesMap[id]?.issue ?? null
  },
  alerts: (state, getters, rootState) => {
    if (state.isWatch) {
      const username = rootState.auth.payload.preferred_username
      const tag = `watch:${username}`
      return state.alerts.filter(a => a.tags.includes(tag))
    } else {
      return state.alerts
    }
  },
  environments:
    (state, getters, rootState) =>
    (showAllowedEnvs = true) => {
      if (showAllowedEnvs) {
        return [
          ...new Set([...(rootState.config.environments || []), ...state.environments.map(e => e.environment)])
        ].sort()
      }
      return state.environments.map(e => e.environment).sort()
    },
  counts: state => {
    return state.environments.reduce(
      (grp, e) => {
        grp[e.environment] = e.count
        grp['ALL'] = grp['ALL'] + e.count
        return grp
      },
      {ALL: 0}
    )
  },
  services: state => {
    return state.services.map(s => s.service).sort()
  },
  groups: state => {
    return state.groups.map(g => g.group).sort()
  },
  tags: state => {
    return state.tags.map(t => t.tag).sort()
  },
  getHash: state => {
    let filterHash = utils.toHash(state.filter)
    let sortBy = state.pagination.sortBy ? state.pagination.sortBy : 'default'
    let descending = state.pagination.descending ? 1 : 0
    let paginationHash = `sb:${sortBy};sd:${descending}`
    let asiHash = `asi:${state.showPanel ? 1 : 0}`
    return `#${filterHash};${paginationHash};${asiHash}`
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
