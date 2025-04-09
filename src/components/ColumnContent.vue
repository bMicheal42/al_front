<template>
  <div>
    <span v-if="col === 'createTime'">
      <date-time
        :value="item.createTime"
        format="mediumDate"
        custom-format="YYYY-MM-DD HH:mm:ss"
      />
    </span>
    <span v-if="col === 'lastReceiveTime'">
      <date-time
        :value="calculatedLastReceiveTime"
        format="mediumDate"
        custom-format="YYYY-MM-DD HH:mm:ss"
      />
    </span>
    <span v-if="col === 'resource'">
      {{ item.resource }}
    </span>
    <span v-if="col === 'event'">
      {{ item.event }}
    </span>
    <span v-if="col === 'physicalHost'">
      {{ physicalHost }}
    </span>
    <span v-if="col === 'serviceAdmin'">
      {{ serviceAdmin }}
    </span>
    <span v-if="col === 'service'">
      {{ infoSystem }}
    </span>
    <span v-if="col === 'group'">
      {{ projectGroup }}
    </span>
    <span v-if="col === 'environment'">
      {{ item.environment }}
    </span>
    <span v-if="col === 'severity'">
      <span class="icon-container">
        <img
          :src="severityIconScr"
          :alt="item.severity"
          :title="item.severity"
          class="icon"
          width="16"
          height="16"
        >
      </span>
    </span>
    <span
      v-if="col === 'status'"
    >
      <span
        class="label"
        :style="{ backgroundColor: statusColor(computedStatus) }"
        :title="`Alert status: ${item.status}`"
      >
        {{ computedStatus | capitalize }}
      </span>
      <span v-if="showNotesIcon">
        <span
          v-if="lastNote(item)"
          class="pl-2"
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                small
                v-on="on"
              >text_snippet</v-icon>
            </template>
            <span>{{ lastNote(item) }}</span>
          </v-tooltip>
        </span>
      </span>
    </span>
    <span v-if="col === 'timeInStatus'">
      {{ statusDurationInMinutesFormatted }}
    </span>
    <span
      v-if="col === 'dutyadmin' && item.attributes['acked-by']"
      class="label"
    >
      {{ item.attributes['acked-by'] }}
    </span>
    <span v-if="col === 'jiraKey' && item.attributes['jira_key'] && item.attributes['jira_url']">
      <v-tooltip
        :key="item.attributes['jira_key']"
        :disabled="!item.attributes['jira_status']"
        :color="computedJiraStatusColor"
        bottom
      >
        <template #activator="{ on: onTooltip }">
          <a
            :href="item.attributes['jira_url']"
            rel="noreferrer noopener"
            target="_blank"
            v-on="onTooltip"
            @click.stop
          >
            <v-chip
              label
              small
              :style="{
                backgroundColor: computedJiraStatusColor,
                fontSize: '12px',
                fontWeight: 700,
                color: '#FFFFFF'
              }"
            >
              {{ item.attributes['jira_key'] }}
            </v-chip>
          </a>
        </template>
        {{ computedJiraStatus | uppercase }}
      </v-tooltip>
    </span>
    <span
      v-if="col === 'patterns'"
      class="patterns"
    >
      <v-tooltip
        v-for="tag in calculatedPatterns"
        :key="tag"
        :color="patternColor(tag)"
        bottom
      >
        <template #activator="{ on: onTooltip }">
          <v-chip
            :color="patternColor(tag)"
            label
            small
            v-on="onTooltip"
            @click.stop="() => clickPattern(tag)"
          >
            <span
              class="pattern-tag"
            >
              {{ tag.split(':').join(': ') }}
            </span>
          </v-chip>
        </template>
        {{ tag.split(':').join(': ') }}
      </v-tooltip>
    </span>
    <span v-if="col === 'recoveryTime'">
      {{ calcResolveDurationInMinutes(item) }}
    </span>
    <span v-if="col === 'text'">
      <div style="display: flex; gap: 4px;">
        <div :class="['incident-info-wrapper', hasDuplicates && !isChild ? '' : 'incident-info-wrapper-full']">
          <v-tooltip
            bottom
            style="width: 100%"
            tag="span"
          >
            <template #activator="{ on: onTooltip, attrs }">
              <span style="text-overflow: ellipsis;overflow: hidden;">
                <a
                  v-if="!(hasDuplicates && !isChild) && computedZabbixLink"
                  :href="computedZabbixLink"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  @click.stop
                >
                  <span class="zabbix-link">
                    Z
                  </span>
                </a>
                <v-tooltip
                  v-if="!(hasDuplicates && !isChild) && item.attributes?.zabbix_description"
                  v-model="showDescription"
                  bottom
                  tag="span"
                >
                  <template #activator="{ on: onDescriptionTooltip, attrs }">
                    <v-icon
                      style="width: 20px; cursor: pointer; margin-left: 2px"
                      :color="isDark ? '#f4f4f4' : '#706e6e'"
                      small
                      @click.stop="onShowDescription"
                    >
                      info
                    </v-icon>
                  </template>
                  <div
                    ref="textSpan"
                    style="max-width: 700px; white-space: pre-line; cursor: pointer; padding: 6px 8px"
                    @click.stop="selectText"
                    v-html="formattedDescription"
                  />
                </v-tooltip>
                <span
                  v-if="!(hasDuplicates && !isChild)"
                  class="copy-btn"
                  @click.stop="copyText"
                >
                  <v-icon
                    v-if="!copied"
                    color="gray"
                    small
                  >
                    fa-copy
                  </v-icon>
                  <v-icon
                    v-if="copied"
                    color="green"
                    small
                  >
                    fa-thumbs-up
                  </v-icon>
                </span>
                <span
                  v-on="onTooltip"
                  v-html="item.text"
                />
              </span>
            </template>
            <div
              style="max-width: 400px; white-space: pre-line;"
            >
              {{ item.text }}
            </div>
          </v-tooltip>
          <div class="text-capitalize-first">
            <a
              v-if="(hasDuplicates && !isChild) && computedZabbixLink"
              :href="computedZabbixLink"
              target="_blank"
              rel="noopener noreferrer nofollow"
              @click.stop
            >
              <span class="zabbix-link">
                Z
              </span>
            </a>
            <v-tooltip
              v-if="hasDuplicates && !isChild && item.attributes?.zabbix_description"
              v-model="showDescription"
              bottom
              tag="span"
            >
              <template #activator="{ on: onDescriptionTooltip, attrs }">
                <v-icon
                  style="width: 20px; cursor: pointer; margin-left: 2px"
                  :color="isDark ? '#f4f4f4' : '#706e6e'"
                  small
                  @click.stop="onShowDescription"
                >
                  info
                </v-icon>
              </template>
              <div
                ref="textSpan"
                style="max-width: 700px; white-space: pre-line; cursor: pointer; padding: 6px 8px"
                @click.stop="selectText"
                v-html="formattedDescription"
              />
            </v-tooltip>
            <span
              v-if="hasDuplicates && !isChild"
              v-html="getIncidentStats(item)"
            />
            <span
              v-if="(hasDuplicates && !isChild)"
              class="copy-btn"
              @click.stop="copyText"
            >
              <v-icon
                v-if="!copied"
                color="gray"
                small
              >
                fa-copy
              </v-icon>
              <v-icon
                v-if="copied"
                color="green"
                small
              >
                fa-thumbs-up
              </v-icon>
            </span>
          </div>
        </div>
      </div>
    </span>
  </div>
