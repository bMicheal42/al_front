<template>
  <v-tooltip top>
    <span
      slot="activator"
      class="text-no-wrap"
    >
      <template v-if="customFormat">
        {{ value | date(displayMode, customFormat) }}
      </template>
      <template v-else>
        {{ value | date(displayMode, formatString) }}
      </template>
    </span>
    <span>{{ value | date('utc', 'YYYY/MM/DD HH:mm:ss.SSS Z') }}</span>
  </v-tooltip>
</template>

<script>

import moment from 'moment'
import i18n from '@/plugins/i18n'
moment.locale(i18n.locale)

export default {
  props: {
    value: { type: String, required: true },
    format: { type: String, default: 'mediumDate' },
    customFormat: { type: String, default: null }
  },
  computed: {
    displayMode() {
      return this.$store.state.prefs.timezone
    },
    formatString() {
      return (
        this.$store.state.prefs.dates[this.format] ||
        this.$config.dates[this.format]
      )
    }
  }
}
</script>

<style></style>
