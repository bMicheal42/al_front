<template>
  <v-dialog
    v-model="show"
    max-width="500px"
  >
    <v-form ref="form">
      <v-card>
        <v-card-title>
          <span class="headline">
            {{ $t('Escalate') }}
          </span>
        </v-card-title>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <p>{{ $t('PleaseChooseGroupForIncidentEscalation') }}</p>
                <p class="caption">
                  {{ $t('NoticeDefaultValueIsOwnerTag') }}
                </p>
              </v-flex>
              <v-flex xs12>
                <v-autocomplete
                  v-model="selectedGroup"
                  :items="ownerGroups"
                  :label="$t('Group')"
                  clearable
                  autocomplete
                  outline
                  :loading="loading"
                  item-text="name"
                  item-value="id"
                  return-object
                >
                  <template v-slot:item="{ item }">
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ item.name }}
                      </v-list-item-title>
                      <v-list-item-subtitle v-if="item.isExternal">
                        {{ $t('External') }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </template>
                </v-autocomplete>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            text
            @click="close"
          >
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :disabled="loading"
            @click="escalate"
          >
            {{ $t('Escalate') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import i18n from '@/plugins/i18n'

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      default: () => []
    },
    defaultGroup: {
      type: String,
      default: null
    }
  },
  data: () => ({
    selectedGroup: null,
    loading: false,
    ownerGroups: []
  }),
  computed: {
    show: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  watch: {
    value(val) {
      if (val) {
        this.fetchGroups()
      }
    },
    defaultGroup(val) {
      if (val && this.ownerGroups.length > 0) {
        const group = this.ownerGroups.find(g => g.id === val)
        if (group) {
          this.selectedGroup = group
        }
      }
    }
  },
  methods: {
    close() {
      this.show = false
      this.selectedGroup = null
    },
    escalate() {
      this.$emit('escalate', {
        items: this.items,
        group: this.selectedGroup ? this.selectedGroup.id : null
      })
      this.close()
    },
    fetchGroups() {
      this.loading = true
      
      // Получаем настройки групп из конфигурации
      const config = this.$store.getters.getConfig()
      const internalGroups = config.JIRA_OWNERS_GROUPS || {}
      const externalGroups = config.JIRA_EXT_OWNERS_GROUPS || {}
      
      // Форматируем группы для выбора
      const groups = [
        ...Object.entries(internalGroups).map(([id, name]) => ({ id, name, isExternal: false })),
        ...Object.entries(externalGroups).map(([id, name]) => ({ id, name, isExternal: true }))
      ]
      
      this.ownerGroups = groups
      
      // Устанавливаем дефолтную группу, если она есть
      if (this.defaultGroup) {
        const group = groups.find(g => g.id === this.defaultGroup)
        if (group) {
          this.selectedGroup = group
        }
      }
      
      this.loading = false
    }
  }
}
</script> 