</template>

<script>
import i18n from '@/plugins/i18n'
import DateTime from '@/components/lib/DateTime.vue'
import moment from 'moment/moment'
import utils from '@/common/utils'

export default {
  components: {DateTime},
  props: {
    col: {
      type: String,
      required: true,
    },
    item: {
      type: Object,
      required: true,
    },
    parent: {
      type: Object,
      default: (item) => item || null,
      required: false,
    },
    alerts: {
      type: Object,
      default: (item) => item || null,
      required: false
    },
    isDark: Boolean,
    isChild: Boolean,
    getIncidentStats: {
      type: Function,
      default: (item) => item.text || '',
    },
    isExpanded: Boolean,
    toggleExpand: {
      type: Function,
      default: () => () => {},
    },
    showNotesIcon: Boolean,
    lastNote: {
      type: Function,
      required: true,
    },
    getIncidentSeverity: {
      type: Function,
      default: (item) => item?.severity || 'medium',
    },
    getIncidentLastReceiveTime: {
      type: Function,
      default: () => '',
    },
    getIncidentPatterns: {
      type: Function,
      default: () => [],
    },
  },
  data() {
    return {
      statusDurationInMinutes: null,
      statusDurationInMinutesFormatted: '',
      showDescription: false,
      copied: false,
    }
  },
  computed: {
    severityIconScr() {
      const severity = this.calculatedSeverity.toLowerCase()
      switch (severity) {
      case 'critical':
        return './icons/critical.svg'
      case 'high':
        return './icons/high.svg'
      case 'medium':
        return './icons/medium.svg'
      default:
        return './icons/medium.svg'
      }
    },
    hasDuplicates() {
      const duplicateIds = this.item?.attributes['duplicate alerts']
      return !(!duplicateIds || duplicateIds.length === 0)
    },
    calculatedSeverity() {
      return !this.hasDuplicates ? this.item.severity : this.getIncidentSeverity(this.item)
    },
    calculatedLastReceiveTime() {
      return !this.hasDuplicates ? this.item.lastReceiveTime : this.getIncidentLastReceiveTime(this.item)
    },
    calculatedPatterns() {
      // return ['field1:value1', 'field2:value2']
      return !this.hasDuplicates ? ['Host:'+this.item.event] : this.getIncidentPatterns(this.item)
    },
    formattedDescription() {
      if (!this.item?.attributes?.zabbix_description) return ''

      return this.item.attributes.zabbix_description
        .replace(/<\!subteam\^[^>]+>/g, '') // Убираем Slack-спецсимволы
        .replace(
          /(https?:\/\/[^\s]+)/gi,
          '<a href="$1" target="_blank" style="text-decoration: underline;">[LINK]</a>'
        )
    },
    physicalHost() {
      const tag = this.item.tags?.find(tag => tag.startsWith('Hardware:'))
      if (!tag) return ''
      return tag.split(':')[1]
    },
    serviceAdmin() {
      const tag = this.item.tags?.find(tag => tag.startsWith('Owner_1:'))
      if (!tag) return ''
      return tag.split(':')[1]
    },
    infoSystem() {
      const tag = this.item.tags?.find(tag => tag.startsWith('InfoSystem:'))
      if (!tag) return ''
      return tag.split(':')[1]
    },
    projectGroup() {
      const tag = this.item.tags?.find(tag => tag.startsWith('ProjectGroup:'))
      if (!tag) return ''
      return tag.split(':')[1]
    },
    computedStatus() {
      if (!this.isChild || this.parent === this.item) return this.item?.status
      if (this.item?.status === 'open' || this.item?.status === 'closed') return this.item.status
      if (this.parent?.status === 'false-positive') return this.parent.status
      return 'ack'
    },
    computedJiraStatus() {
      return this.item?.attributes?.jira_status || ''
    },
    computedJiraStatusColor() {
      return utils.jiraStatusColor(this.computedJiraStatus)
    },
    computedZabbixLink() {
      const zabbix_id = this.item?.attributes?.zabbix_id
      const zabbix_trigger_id = this.item?.attributes?.zabbix_trigger_id
      if (zabbix_id && zabbix_trigger_id) {
        return `https://monitoring.sdventures.com/tr_events.php?triggerid=${zabbix_trigger_id}&eventid=${zabbix_id}`
      }
      return ''
    }
  },
  mounted() {
    if (this.col !== 'timeInStatus') return
    this.statusDurationInMinutes = this.initMoment(this.item)
    this.statusDurationInMinutesFormatted = this.calcStatusDurationInMinutes()
    this.interval = setInterval(() => {
      this.statusDurationInMinutesFormatted = this.calcStatusDurationInMinutes()
    }, 1000)
  },
  beforeDestroy() {
    if (this.col !== 'timeInStatus') return
    if (this.interval) {
      clearInterval(this.interval)
    }
  },
  methods: {
    patternColor(string) {
      if (string.startsWith('Host:') && !this.hasDuplicates) return '#818181'
      return utils.hashColor(string, this.isDark)
    },
    onShowDescription() {
      this.showDescription = !this.showDescription
    },
    selectText() {
      const range = document.createRange()
      const selection = window.getSelection()

      range.selectNodeContents(this.$refs.textSpan)
      selection.removeAllRanges()
      selection.addRange(range)
    },
    clickPattern(pattern) {
      if (!pattern || pattern.toLowerCase().includes('TriggerName')) return
      const replacer = {
        'PhysicalHost': 'Hardware',
        'Hostname': 'Host',
      }
      let [pattern_name, pattern_value] = pattern.split(':').map(v => v.trim())
      if (replacer[pattern_name]) pattern_name = replacer[pattern_name]
      const isHost = pattern_name === 'Host' || pattern_name === 'Hostname'

      if (pattern_name === 'ProjectGroup&InfoSystem') {
        const attributes = [];
        ['ProjectGroup', 'InfoSystem'].forEach(tagName => {
          const found = this.item.tags?.find(t => t?.startsWith(tagName + ':'))
          if (found) {
            let [tag_name, tag_value] = found.split(':').map(v => v.trim())
            attributes.push(['tags', tag_name, tag_value])
          }
        })
        return this.queryByMass(attributes)
      }
      this.queryBy(isHost ? 'event' : 'tags', isHost ? pattern_value : `${pattern_name}:${pattern_value}`)
    },
    statusColor(status) {
      return utils.statusColor(status)
    },
    initMoment() {
      const alert = this.item
      const notes = alert.history ? alert.history.map((h, index) => ({index: index, ...h})) : []
      const statusNotes = notes.filter(h => h.type !== 'note' && h.status === alert.status).pop()
      return moment(statusNotes?.updateTime || alert?.receiveTime)
    },
    formatDuration(duration) {
      const parts = []
      if (duration.days() > 0) parts.push(`${duration.days()}${i18n.t('ShortDays')}`)
      if (duration.hours() > 0) parts.push(`${duration.hours()}${i18n.t('ShortHours')}`)
      if (duration.minutes() > 0) parts.push(`${duration.minutes()}${i18n.t('ShortMinutes')}`)
      if (duration.seconds() > 0 || parts.length === 0) parts.push(`${duration.seconds()}${i18n.t('ShortSeconds')}`)

      return parts.join(' ')
    },
    calcStatusDurationInMinutes() {
      if (this.item.status === 'closed') return
      if (this.col !== 'timeInStatus') return
      const now = moment()
      const duration = moment.duration(now.diff(this.statusDurationInMinutes))

      return this.formatDuration(duration)
    },
    calculateAlertStatusDurations(history) {
      if (!history?.length) return {}

      const durations = {}
      let lastTime = new Date(history[0].updateTime)
      let lastStatus = history[0].status

      for (let i = 1; i < history.length; i++) {
        const current = history[i]
        const currentTime = new Date(current.updateTime)

        if (!durations[lastStatus]) {
          durations[lastStatus] = 0
        }

        durations[lastStatus] += (currentTime - lastTime)

        lastStatus = current.status
        lastTime = currentTime
      }

      return durations
    },
    copyText() {
      const textToCopy = this.item.text
      const textarea = document.createElement('textarea')
      textarea.value = textToCopy
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)

      this.copied = true
      setTimeout(() => {
        this.copied = false
      }, 5000)
    },
    queryBy(attribute, value) {
      // tags:"Hardware:22.0.0.104"
      this.$router.push({ path: `/alerts?q=${attribute}:"${value}"` })  // double-quotes (") around value mean exact match
      this.$store.dispatch('alerts/updateQuery', { q: `${attribute}:"${value}"` })
    },
    queryByMass(attributes = []) {
      const query = attributes.map(([fieldName, fieldParam, fieldValue]) => {
        if (fieldName === 'tags') return `${fieldName}:"${fieldParam}:${fieldValue}"`
      }).join(' AND ')
      const path = attributes.map(([fieldName, fieldParam, fieldValue]) => {
        if (fieldName === 'tags') return `${fieldName}%3A"${fieldParam}%3A${fieldValue}"`
      }).join('%20AND%20')

      this.$router.push({ path: `/alerts?q=${path}"` })  // double-quotes (") around value mean exact match
      this.$store.dispatch('alerts/updateQuery', { q: query })
    },
    sumResolutionDuration(statusDurations) {
      return Object.entries(statusDurations).reduce((acc, [status, duration]) => {
        return acc + (status === 'closed' ? 0 : duration)
      }, 0)
    },
    calcResolveDurationInMinutes(alert) {
      if (alert?.status !== 'closed') return

      const statusDurations = this.calculateAlertStatusDurations(alert.history)
      const noClosedDurationsSum = this.sumResolutionDuration(statusDurations)
      const duration = moment.duration(noClosedDurationsSum)

      if (this.parent === this.item) { // is 'incident' alert
        const child_ids = this?.item?.attributes?.['duplicate alerts'] || []
        const childs = child_ids.map(child_id => this.alerts?.[child_id])
        let allChildsIsClosed = childs.every(child => child?.status === 'closed')

        return `${allChildsIsClosed ? '' : '> '}${this.formatDuration(duration)}`
      }

      return this.formatDuration(duration)
    },
  }
}
</script>

