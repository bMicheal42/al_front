<template>
  <v-dialog
    :value="value"
    max-width="900"
    @input="handleDialogInput"
  >
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        <h2>
          Select an incident to merge with
        </h2>
      </v-card-title>
      <v-card-text>
        <div class="d-flex align-center">
          <v-text-field
            v-model="search"
            label="Search"
          />
          <div style="flex-grow: 0 !important">
            <v-btn
              icon
            >
              <v-icon @click="getItems">
                refresh
              </v-icon>
            </v-btn>
          </div>
        </div>
        <v-data-table
          :headers="headers"
          :items="items"
          :rows-per-page-items="[10, 20]"
          :loading="loading"
        >
          <template #items="{ item }">
            <tr
              class="row"
              @click="handleRowClick(item)"
            >
              <td>
                <v-checkbox
                  :value="Boolean(selectedIncident && selectedIncident?.id === item.id)"
                  primary
                  hide-details
                />
              </td>
              <td>
                <date-time
                  :value="item.createTime"
                  format="mediumDate"
                  custom-format="YYYY-MM-DD HH:mm:ss"
                />
              </td>
              <td>
                <date-time
                  :value="item.lastReceiveTime"
                  format="mediumDate"
                  custom-format="YYYY-MM-DD HH:mm:ss"
                />
              </td>
              <td>
                <alert-status-tag :status="item.status" />
              </td>
              <td>
                {{ item.text }}
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <div class="d-flex ml-auto">
          <v-spacer />
          <v-btn
            @click="handleDialogInput(false)"
          >
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!selectedIncident"
            @click="handleMerge"
          >
            {{ $t('Merge') }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import AlertsApi from '@/services/api/alert.service'
import DateTime from '@/components/lib/DateTime.vue'
import AlertStatusTag from '@/components/Alert/AlertStatusTag.vue'
import debounce from 'lodash.debounce'
import { alertModel } from '@/models/alert'

const headers = [
  { text: '', value: 'selected', sortable: false, width: '20px' },
  { text: 'Create Time', value: 'createTime', sortable: false, width: '100px' },
  { text: 'Last Alert Time', value: 'lastReceiveTime', sortable: false, width: '100px' },
  { text: 'Status', value: 'status', sortable: false, width: '100px' },
  { text: 'Incident Text', value: 'text', sortable: false },
]

export default {
  components: {
    AlertStatusTag,
    DateTime
  },
  props: {
    selected: {
      type: Array,
      required: true
    },
    value: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      headers,
      items: [],
      loading: false,
      selectedIncident: null,
      search: '',
    }
  },
  watch: {
    search: {
      handler() {
        console.log('q', this.search)
        this.getItems()
      },
    },
    value: {
      handler() {
        if (this.value) {
          this.getItems()
        } else {
          this.selectedIncident = null
        }
      },
    }
  },

  methods: {
    getItems:  debounce(async function() {
      try {
        this.loading = true
        const params = new URLSearchParams()
        params.append('page-size', 10)
        params.append('page', 1)
        params.append('sort-by', 'lastReceiveTime')
        params.append('q', this.search)

        const statuses = [alertModel.ALERT_STATUS.ESCALATED, alertModel.ALERT_STATUS.FIXING_BY_24_7, alertModel.ALERT_STATUS.OBSERVATION, alertModel.ALERT_STATUS.PENDING, alertModel.ALERT_STATUS.CLOSED]
        
        statuses.forEach(status => {
          params.append('status', status)
        })
        
        const response = await AlertsApi.getIncidents(params)

        this.items = response.incidents?.map(incident => ({
          id: incident.id,
          text: incident.text,
          description: incident.description,
          createTime: incident.createTime,
          lastReceiveTime: incident.lastReceiveTime,
          status: incident.status
        }))
        this.loading = false
      } catch (error) {
        console.error('Error fetching alerts: ', error)
        this.loading = false
      }
    }, 1000),
    handleRowClick(item) {
      if (this.selectedIncident?.id === item.id) {
        this.selectedIncident = null
      } else {
        this.selectedIncident = item
      }
    },
    handleDialogInput(value) {
      this.$emit('input', value)
    },
    async handleMerge() {
      try {
        await this.$store.dispatch('alerts/move', {
          movingObjects: this.selected,
          target: this.selectedIncident.id
        })
        this.$store.dispatch('notifications/success', 'Incident merged successfully')
        this.$store.dispatch('alerts/updateSelected', [])
        this.$store.dispatch('alerts/updateNestedSelected', {})
        this.selectedIncident = null

        this.$emit('input', false)
      } catch (error) {
        console.error('Error merging incidents: ', error)
        this.$store.dispatch('notifications/error', 'Error merging incidents')
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.alert-table {
  height: 400px;
}

.row {
  cursor: pointer;
}
</style>
