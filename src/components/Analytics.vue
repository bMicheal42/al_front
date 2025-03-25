<template>
  <v-container
    class="analytics"
    style="min-width: 600px; justify-items: center"
  >
    <h1 class="mb-4">
      {{ $i18n.t('Analytics') }}
    </h1>
    <v-layout style="gap: 20px; flex-wrap: nowrap;">
      <v-btn-toggle
        v-model="currentSeverity"
        class="mb-4"
        style="width: 480px"
        mandatory
      >
        <v-btn
          value="total"
          :depressed="currentSeverity !== 'total'"
          :color="`${currentSeverity === 'total' ? 'gray' : ''}`"
          large
          @click="setSeverity('total')"
        >
          {{ $i18n.t('Total') }}
        </v-btn>
        <v-btn
          value="5"
          :depressed="currentSeverity !== '5'"
          :color="`${currentSeverity === '5' ? '#FF2749' : ''}`"
          large
          @click="setSeverity('5')"
        >
          <span class="icon-container">
            <img
              :src="'./icons/critical.svg'"
              class="icon"
              width="18"
              height="18"
            >
          </span>
          {{ $i18n.t('Critical') }}
        </v-btn>
        <v-btn
          value="4"
          :depressed="currentSeverity !== '4'"
          :color="`${currentSeverity === '4' ? '#ffa726' : ''}`"
          large
          @click="setSeverity('4')"
        >
          <span class="icon-container">
            <img
              :src="'./icons/high.svg'"
              class="icon"
              width="18"
              height="18"
            >
          </span>
          {{ $i18n.t('High') }}
        </v-btn>
        <v-btn
          value="3"
          :depressed="currentSeverity !== '3'"
          :color="`${currentSeverity === '3' ? '#00B872' : ''}`"
          large
          @click="setSeverity('3')"
        >
          <span class="icon-container">
            <img
              :src="'./icons/medium.svg'"
              class="icon"
              width="18"
              height="18"
            >
          </span>
          {{ $i18n.t('Medium') }}
        </v-btn>
      </v-btn-toggle>
      <v-layout style="gap: 20px; flex-wrap: nowrap; width: 500px;">
        <v-flex
          xs12
          sm6
        >
          <v-text-field
            v-model="startDate"
            :label="$i18n.t('Start')"
            type="datetime-local"
            class="custom-datepicker"
            :class="`${isDark ? 'lighter' : 'darker'}`"
          />
        </v-flex>

        <v-flex
          xs12
          sm6
        >
          <v-text-field
            v-model="endDate"
            :label="$i18n.t('End')"
            type="datetime-local"
            class="custom-datepicker"
            :class="`${isDark ? 'lighter' : 'darker'}`"
          />
        </v-flex>
      </v-layout>
      <v-btn
        color="gray"
        :loading="loadingRaw"
        large
        @click="downloadCsvRawData()"
      >
        <span class="download-icon"><v-icon :size="18">fa-download</v-icon></span>
        <span>{{ $i18n.t('DownloadAsCsv') }} (RAW)</span>
      </v-btn>
    </v-layout>
    <loading-icon v-if="!data && loading" />
    <v-layout
      v-if="data"
      style="gap: 20px; flex-wrap: wrap"
    >
      <v-flex
        v-for="(table, index) of tables"
        :key="index"
        cols="12"
      >
        <v-card>
          <v-card-title>{{ table.title }}</v-card-title>
          <v-data-table
            :headers="table.headers"
            :items="table.rows"
            :pagination.sync="table.pagination"
            :loading="loading"
            :must-sort="false"
            hide-actions
          >
            <template #items="props">
              <td
                v-for="(column, idx) in props.item"
                :key="idx"
                style="text-align: center;"
              >
                {{ column }}
              </td>
            </template>
          </v-data-table>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import i18n from '@/plugins/i18n'
