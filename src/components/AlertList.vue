<template>
  <!-- eslint-disable vue/no-use-v-if-with-v-for,vue/no-confusing-v-for-v-if -->
  <div>
    <v-data-table
      v-model="selected"
      :headers="customHeaders"
      :items="incidents"
      item-key="id"
      :pagination.sync="pagination"
      :total-items="pagination.totalItems"
      :rows-per-page-items="pagination.rowsPerPageItems"
      :loading="isLoading"
      class="alert-table"
      :class="[ displayDensity, { loading: isLoading } ]"
      :style="columnWidths"
      sort-icon="arrow_drop_down"
      :rows-per-page-text="`${$i18n.t('RowsPerPage')}:`"
      select-all
      :footer-props="{
        'items-per-page-text': 'Строк на странице:',
        'items-per-page-options': [10, 20, 50, 100],
      }"
    >
      <template #items="{ item, selected: rowSelected }">
        <tr
          :key="item.id"
          :style="{ 'background-color': isDark? '#616161':'white', 'cursor': 'pointer' }"
          class="sortableRow sortHandle hover-lighten"
          :class="{'incident-selected': selected.some(s => s.id === item.id)}"
          :data-id="item.id"
          :data-selected="rowSelected"
          data-incident
          @click="handleRowClick(item)"
        >
          <td
            class="text-no-wrap"
            :style="fontStyle"
          >
            <v-checkbox
              v-model="rowSelected"
              primary
              hide-details
              color="gray"
              class="select-box"
              :ripple="false"
              :size="fontSize"
              @click.stop
              @change="onIncidentChecked(item, rowSelected)"
            />
          </td>
          <td
            v-for="col in customHeaders"
            :key="col.value"
            :class="[col.class || '']"
            :style="fontStyle"
          >
            <column-content
              :col="col.value"
              :item="item"
              :is-dark="isDark"
              :is-expanded="isExpanded(item.id)"
              :get-incident-stats="getIncidentStats"
              :toggle-expand="toggleExpand"
              :get-incident-severity="getIncidentSeverity"
              :get-incident-last-receive-time="getIncidentLastReceiveTime"
              :get-incident-patterns="getIncidentPatterns"
              :show-notes-icon="showNotesIcon"
              :last-note="lastNote"
              @click.stop
            />
          </td>
        </tr>
        <!--NESTED TABLE START HERE-->
        <tr
          class="sortableRow tr-collapse"
          :class="{'tr-active': isExpanded(item.id)}"
          :data-id="item.id+'_nested'"
        >
          <td
            v-if="getAlertDuplicates(item).length > 0"
            :colspan="12"
            class="no-padding"
          >
            <v-card class="inner-content">
              <v-card-text class="no-padding">
                <v-data-table
                  v-if="isExpanded(item.id)"
                  :headers="internalHeaders"
                  :items="getAlertDuplicates(item, true)"
                  item-key="id"
                  :class="isDark ? 'nested-table-dark' : 'nested-table-light'"
                  hide-default-footer
                  :pagination.sync="internalPagination"
                  :rows-per-page-text="`${$i18n.t('RowsPerPage')}:`"
                >
                  <template #items="{ item: alert, selected }">
                    <tr
                      :key="alert.id"
                      :style="{ 'background-color': isDark ? '#706e6e' : '#f4f4f4' }"
                      @click="selectItem(alert, $event, nestedSelected[alert.id], false, item)"
                    >
                      <td
                        :style="fontStyle"
                      >
                        <v-checkbox
                          :input-value="nestedSelected[alert.id]"
                          primary
                          hide-details
                          color="gray"
                          class="select-box"
                          :ripple="false"
                          :size="fontSize"
                          @click.stop
                          @change="onAlertChecked(alert, item)"
                        />
                      </td>
                      <td
                        v-for="col in internalColumns"
                        :key="col"
                        :class="[internalHeadersMap[col].class || '']"
                      >
                        <column-content
                          :is-child="true"
                          :col="col"
                          :item="alert"
                          :parent="item"
                          :is-dark="isDark"
                          :show-notes-icon="showNotesIcon"
                          :alerts="alertsMap"
                          :last-note="lastNote"
                        />
                      </td>
                      <td>
                        <div
                          :key="alert.status"
                          :style="{ 'background-color': 'transparent'}"
                        >
                          <v-btn
                            v-if="!isClosed(alert.status)"
                            v-has-perms="'admin'"
                            flat
                            icon
                            smalls
                            class="btn--plain pa-0 ma-0"
                            title="Resolve (close)"
                            @click.stop="handleButtonClick('close', alert.id)"
                          >
                            <v-icon
                              :size="18"
                              color="#0F0"
                            >
                              fa-thumbs-up
                            </v-icon>
                          </v-btn>
                          <v-btn
                            v-has-perms="'admin'"
                            flat
                            icon
                            smalls
                            class="btn--plain pa-0 ma-0"
                            title="Undo (to prev status)"
                            @click.stop="handleButtonClick('undo', alert.id)"
                          >
                            <v-icon
                              :size="22"
                              color="#FF0"
                            >
                              undo
                            </v-icon>
                          </v-btn>
                          <v-btn
                            v-if="isOpen(alert.status)"
                            flat
                            icon
                            small
                            class="btn--plain pa-0 ma-0"
                            title="Ack"
                            @click.stop="handleButtonClick('ack', alert.id)"
                          >
                            <v-icon color="#0F0">
                              check
                            </v-icon>
                          </v-btn>
                        </div>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </td>
        </tr>
      </template>
      <template slot="no-data">
        <div class="text-xs-center loading-slot">
          <loading-icon v-if="isLoading" />
          <span v-if="!isLoading">{{ $t('NoDataAvailable') }}</span>
        </div>
      </template>
      <template #pageText="{pageStart, pageStop, itemsLength}">
        {{ pageStart }} - {{ pageStop }}
        {{ $t('Of') }} {{ itemsLength }}
        {{ pagination.alertItems ? `(${$t('Alerts')}: ${pagination.alertItems})` : '' }}
      </template>
    </v-data-table>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
