<template>
  <div>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          class="btn--plain"
          :disabled="selectedAlerts.length === 0"
          v-bind="attrs"
          v-on="on"
          @click="handleButtonClick"
        >
          <v-icon
            color="#0F0"
            :size="32"
          >
            build
          </v-icon>
        </v-btn>
      </template>
      <span>{{ $t('Aidone') }}</span>
    </v-tooltip>
    <v-dialog
      v-model="dialog"
      max-width="500"
    >
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          {{ $t('Aidone') }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-textarea
              v-model="form.summary"
              :label="$t('AiDoneActions')"
              :rules="validationRules"
              auto-grow
              rows="3"
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
            color="blue"
            text
            @click="handleAcceptButtonClick"
          >
            {{ $t('Send') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  
<script>
import cloneDeep from 'lodash/cloneDeep'

const formDefaultValues = {
  summary: ''
}
  
export default {
  name: 'AiDoneButton',
  props: {
    selectedAlerts: {
      type: Array,
      default: () => []
    },
    ackTimeout: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      validationRules: [
        (v) => !!v || this.$i18n.t('FieldIsRequired')
      ],
      dialog: false,
      form: cloneDeep(formDefaultValues)
    }
  },
  watch: {
    dialog(val) {
      val && this.resetForm()
    }
  },
  methods: {
    bulkAidoneAlert() {
      if (this.selectedAlerts && this.selectedAlerts.length > 0) {
        this.selectedAlerts.forEach(alert => {
          if (alert.attributes?.incident) {
            this.$store.dispatch('alerts/takeAction', [
              alert.id,
              'aidone',
              this.form.summary,
              this.ackTimeout
            ])
          }
        })
        this.$emit('done-completed', this.selectedAlerts)
      }
      this.dialog = false
    },
    resetForm() {
      this.form = cloneDeep(formDefaultValues)
      this.$refs.form.resetValidation()
    },
    handleButtonClick() {
      this.dialog = true
    },
    handleAcceptButtonClick() {
      if (this.$refs.form.validate()) {
        this.bulkAidoneAlert()
      }
    },
    handleCancelButtonClick() {
      this.dialog = false
    }
  }
}
</script>

<style scoped>
.v-textarea {
  font-size: 14px;
}
</style>