import debounce from 'lodash/debounce'
import AnalyticsApi from '@/services/api/analytics.service'
import LoadingIcon from './common/LoadingIcon.vue'
import { ExportToCsv } from 'export-to-csv'

export default {
  components: {
    LoadingIcon
  },
  data() {
    return {
      loading: true,
      loadingRaw: false,
      currentSeverity: 'total',
      startDate: '',
      endDate: '',
      data: null,
      tables: []
    }
  },
  computed: {
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    timezone() {
      return this.$store.state.prefs.timezone
    }
  },
  watch: {
    startDate() {
      this.debouncedFetchData()
    },
    endDate() {
      this.debouncedFetchData()
    },
  },
  created() {
    this.setDefaultDates()
  },
  mounted() {
    this.updateTables()
  },
  methods: {
    setSeverity(severity) {
      this.currentSeverity = severity
      this.updateTables()
    },
    downloadCsvRawData: async function() {
      const params = {
        from: this.localDatetimeToIso(this.startDate),
        to: this.localDatetimeToIso(this.endDate)
      }
      const options = {
        fieldSeparator: ',',
        filename: `Alerta_RAW_${params.from.slice(0, 16).replace('T', ' ')}__${params.to.slice(0, 16).replace('T', ' ')}`,
        quoteStrings: '"',
        decimalSeparator: 'locale',
        showLabels: true,
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
      }
      this.loadingRaw = true
      try {
        const raw = await AnalyticsApi.getRawData(params)
        if (raw?.length) {
          const csvExporter = new ExportToCsv(options)
          csvExporter.generateCsv(raw)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching patterns:', error)
      } finally {
        this.loadingRaw = false
      }
    },
    updateTables() {
      if (!this.data) return
      this.tables = [
        this.createTable('Counts', this.getCountsData()),
        this.createTable('MTTD', this.getMttdData()),
        this.createTable('MTTU', this.getMttuData()),
        this.createTable('MTTR', this.getMttrData())
      ]
    },
    createTable(title, rows) {
      const titles = {
        'Counts': i18n.t('Counts'),
        'MTTD': i18n.t('MTTD'),
        'MTTU': i18n.t('MTTU'),
        'MTTR': i18n.t('MTTR'),
      }
      return {
        title: titles[title] || title,
        headers: this.getTableHeaders(title),
        rows,
        pagination: {
          sortBy: 'default',
          rowsPerPage: -1
        },
      }
    },
    getCountsData() {
      const severityData = this.data[this.currentSeverity]
      const rows = []
      for (let username in severityData) {
        if (username !== 'all') {
          const user = severityData[username].counts
          rows.push({
            username: username,
            alertsCount: severityData[username].alertsCount,
            wasGrouped: user.wasGrouped,
            wasNotGrouped: user.wasNotGrouped,
            incidents: user.incidents,
            duplicates: user.duplicates,
            falsePositives: user.falsePositives,
            flaps: user.flaps
          })
        }
      }
      if (severityData['all']) {
        const allUser = severityData['all'].counts
        rows.push({
          username: i18n.t('All'),
          alertsCount: severityData['all'].alertsCount,
          wasGrouped: allUser.wasGrouped,
          wasNotGrouped: allUser.wasNotGrouped,
          incidents: allUser.incidents,
          duplicates: allUser.duplicates,
          falsePositives: allUser.falsePositives,
          flaps: allUser.flaps
        })
      }
      return rows
    },
    getMttdData() {
      const severityData = this.data[this.currentSeverity]
      const rows = []
      for (let username in severityData) {
        if (username !== 'all') {
          const user = severityData[username].mttd
          rows.push({
            username: username,
            ackCount: user.ackCount,
            ackPercent: user.ackPercent,
            ackInSla: user.ackInSla,
            perc75: user.perc75,
            perc90: user.perc90,
            perc99: user.perc99
          })
        }
      }
      if (severityData['all']) {
        const allUser = severityData['all'].mttd
        rows.push({
          username: i18n.t('All'),
          ackCount: allUser.ackCount,
          ackPercent: allUser.ackPercent,
          ackInSla: allUser.ackInSla,
          perc75: allUser.perc75,
          perc90: allUser.perc90,
          perc99: allUser.perc99
        })
      }
      return rows
    },
    getMttrData() {
      const severityData = this.data[this.currentSeverity]
      const rows = []
      for (let username in severityData) {
        if (username !== 'all') {
          const user = severityData[username].mttr
          rows.push({
            username: username,
            totalAlerts: user.totalAlerts,
            resolvedAlerts: user.resolvedAlerts,
            resolvedPercent: user.resolvedPercent,
            resolvedMttrPerc50: user.resolvedMttrPerc50,
            resolvedMttrPerc90: user.resolvedMttrPerc90
          })
        }
      }
      if (severityData['all']) {
        const allUser = severityData['all'].mttr
        rows.push({
          username: i18n.t('All'),
          totalAlerts: allUser.totalAlerts,
          resolvedAlerts: allUser.resolvedAlerts,
          resolvedPercent: allUser.resolvedPercent,
          resolvedMttrPerc50: allUser.resolvedMttrPerc50,
          resolvedMttrPerc90: allUser.resolvedMttrPerc90
        })
      }
      return rows
    },
    getMttuData() {
      const severityData = this.data[this.currentSeverity]
      const rows = []
      for (let username in severityData) {
        if (username !== 'all') {
          const user = severityData[username].mttu
          rows.push({
            username: username,
            // totalIncidents: user.totalIncidents,
            confirmedProblems: user.confirmedProblems,
            confirmedProblemsMttuPerc75: user.confirmedProblemsMttuPerc75,
            confirmedProblemsMttuPerc90: user.confirmedProblemsMttuPerc90,
            falsePositives: user.falsePositives,
            falsePositivesMttuPerc75: user.falsePositivesMttuPerc75,
            falsePositivesMttuPerc90: user.falsePositivesMttuPerc90
          })
        }
      }
      if (severityData['all']) {
        const allUser = severityData['all'].mttu
        rows.push({
          username: i18n.t('All'),
          // totalIncidents: allUser.totalIncidents,
          confirmedProblems: allUser.confirmedProblems,
          confirmedProblemsMttuPerc75: allUser.confirmedProblemsMttuPerc75,
          confirmedProblemsMttuPerc90: allUser.confirmedProblemsMttuPerc90,
          falsePositives: allUser.falsePositives,
          falsePositivesMttuPerc75: allUser.falsePositivesMttuPerc75,
          falsePositivesMttuPerc90: allUser.falsePositivesMttuPerc90
        })
      }
      return rows
    },
    getTableHeaders(title) {
      switch (title) {
      case 'Counts':
        return [
          {text: i18n.t('Username'), value: 'username', align: 'center', sortable: true, width: 'auto' },
          {text: i18n.t('Alerts Count'), value: 'alertsCount', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('Was Grouped'), value: 'wasGrouped', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('Wasn\'t Grouped'), value: 'wasNotGrouped', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('Incidents'), value: 'incidents', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('Duplicates'), value: 'duplicates', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('False Positives'), value: 'falsePositives', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('Flaps'), value: 'flaps', align: 'center', sortable: true, width: 'auto'},
        ]
      case 'MTTD':
        return [
          {text: i18n.t('Username'), value: 'username', align: 'center', sortable: true, width: 'auto' },
          {text: i18n.t('Ack Count'), value: 'ackCount', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('Ack Percent'), value: 'ackPercent', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('Ack In SLA'), value: 'ackInSla', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('75thPercentile'), value: 'perc75', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('90thPercentile'), value: 'perc90', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('99thPercentile'), value: 'perc99', align: 'center', sortable: true, width: 'auto'}
        ]
      case 'MTTR':
        return [
          {text: i18n.t('Username'), value: 'username', align: 'center', sortable: true, width: 'auto' },
          {text: i18n.t('Total Alerts'), value: 'totalAlerts', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('Resolved Alerts'), value: 'resolvedAlerts', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('Resolved Percent'), value: 'resolvedPercent', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('50thPercentile'), value: 'resolvedMttrPerc50', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('90thPercentile'), value: 'resolvedMttrPerc90', align: 'center', sortable: true, width: 'auto'},
        ]
      case 'MTTU':
        return [
          {text: i18n.t('Username'), value: 'username', align: 'center', sortable: true, width: 'auto' },
          // {text: i18n.t('Total Incidents'), value: 'totalIncidents', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('Incidents'), value: 'confirmedProblems', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('75thPercentile'), value: 'confirmedProblemsMttuPerc75', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('90thPercentile'), value: 'confirmedProblemsMttuPerc90', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('False Positives'), value: 'falsePositives', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('75thPercentileFP'), value: 'falsePositivesMttuPerc75', align: 'center', sortable: true, width: 'auto'},
          {text: i18n.t('90thPercentileFP'), value: 'falsePositivesMttuPerc90', align: 'center', sortable: true, width: 'auto'},
        ]
      }
    },
    setDefaultDates() {
      const now = new Date()
      const dayOfWeek = now.getUTCDay()

      const monday = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - (dayOfWeek === 0 ? 13 : dayOfWeek + 6), // Смещаем на неделю назад
        0, 0, 0, 0
      ))

      const sunday = new Date(monday)
      sunday.setUTCDate(monday.getUTCDate() + 6)
      sunday.setUTCHours(23, 59, 59, 999)

      this.startDate = this.formatDateTime(monday)
      this.endDate = this.formatDateTime(sunday)
    },
    formatDateTime(date) {
      const timezone = this.timezone
      const pad = (num) => num.toString().padStart(2, '0')

      const year = timezone === 'utc' ? date.getUTCFullYear() : date.getFullYear()
      const month = timezone === 'utc' ? date.getUTCMonth() + 1 : date.getMonth() + 1
      const day = timezone === 'utc' ? date.getUTCDate() : date.getDate()
      const hours = timezone === 'utc' ? date.getUTCHours() : date.getHours()
      const minutes = timezone === 'utc' ? date.getUTCMinutes() : date.getMinutes()

      return `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}`
    },
    localDatetimeToIso(date) {
      if (!date) return undefined
      const timezone = this.timezone
      const d = new Date(date.toString())

      return timezone === 'local'
        ? d.toISOString()
        : new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString()
    },
    fetchData: async function() {
      const params = {
        from: this.localDatetimeToIso(this.startDate),
        to: this.localDatetimeToIso(this.endDate)
      }
      this.loading = true
      try {
        const answer = await AnalyticsApi.getAnalytics(params)
        this.data = answer?.calculated || null
        this.updateTables()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching patterns:', error)
      } finally {
        this.loading = false
      }
    },
    debouncedFetchData: debounce(function () {
      this.fetchData()
    }, 100),
  }
}
</script>

<style scoped>
.custom-datepicker.lighter ::-webkit-calendar-picker-indicator {
  filter: invert(100%);
  cursor: pointer;
}
.custom-datepicker {
  margin-top: 0;
}
.analytics ::v-deep(.v-btn-toggle) {
  max-width: 500px;
  display: flex;
  justify-content: space-around;
}
.analytics ::v-deep(.v-datatable th) {
  white-space: normal; word-break: break-word;
  padding: 2px 2px 2px 0;
}
.analytics ::v-deep(.v-datatable th:last-child) {
  white-space: normal; word-break: break-word;
  padding: 2px 10px 2px 2px;
}
.icon-container {
  transform: translate(-6px, 2px);
}
.download-icon {
  transform: translate(-8px, 0px);
}
</style>