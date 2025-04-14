<template>
  <div>
    <v-tooltip
      bottom
    >
      <v-btn
        slot="activator"
        icon
        class="btn--plain"
        @click="dialog = true"
      >
        <v-icon
          style="rotate: 90deg"
          color="#f1c232"
          :medium="true"
        >
          fa-search-plus
        </v-icon>
      </v-btn>
      <span>{{ $t('Merge in Incident') }}</span>
    </v-tooltip>   
    <merge-with-modal
      v-model="dialog"
      :selected="selected"
    />
  </div>
</template>

<script>
import MergeWithModal from './MergeWithModal.vue'

export default {
  components: {
    MergeWithModal
  },
  props: {
    selected: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      dialog: false
    }
  }
}
</script>