import moment from 'moment'
import i18n from '@/plugins/i18n'
import ColumnContent from './ColumnContent.vue'
import LoadingIcon from './common/LoadingIcon.vue'
import { MultiDrag, Sortable } from 'sortablejs'
import Swap from '@/common/extensions/Swap.js'
import _ from 'lodash'

const multiDragPlugin = new MultiDrag()

const { utils: {
  select: multiDragSelect,
  deselect: multiDragDeselect,
} } = multiDragPlugin
Sortable.mount(multiDragPlugin, new Swap())

export default {
  components: {
    ColumnContent,
    LoadingIcon,
  },
  props: {
    alerts: {
      type: Array,
      default: () => []
    }
  },
  data: vm => ({
    internalPagination: { sortBy: 'createTime', descending: true, rowsPerPage: 10 },
    search: '',
    expanded: [],
    internalHeaders: [
      {text: '', value: '', align: 'center', sortable: false, width: 'auto', class: 'nested-table-header text-no-wrap'},
      {text: i18n.t('CreateTime'), value: 'createTime', align: 'left', sortable: true, width: 'auto', class: 'nested-table-header text-no-wrap'},
      {text: i18n.t('RecoveryTime'), value: 'recoveryTime', align: 'left', sortable: true, width: 'auto', class: 'nested-table-header text-no-wrap'},
      {text: i18n.t('Severity'), value: 'severity', align: 'left', sortable: true, width: 'auto', class: 'nested-table-header'},
      {text: i18n.t('Status'), value: 'status', align: 'left', sortable: true, width: 'auto', class: 'nested-table-header text-no-wrap'},
      {text: i18n.t('TimeInStatus'), value: 'timeInStatus', align: 'left', sortable: true, width: 'auto', class: 'nested-table-header text-no-wrap'},
      {text: i18n.t('Host'), value: 'event', align: 'left', sortable: true, width: 'auto', class: ['nested-table-header', 'text-no-wrap']},
      {text: i18n.t('PhysicalHost'), value: 'physicalHost', align: 'left', sortable: true, width: 'auto', class: 'nested-table-header text-no-wrap'},
      {text: i18n.t('Summary'), value: 'text', align: 'left', sortable: true, width: '400px', class: 'nested-table-header text-header header-mw-400'},
      {text: i18n.t('SystemAdmin'), value: 'serviceAdmin', align: 'left', sortable: true, width: 'auto', class: 'nested-table-header text-no-wrap'},
      {text: i18n.t('Service'), value: 'service', align: 'left', sortable: true, width: 'auto', class: 'nested-table-header'},
      {text: i18n.t('ProjectGroup'), value: 'group', align: 'left', sortable: true, width: 'auto', class: 'nested-table-header'},
      {text: '', value: '', align: 'left', sortable: false, width: 'auto', class: 'nested-table-header'}
    ],
    internalColumns: [
      'createTime',
      'recoveryTime',
      'severity',
      'status',
      'timeInStatus',
      'event',
      'physicalHost',
      'text',
      'serviceAdmin',
      'service',
      'group'
    ],
    headersMap: {
      createTime: { text: i18n.t('CreateTime'), value: 'createTime', class: 'text-no-wrap' },
      id: { text: i18n.t('AlertId'), value: 'id' },
      resource: { text: i18n.t('Resource'), value: 'resource', class: 'text-no-wrap'},
      event: {text: i18n.t('Event'), value: 'event', class: 'text-no-wrap'},
      environment: {text: i18n.t('Environment'), value: 'environment'},
      severity: {text: i18n.t('Severity'), value: 'severity'},
      correlate: {text: i18n.t('Correlate'), value: 'correlate'},
      status: {text: i18n.t('Status'), value: 'status'},
      timeInStatus: {text: i18n.t('TimeInStatus'), value: 'timeInStatus', class: 'text-no-wrap'},
      service: {text: i18n.t('Service'), value: 'service'},
      jiraKey: {text: i18n.t('JiraKey'), value: 'jiraKey', class: 'text-no-wrap header-w-126'},
      group: {text: i18n.t('Group'), value: 'group'},
      value: {text: i18n.t('Value'), value: 'value', class: 'value-header'},
      text: {text: i18n.t('Summary'), value: 'text', class: 'text-header header-mw-600'},
      tags: {text: i18n.t('Tags'), value: 'tags'},
      attributes: {text: i18n.t('Attribute'), value: 'attributes'},
      origin: {text: i18n.t('Origin'), value: 'origin'},
      type: {text: i18n.t('Type'), value: 'type'},
      timeout: {text: i18n.t('Timeout'), value: 'timeout'},
      timeoutLeft: {text: i18n.t('TimeoutLeft'), value: 'timeoutLeft'},
      dutyadmin: {text: i18n.t('Dutyadmin'), value: 'dutyadmin', class: 'text-no-wrap'},
      duplicateCount: {text: i18n.t('Dupl'), value: 'duplicateCount'},
      repeat: {text: i18n.t('Repeat'), value: 'repeat'},
      patterns: {text: i18n.t('Patterns'), value: 'patterns', sortable: false},
      previousSeverity: {text: i18n.t('PrevSeverity'), value: 'previousSeverity'},
      trendIndication: {text: i18n.t('TrendIndication'), value: 'trendIndication'},
      receiveTime: {text: i18n.t('ReceiveTime'), value: 'receiveTime', class: 'text-no-wrap'},
      duration: {text: i18n.t('Duration'), value: 'duration'},
      lastReceiveId: {text: i18n.t('LastReceiveId'), value: 'lastReceiveId'},
      lastReceiveTime: {text: i18n.t('LastReceiveTime'), value: 'lastReceiveTime', class: 'last-receive-time text-no-wrap'},
      note: {text: i18n.t('LastNote'), value: 'note', sortable: false}
    },
    details: false,
    selectedId: null,
    multiselect: false,
    temporaryCollapsed: null,
    temporaryCollapsingEnabled: false,
    dragNDropConfirmationEnabled: true,
    timer: null
  }),
  computed: {
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    incidents() {
      return this.alerts.filter(alert => alert.attributes['incident'])
    },
    displayDensity() {
      return (
        this.$store.getters.getPreference('displayDensity') ||
        this.$store.state.alerts.displayDensity
      )
    },
    fontStyle() {
      const font = this.$store.getters.getPreference('font')
      const color = this.isDark ? 'white' : 'black'
      return {
        'font-family': font['font-family'],
        'font-size': font['font-size'],
        'font-weight': font['font-weight'],
        'color': color
      }
    },
    fontSize() {
      return this.$store.getters.getPreference('font')['font-size']
    },
    columnWidths() {
      return {
        '--value-width': this.valueWidth() + 'px',
        '--text-width': this.textWidth() + 'px'
      }
    },
    isLoading() {
      return this.$store.state.alerts.isLoading
    },
    showNotesIcon() {
      return this.$store.getters.getPreference('showNotesIcon')
    },
    rowsPerPage() {
      return this.$store.getters.getPreference('rowsPerPage')
    },
    alertsMap() {
      return this.alerts.reduce((acc, cur) => {
        acc[cur.id] = cur
        return acc
      }, {})
    },
    pagination: {
      get() {
        return this.$store.state.alerts.pagination
      },
      set(value) {
        this.$store.dispatch('alerts/setPagination', value)
      }
    },
    actions() {
      return this.$config.actions
    },
    internalHeadersMap() {
      return this.internalHeaders.reduce((acc, header) => {
        acc[header.value] = header
        return acc
      }, {})
    },
    customHeaders() {
      return this.$config.columns.map(c =>
        this.headersMap[c] || {text: this.$options.filters.capitalize(c), value: 'attributes.' + c}
      )
    },
    selected: {
      get() {
        // console.log('get $store.state.alerts.selected', this.$store.state.alerts.selected)
        return this.$store.state.alerts.selected
      },
      set(value) {
        // console.log('set $store.state.alerts.selected', value)

        this.$store.dispatch('alerts/updateSelected', value)
      }
    },
    nestedSelected() {
      return this.$store.state.alerts.nestedSelected
    },
    ackTimeout() {
      return this.$store.getters.getPreference('ackTimeout')
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    username() {
      return this.$store.getters['auth/getUsername']
    }
  },
  watch: {
    rowsPerPage(val) {
      this.pagination = Object.assign({}, this.pagination, {rowsPerPage: val})
    },
  },
  mounted () {
    const _self = this
    this.$nextTick(() => {
      // .alerts .v-window > div > div:nth-child(2) .alert-table
      // .alerts .v-window > div > div:nth-child(1) .alert-table
      // FIXME think about how to handle this (can be several tables on the page)
      const sortable = Sortable.create(document.querySelector('.alert-table tbody'), {
        multiDragSelect,
        multiDragDeselect,
        // классы для трекинга элементов
        draggable: '.sortableRow',
        handle: '.sortHandle',
        selectedClass: 'incident-selected',

        // классы для стилизации
        swapClass: 'sortable-swap-highlight',     // класс для подсветки куда приземлимся
        fallbackClass: 'sortable-fallback',       // класс того что носим (под мышкой)
        ghostClass: 'sortable-ghost',             // класс того что осталось (на месте откуда таскаем)
        swap: true,
        dragoverBubble: true,                     // включить всплытие событий dragover
        forceFallback: true,
        // fallbackOnBody: true,                  // включить вставку в body
        // sort: false,                           // отключить сортировку
        delay: 100,
        touchStartThreshold: 70,
        // easing: 'cubic-bezier(1, 0, 0, 1)',
        dataIdAttr: 'data-id',
        multiDrag: true,
        multiDragKey: 'unrealKey',
        animation: 200,
        direction: 'vertical',
        onStart(event) { // temporary collapsing all expanded rows while dragging
          if (!_self.temporaryCollapsingEnabled) return

          this.temporaryCollapsed = [...document.querySelectorAll('.tr-collapse.tr-active')]
          this.temporaryCollapsed.forEach(row => row.classList.toggle('tr-active', false))
        },
        onEnd(event) {
          if (_self.temporaryCollapsingEnabled) { // expanding all expanded rows after dragging
            this.temporaryCollapsed.forEach(row => row.classList.toggle('tr-active', true))
            this.temporaryCollapsed = []
          }

          const dropZoneIncidentId = event.swapItem.dataset.id

          if (event.item.dataset.id === dropZoneIncidentId) return

          const draggedIncidentIds = new Set((event.item ? [event.item] : event.items).map(item => item.dataset.id))
          if (event.item && !_self.selected.find(item => item.id === event.item.dataset.id)) {
            const movedAlert = _self.alerts.find(alert => alert.id === event.item.dataset.id)
            if (movedAlert?.attributes?.['duplicate alerts']) {
              movedAlert.attributes['duplicate alerts'].forEach(id => draggedIncidentIds.add(id))
            }
          }
          if (_self.selected?.length) _self.selected.forEach(a => draggedIncidentIds.add(a.id))

          const draggedTableAlerts = _self.alerts.filter(alert => draggedIncidentIds.has(alert.id))
          const dropZoneIncident = _self.incidents.find(incident => incident.id === dropZoneIncidentId)

          sortable.sort(_self['incidents'], true)

          const selectedAlerts = Array.from(draggedTableAlerts)

          if (_self.dragNDropConfirmationEnabled) {
            const count = selectedAlerts.reduce((counter, alert) => {
              if (alert.id === event?.item?.dataset?.id) return counter
              if (alert.attributes?.['incident'] && alert.attributes?.['duplicate alerts']?.length) {
                return counter - (!_self.nestedSelected[alert.id] ? 1 : 0)
              }

              return counter
            }, selectedAlerts.length)

            let confirmText = `Moving ${ count } alerts. Are you sure?\n`

            if (!confirm(confirmText)) {
              return
            }
          }

          if (dropZoneIncident) _self.$shared.moveAlerts(dropZoneIncidentId, selectedAlerts.filter(a => a.attributes?.['incident']))
        },
      })
      _self.$shared.set('multiDragDeselect', multiDragDeselect)
      sortable.multiDrag.destroyGlobal()                  // turning off internal global listeners
      sortable.multiDrag._deselectMultiDrag = () => {}    // turning off default deselecting
      sortable.sort = function (presentedIncidents) {     // cleanUp function
        const array = Array.from(document.querySelectorAll('tr[data-incident]'))

        array.forEach(function (el) {
          const found = presentedIncidents.find(item => item.id === el.dataset.id)

          if (!found || !found?.attributes?.incident) {
            el.remove()
          }
        }, this)
      }
    })
  },
  methods: {
    handleRowClick(item) {
      this.toggleExpand(item.id)
    },
    onIncidentChecked(incident, selected) {
      const rowElement = document.querySelector(`[data-id="${incident.id}"]`)
      if (selected) {
        multiDragSelect(rowElement)
      } else {
        multiDragDeselect(rowElement)
      }
      const dublicates = this.getAlertDuplicates(incident, true)
      const newSelected = selected
        ? [...this.selected, ...dublicates]
        : this.selected.filter(item => !dublicates.some(duplicate => duplicate.id === item.id))

      const newNestedSelected = selected
        ? {...this.nestedSelected, ...dublicates.reduce((acc, alert) => ({...acc, [alert.id]: true}), {})}
        : {...this.nestedSelected, ...dublicates.reduce((acc, alert) => ({...acc, [alert.id]: false}), {})}

      this.$store.dispatch('alerts/updateNestedSelected', newNestedSelected)

      this.$store.dispatch('alerts/updateSelected', newSelected)
    },
    onAlertChecked(alert, incident) {
      const rowElement = document.querySelector(`[data-id="${incident.id}"]`)
      const selected = !this.nestedSelected[alert.id]

      if (selected) {
        this.$store.dispatch('alerts/updateNestedSelected', {...this.nestedSelected, [alert.id]: true})
        if (!this.selected.some(item => item.id === incident.id)) {
          const newSelected = [...this.selected, incident]
          if (alert.id !== incident.id) newSelected.push(alert)
          this.$store.dispatch('alerts/updateSelected', newSelected)
          multiDragSelect(rowElement)
        } else if (alert.id !== incident.id) {
          this.$store.dispatch('alerts/updateSelected', [...this.selected, alert])
        }
      } else {
        const newNestedSelected = {...this.nestedSelected, [alert.id]: false}
        this.$store.dispatch('alerts/updateNestedSelected', newNestedSelected)
        const duplicateIds = incident.attributes?.['duplicate alerts'] || []

        if (duplicateIds.every(id => !newNestedSelected[id]) && !newNestedSelected[incident.id]) {
          this.$store.dispatch('alerts/updateSelected', this.selected.filter(item => item.id !== incident.id && item.id !== alert.id))
          multiDragDeselect(rowElement)
        } else if (alert.id !== incident.id) {
          this.$store.dispatch('alerts/updateSelected', this.selected.filter(item => item.id !== alert.id))
        }
      }
    },
    handleButtonClick(action, alertId) {
      this.takeAction(alertId, action)
    },
    toggleExpand(id) { // FIXME move expanded to vuex and clean them after alert moving
      const index = this.expanded.indexOf(id)
      if (index > -1) {
        this.expanded.splice(index, 1)
      } else {
        this.expanded.push(id)
      }
    },
    isExpanded(id) {
      return this.expanded.includes(id)
    },
    getAlertDuplicates(alert, includeSelf = false) {
      const duplicateIds = alert.attributes?.['duplicate alerts'] || []

      if (!duplicateIds.length && !includeSelf) return []

      const idSet = new Set(duplicateIds)
      const checked = new Set()

      const duplicates = this.alerts.filter(alert => {
        if (idSet.has(alert.id) && !checked.has(alert.id)) {
          checked.add(alert.id)
          return true
        }
        return false
      })

      if (includeSelf) {
        duplicates.push(alert)
      }

      return duplicates
    },
    getIncidentStats(alert) {
      const alertTexts = []

      const duplicateAlerts = this.getAlertDuplicates(alert, true) || []
      const newAlerts = duplicateAlerts.filter(item => item.status === 'open').length
      const unresolvedAlerts = duplicateAlerts.filter(item => ['open', 'closed'].includes(item.status) === false).length
      const resolvedAlerts = duplicateAlerts.filter(item => item.status === 'closed').length

      if (newAlerts > 0) {
        alertTexts.push(`<span><span class="red-dot"></span>${i18n.t('NewAlerts')}: ${newAlerts}</span>`)
      }
      if (unresolvedAlerts > 0) {
        alertTexts.push(`${i18n.t('UnresolvedAlerts')}: ${unresolvedAlerts}`)
      }
      if (resolvedAlerts > 0) {
        alertTexts.push(`${i18n.t('ResolvedAlerts')}: ${resolvedAlerts}`)
      }

      return alertTexts.length ? ` ${alertTexts.join(' / ')}` : ''
    },
    getIncidentSeverity(incident) {
      const duplicateAlerts = this.getAlertDuplicates(incident, true)
      return duplicateAlerts.reduce((acc, { severity }) => {
        if ([acc, severity].includes('critical')) return 'critical'
        if ([acc, severity].includes('high')) return 'high'
        return acc
      }, 'medium')
    },
    getIncidentLastReceiveTime(incident) {
      const duplicateAlerts = this.getAlertDuplicates(incident, true)
      return duplicateAlerts.reduce((acc, alert) => {
        return moment(alert.lastReceiveTime).isAfter(acc) ? alert.lastReceiveTime : acc
      }, incident.lastReceiveTime)
    },
    getIncidentPatterns(incident) {
      const fieldsDictionary = {
        'Hostname': 'event',
        'Host': 'event',
      }
      const tags = {
        'Physical Host': 'Hardware:',
        'PhysicalHost': 'Hardware:',
      }
      let pattern = null
      const duplicateAlerts = this.getAlertDuplicates(incident, false)
      if (!duplicateAlerts.every(alert => {
        if (!pattern) pattern = alert.attributes?.pattern_name
        return alert.attributes?.pattern_name === pattern
      })) return []
      return [...new Set(incident?.attributes?.patterns || [])].map(pattern => {
        if (fieldsDictionary[pattern]) {
          const value = _.get(incident, fieldsDictionary[pattern])
          return `${pattern}:${value}`
        } else if (tags[pattern]) {
          const valueFull = incident.tags.find(tag => tag.startsWith(tags[pattern]))
          const value = valueFull ? valueFull.split(':')[1] : ''
          return `${pattern}:${value}`
        }
        return pattern
      })
    },
    duration(item) {
      return moment.duration(moment().diff(moment(item.receiveTime)))
    },
    timeoutLeft(item) {
      let ackedOrShelved = this.isShelved(item.status) || this.isAcked(item.status)
      let lastModified = ackedOrShelved && item.updateTime ? item.updateTime : item.lastReceiveTime
      let expireTime = moment(lastModified).add(item.timeout, 'seconds')
      return expireTime.isAfter() ? expireTime.diff(moment(), 'seconds') : moment.duration()
    },
    lastNote(item) {
      const note = item.history.filter(h => h.type == 'note' || h.type == 'dismiss').pop()
      return note && note.type == 'note' ? note.text : ''
    },
    valueWidth() {
      return this.$store.getters.getPreference('valueWidth')
    },
    textWidth() {
      return this.$store.getters.getPreference('textWidth')
    },
    severityColor(severity) {
      return this.$store.getters.getConfig('colors').severity[severity] || 'white'
    },
    selectItem(item, event, selected, isIncident, incident) {
      if (event.altKey) {
        window.open(`/alert/${item.id}`, '_blank')
        event.preventDefault()
        return event.stopPropagation()
      }
      if (event.metaKey || event.ctrlKey) {
        if (isIncident) {
          this.onIncidentChecked(item, !selected)
        } else {
          this.onAlertChecked(item, incident)
        }

        event.preventDefault()
        return event.stopPropagation()
      }
      if (!this.selected.length) {
        this.$emit('set-alert', item)
      }
    },
    isIncident(alert) {
      return alert?.attributes?.incident
    },
    isOpen(status) {
      return status === 'open' || status === 'NORM' || status === 'UNACK' || status === 'RTNUN'
    },
    isWatched(tags) {
      return tags ? tags.indexOf(`watch:${this.username}`) > -1 : false
    },
    isAcked(status) {
      return status === 'ack' || status === 'ACKED'
    },
    isShelved(status) {
      return status === 'shelved' || status === 'SHLVD'
    },
    isClosed(status) {
      return status === 'closed'
    },
    takeAction: throttle(function (id, action) {
      this.$store
        .dispatch('alerts/takeAction', [id, action, ''])
        .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 0, {leading: true, trailing: false}),
    ackAlert: debounce(function (id) {
      this.$store
        .dispatch('alerts/takeAction', [id, 'ack', '', this.ackTimeout])
        .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    shelveAlert: debounce(function (id) {
      this.$store
        .dispatch('alerts/takeAction', [id, 'shelve', '', this.shelveTimeout])
        .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    watchAlert: debounce(function (id) {
      this.$store
        .dispatch('alerts/watchAlert', id)
        .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    unwatchAlert: debounce(function (id) {
      this.$store
        .dispatch('alerts/unwatchAlert', id)
        .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    deleteAlert: debounce(function (id) {
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch('alerts/deleteAlert', id)
          .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    clipboardCopy(text) {
      let textarea = document.createElement('textarea')
      textarea.textContent = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    },
  }
}
</script>

<style>

.red-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: red;
  border-radius: 50%;
  margin-right: 2px;
  margin-bottom: 2px;
  vertical-align: middle;
  animation: blink 1s step-start 0s infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.button-show-details {
  font-size: .75rem;
  padding: 0.3rem 0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s, text-decoration 0.3s;
}

.button-show-details:hover {
  text-decoration: underline;
}

.alert-table .v-table th, td {
  padding: 0px 5px !important;
}

.alert-table table.v-table thead tr:first-of-type {
  height: 42px !important;
}

.incident-selected {
  background-color: rgba(115, 255, 99, 0.3) !important;
}

.sortable-swap-highlight {
  outline: 2px solid rgba(255, 255, 99, 0.4);
  background-color: rgba(255, 255, 99, 0.5) !important;
}

.sortable-ghost {
  background: rgba(0, 0, 0, 0.1) !important;
  /*opacity: 0.1;*/
}

.sortable-fallback {
  opacity: 0.75 !important;
  /*outline: 2px solid rgba(255, 255, 99, 0.4);*/
  background-color: rgba(255, 0, 99, 0.7) !important;
}

.value-header {
  width: var(--value-width);
  min-width: var(--value-width);
}

.text-header {
  width: var(--text-width);
  min-width: var(--text-width);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-w-126 {
  width: 126px !important;
}

.header-mw-600 {
  max-width: 600px !important;
}

.header-mw-400 {
  max-width: 400px !important;
}

.comfortable table.v-table tbody td, table.v-table tbody th {
  height: 42px;
}

.compact table.v-table tbody td, table.v-table tbody th {
  height: 34px;
}

.alert-table .v-table tbody td {
  border-top: 1px solid rgb(221, 221, 221);
}

i.trend-arrow {
  width: 24px !important;
}

div.select-box {
  width: 24px !important;
}

.label {
  font-weight: bold;
  line-height: 14px;
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  white-space: nowrap;
  vertical-align: baseline;
  background-color: #999999;
}

.label {
  padding: 1px 4px 2px;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;
}

.label-critical {
  background-color: #b94a48;
}

.label-major {
  background-color: #f89406;
}

.label-minor {
  background-color: #ffd700;
}

.label-warning {
  background-color: #3a87ad;
}

.label-normal,
.label-cleared,
.label-ok,
.label-informational {
  background-color: #468847;
}

.label-inverse {
  background-color: #333333;
}

.hover-lighten:hover {
  filter: brightness(0.87);
}

.btn--plain {
  height: auto;
  width: auto;
  margin: 0;
  padding: 8px;
  min-width: 0;
  font-size: 24px;
}

.btn--plain {
  padding: 0;
  opacity: 0.6;
}

.btn--plain:before {
  background-color: transparent !important;
  transition: none !important;
}

.btn--plain:hover {
  opacity: 1;
}

div.action-buttons {
  position: absolute;
  opacity: 0;
  right: 0;
  top: 0.5em;
  height: 2em;
}

tr:hover div.action-buttons {
  opacity: 1;
}

.no-padding {
  padding: 0 !important;
}

.alert-table.loading tr.v-datatable__progress {
  height: 3px;
}

.alert-table.loading .v-datatable__progress th {
  position: absolute;
  width: 100%;
}

.alert-table.loading div[role='progressbar'] {
  height: 3px;
}

.loading-slot {
  color: #ffa726;
}

.alert-table thead th,
.alert-table td {
  vertical-align: middle;
  width: auto;
}

/* main styles for nested table */

.nested-table-light table, .nested-table-dark table {
  border: 1px solid;
  border-collapse: collapse;
  width: 100%;
  max-width: 100%;
}

.nested-table-light thead tr, .nested-table-dark thead tr {
  height: 42px !important;
}
.nested-table-light .v-datatable__progress, .nested-table-dark .v-datatable__progress {
  display: none !important;
}
.nested-table-light th, .nested-table-dark th {
  font-weight: bold !important;
  padding: 10px;
  text-align: center;
  vertical-align: middle !important;
  height: inherit !important;
}

.nested-table-light td, .nested-table-dark td {
  padding: 10px;
  border-top: 0;
  border-bottom: 0;
  vertical-align: middle;
}

.nested-table-light table {
  border-color: #b7b7b7;
}

.nested-table-light th {
  background-color: #d3d3d3;
  color: #000 !important;
}

.nested-table-light td {
  background-color: #fff;
  color: #000;
}

.nested-table-light tr:nth-child(even) td {
  background-color: #efefef;
}

.nested-table-light tr:first-child td {
  border-top: 1px solid #b7b7b7;
}

.nested-table-light tr:last-child td {
  border-bottom: 1px solid #b7b7b7;
}

.nested-table-dark table {
  border-color: #5a5a5a;
}

.nested-table-dark th {
  background-color: #333;
  color: #fff !important;
}

.nested-table-dark td {
  background-color: #444;
  color: #fff;
}

.nested-table-dark tr:nth-child(even) td {
  background-color: #616161;
}

.nested-table-dark tr:first-child td {
  border-top: 1px solid #5a5a5a;
}

.nested-table-dark tr:last-child td {
  border-bottom: 1px solid #5a5a5a;
}

/* control buttons for nested table */

.nested-table-light .theme--light.v-datatable,
.nested-table-dark .theme--dark.v-datatable {
  height: 42px;
}

.nested-table-light .theme--light.v-datatable .v-datatable__actions,
.nested-table-light .theme--light.v-datatable .v-datatable__actions__select,
.nested-table-light .theme--light.v-datatable .v-datatable__actions__range-controls,
.nested-table-dark .theme--dark.v-datatable .v-datatable__actions,
.nested-table-dark .theme--dark.v-datatable .v-datatable__actions__select,
.nested-table-dark .theme--dark.v-datatable .v-datatable__actions__range-controls {
  font-weight: bold;
  min-height: inherit;
  height: inherit;
}

.nested-table-light .theme--light.v-datatable .v-datatable__actions,
.nested-table-dark .theme--dark.v-datatable .v-datatable__actions {
  border-width: 0 1px 1px 1px;
  border-style: solid;
}

.nested-table-light .theme--light.v-datatable .v-datatable__actions {
  background-color: #d3d3d3;
  border-color: #0000001f;
}

.nested-table-dark .theme--dark.v-datatable .v-datatable__actions {
  background-color: #333;
  border-color: #5a5a5a;
}

.tr-collapse:not(.tr-active) td {
  height: 0 !important;
  border-top: 0 !important;
}

.alert-table th .v-input--checkbox {
  display: none;
  pointer-events: none;
}

.tr-collapse .inner-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height .3s;
}

.tr-active .inner-content {
  transition: max-height .3s;
  max-height: 100%;
}

</style>
