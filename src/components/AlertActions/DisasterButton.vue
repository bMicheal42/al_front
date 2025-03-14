<template>
  <div>
    <!-- v-has-perms="'admin'" -->
    <v-tooltip
      bottom
    >
      <v-btn
        slot="activator"
        icon
        class="btn--plain"
        @click="handleButtonClick"
      >
        <v-icon
          color="#F00"
          :size="32"
        >
          fa-exclamation-triangle
        </v-icon>
      </v-btn>
      <span>{{ $t('Disaster') }}</span>
    </v-tooltip>
    <v-dialog
      v-model="dialog"
      max-width="500"
    >
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          {{ $t('Are you sure you want to declare a disaster?') }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              v-model="form.summary"
              :label="$t('Summary *')"
              :rules="validationRules"
            />
            <v-select
              v-model="form.type"
              :label="$t('Disaster type *')"
              :items="disasterTypes"
              :rules="validationRules"
            />
            <v-text-field
              v-model="form.link"
              :label="$t('Slack link *')"
              :rules="validationRules"
            />
            <v-text-field
              v-model="form.time"
              :label="$t('Estimated time for decision *')"
              :rules="validationRules"
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="handleCancelButtonClick"
          >
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn
            color="red"
            text
            @click="handleConfirm"
          >
            {{ $t('I accept') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'

const disasterTypes = [
  { text: 'Critical', value: 'critical' },
  { text: 'Blocker', value: 'blocker' },
]

const formDefaultValues = {
  type: 'critical',
  link: null,
  time: null,
  summary: null,
}

export default {
  name: 'DisasterButton',
  options: {
    disasterTypes,
  },
  data() {
    return {
      validationRules: [
        (v) => !!v || this.$i18n.t('Field is required'),
      ],
      disasterTypes,
      dialog: false,
      form: cloneDeep(formDefaultValues),
    }
  },
  watch: {
    dialog (val) {
      !val && this.resetForm()
    },
  },
  methods: {
    resetForm() {
      this.form = cloneDeep(formDefaultValues)
      this.$refs.form.resetValidation()
    },
    handleButtonClick() {
      this.dialog = true
    },
    handleConfirm() {
      if (this.$refs.form.validate()) {
        this.dialog = false

        this.$emit('makeDisaster', this.form)
      }
    },
    handleCancelButtonClick() {
      this.dialog = false
    },
  },
}
</script>