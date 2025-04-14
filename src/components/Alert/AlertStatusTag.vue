<template>
  <span
    class="label"
    :style="{ backgroundColor: statusColor(status) }"
  >
    {{ status | capitalize }}
  </span>
</template>
<script>
import utils from '@/common/utils'
export default {
  props: {
    status: {
      type: String,
      required: true
    }
  },
  methods: {
    statusColor(status) {
      return utils.statusColor(status)
    }
  }
}
</script>