<style scoped>
.button-show-details {
  height: 36px;
  width: 36px;
  padding: 4px;
  margin-top: 2px;
  font-size: 38px;
  line-height: 0;
}
.button-show-details:hover {
  cursor: pointer;
  text-decoration: none;
}
.button-show-details span {
  display: block;
}
.closed .vertical {
  transition: all 0.3s ease-in-out;
  transform: rotate(-90deg);
}
.incident-info-wrapper {
  display: flex;
  flex-direction: column;
  width: calc(100% - 40px);
}
.incident-info-wrapper-full {
  width: calc(100%);
}
.closed .horizontal {
  transition: all 0.3s ease-in-out;
  transform: rotate(-90deg);
  opacity: 1;
}
.opened {
  opacity: 1;
}
.opened .vertical {
  transition: all 0.3s ease-in-out;
  transform: rotate(90deg);
}
.opened .horizontal {
  transition: all 0.3s ease-in-out;
  transform: rotate(90deg);
  opacity: 0;
}
.patterns {
  display: flex;
  flex-wrap: wrap;
  margin-right: 20px;
  margin-left: -9px;
}
.pattern-tag {
  color: white;
  max-width: 180px;
  text-overflow: ellipsis;
  overflow: hidden;
}
.circle-plus .circle {
  position: relative;
  width: 28px;
  height: 28px;
}
.line {
  position: absolute;
  background-color: #333;
}
.circle-plus .circle .horizontal {
  width: 18px;
  height: 3px;
  left: 18%;
  top: 48%;
}
.circle-plus .circle .vertical {
  width: 3px;
  height: 18px;
  left: 45%;
  top: 22%;
}
.day-mode {
  background-color: rgba(0,0,0, 0.1);
}
.day-mode .line {
  background-color: #333;
}
.night-mode {
  background-color: rgba(255,255,255, 0.4);
}
.night-mode .line {
  background-color: #333;
}
.text-capitalize-first:first-letter {
  text-transform: capitalize;
}
.icon {
  margin-top: 1px;
}
.zabbix-link {
  display: inline-block;
  width: 16px;
  height: 18px;
  background: grey;
  color: white;
  text-align: center;
  font-weight: 700;
  border-radius: 4px;
  margin-right: 2px;
  margin-left: 5px;

}
div > a .zabbix-link {
  margin-left: 5px;
}
.copy-btn {
  margin-right: 4px;
  cursor: pointer;
  display: none;
}
</style>
