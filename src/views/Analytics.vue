<template>
  <div class="settings">
    <analytics />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Analytics from '@/components/Analytics.vue'

@Component({
  components: {
    Analytics,
  }
})
export default class AnalyticsSettings extends Vue {}
</script>
