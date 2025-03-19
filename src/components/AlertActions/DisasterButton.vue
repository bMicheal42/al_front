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
        :disabled="!selectedIncident"
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
            @click="handleAcceptButtonClick"
          >
            {{ $t('I accept') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="confirmDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          {{ $t('You are strongly sure you want to declare a disaster?') }}
        </v-card-title>
        <v-card-text>
          <div class="d-flex justify-end">
            <v-btn
              text
              @click="handleConfirmCancel"
            >
              {{ $t('No') }}
            </v-btn>
            <v-btn
              color="red"
              text
              @click="handleConfirm"
            >
              {{ $t('Yes') }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

const DISASTER_TYPES = {
  CRITICAL: 'CRITICAL',
  BLOCKER: 'BLOCKER',
}

const disasterTypes = [
  { text: 'Critical', value: DISASTER_TYPES.CRITICAL },
  { text: 'Blocker', value: DISASTER_TYPES.BLOCKER },
]

const formDefaultValues = {
  type: DISASTER_TYPES.CRITICAL,
  link: null,
  time: null,
  summary: null,
}

export default {
  name: 'DisasterButton',
  props: {
    selectedIncident: {
      type: Object,
      default: null,
    },
  },
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
      confirmDialog: false,
      form: cloneDeep(formDefaultValues),
    }
  },
  watch: {
    dialog (val) {
      val && this.resetForm()
    },
  },
  methods: {
    resetForm() {
      this.form = merge(cloneDeep(formDefaultValues), { summary: this.selectedIncident?.text ?? '' })
      this.$refs.form.resetValidation()
    },
    handleButtonClick() {
      this.dialog = true
    },
    handleAcceptButtonClick() {
      if (this.$refs.form.validate()) {
        this.confirmDialog = true
      }
    },
    handleConfirm() {
      this.$emit('makeDisaster', this.form)
    },
    handleConfirmCancel() {
      this.confirmDialog = false
    },
    handleCancelButtonClick() {
      this.confirmDialog = false
      this.dialog = false
    },
  },
}
</script>