<template>
  <div class="settings">
    <patterns />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Patterns from '@/components/Patterns.vue'

@Component({
  components: {
    Patterns,
  }
})
export default class PatternsSettings extends Vue {}
</script>
