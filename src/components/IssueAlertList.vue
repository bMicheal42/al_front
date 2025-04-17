<template>
  <v-card class="inner-content">
    <v-card-text class="no-padding">
      <v-data-table
        :headers="internalHeaders"
        :items="items"
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
            @click="selectItem(alert, $event, 'TODO', false, item)"
          >
            <td
              :style="fontStyle"
            >
              <v-checkbox
                :input-value="isAlertSelected(alert)"
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
              <alert-column-content
                :is-child="true"
                :col="col"
                :item="alert"
                :parent="item"
                :is-dark="isDark"
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
                    color="#f1c232"
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
</template>

<script>
import i18n from '@/plugins/i18n'
import AlertsApi from '@/services/api/alert.service'
import AlertColumnContent from '@/components/AlertColumnContent.vue'
const internalHeaders = [
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
]

const internalColumns = [
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
]

export default {
  name: 'IssueAlertList',
  components: {
    AlertColumnContent
  },
  props: {
    selected: {
      type: Array,
      default: () => []
    },
    active: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      internalPagination: { sortBy: 'createTime', descending: true, rowsPerPage: 10 },
      items: [],
      internalHeaders,
      internalColumns,
    }
  },
  computed: {
    
    alertsMap() {
      return this.items.reduce((acc, cur) => {
        acc[cur.id] = cur
        return acc
      }, {})
    },
    isDark() {
      return this.$store.getters.getPreference('isDark')
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
    internalHeadersMap() {
      return this.internalHeaders.reduce((acc, header) => {
        acc[header.value] = header
        return acc
      }, {})
    },
  },
  mounted() {
    this.getItems()
  },
  methods: {
    isAlertSelected(alert) {
      return Boolean(this.$store.state.alerts.selectedTree[this.item.id]?.alert_ids.includes(alert.id))
    },
    lastNote(item) {
      const note = item.history.filter(h => h.type == 'note' || h.type == 'dismiss').pop()
      return note && note.type == 'note' ? note.text : ''
    },
    async getItems() {
      const res = await AlertsApi.getAlertsByIssueId(this.item.id)
      this.items = res.alerts
    },
    handleButtonClick(action, alertId) {
      console.log(action, alertId)
    },
    openDetailPage(item) {
      console.log(item)
    },
    isOpen(status) {
      return status === 'open'
    },
    isClosed(status) {
      return status === 'closed'
    },
    selectItem(item, event, selected, isIncident, incident) {
      if (event.altKey) {
        if (!hasPermissions('admin')) {
          return
        }

        this.openDetailPage(item)
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
    onAlertChecked(alert, issue) {
      this.$emit('select-alert', { alert, issue })
    }
  }
}
</script>
