<template>
  <v-snackbar
    v-if="snackbar.timeout"
    v-model="show"
    auto-height
    :color="snackbar.type"
    :timeout="snackbar.timeout"
    top
  >
    {{ snackbar.text | capitalize }}
    <v-btn
      flat
      @click="close"
    >
      {{ snackbar.action }}
    </v-btn>
  </v-snackbar>
</template>

<script>
export default {
  data: () => ({
    show: false
  }),
  computed: {
    snackbar() {
      return this.$store.state.notifications.snackbars[0] || {}
    }
  },
  watch: {
    snackbar() {
      if (this.$store.getters['notifications/hasSnackbar']) {
        this.$nextTick(() => (this.show = true))
      }
    },
    show(val) {
      val || this.close()
    }
  },
  methods: {
    close() {
      this.show = false
      this.$store.dispatch('notifications/closeSnackbar')
    }
  }
}
</script>

<style></style>
