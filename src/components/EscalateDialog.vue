<template>
  <v-dialog
    v-model="show"
    max-width="600px"
  >
    <v-card>
      <v-card-title class="text-h5 grey darken-2 white--text">
        <h2>
          {{ $t('Escalate') }}
        </h2>
      </v-card-title>

      <v-card-text class="pt-4">
        <p>{{ $t('PleaseChooseGroupForIncidentEscalation') }}</p>
        <p class="caption">
          {{ $t('NoticeDefaultValueIsOwnerTag') }}
        </p>
        
        <div class="mt-4">
          <v-autocomplete
            v-model="selectedGroup"
            :items="sortedGroups"
            :placeholder="$t('SelectGroup')"
            clearable
            outlined
            dense
            height="42px"
            :loading="loading"
            item-text="name"
            item-value="id"
            return-object
          >
            <template v-slot:item="{ item, selected }">
              <div class="v-list-item__content">
                <div :class="{ 'v-list-item__title': true, 'blue--text': item.isExternal, 'font-weight-bold': selected, 'yellow--text': selected }">
                  {{ item.name }}
                </div>
              </div>
            </template>
            <template v-slot:selection="{ item }">
              <v-chip :color="item.isExternal ? 'blue lighten-4' : ''">
                <span :class="{ 'blue--text text--darken-2': item.isExternal }">{{ item.name }}</span>
              </v-chip>
            </template>
          </v-autocomplete>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="d-flex ml-auto">
          <v-btn
            text
            @click="close"
          >
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            :disabled="loading || !selectedGroup"
            class="ml-2"
            @click="escalate"
          >
            {{ $t('Escalate') }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import i18n from '@/plugins/i18n'
import JiraService from '@/services/api/jira.service'

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
      get() { return this.value},
      set(value) { this.$emit('input', value) }
    },
    // cортированный список групп, где выбранная группа будет первой
    sortedGroups() {
      if (!this.selectedGroup) return this.ownerGroups
      
      // Используем sort для перемещения выбранной группы в начало
      return [...this.ownerGroups].sort((a, b) => 
        a.id === this.selectedGroup.id ? -1 : 
        b.id === this.selectedGroup.id ? 1 : 0
      )
    },
  },
  watch: {
    value(val) {
      if (val) {
        this.fetchGroups()
      }
    },
    // устанавливаем дефолтную группу, если она есть в props
    ownerGroups(groups) {
      this.selectedGroup = this.defaultGroup && groups.length 
        ? groups.find(g => g.id === this.defaultGroup) || null
        : null
    }
  },
  methods: {
    close() {
      this.show = false
      this.selectedGroup = null
    },
    escalate() {
      // логируем выбранную группу
      this.$emit('escalate', {
        items: this.items,
        escalation_group: this.selectedGroup?.name || null
      })
      this.close()
    },
    fetchGroups() {
      this.loading = true
      // получаем данные о владельцах Jira через API
      JiraService.getJiraOwners()
        .then(response => {
          // получаем группы из ответа API
          const internalGroups = response.owners?.internal_owners || {}
          const externalGroups = response.owners?.external_owners || {}
           
          // форматируем группы для выбора + алфавитная сортировка
          this.ownerGroups = [
            ...Object.entries(internalGroups).map(([id]) => ({ 
              id, name: id, isExternal: false 
            })),
            ...Object.entries(externalGroups).map(([id, name]) => ({ 
              id, 
              name: Array.isArray(name) ? name[0] : name, 
              isExternal: true 
            }))
          ].sort((a, b) => a.name.localeCompare(b.name))
        }).catch(error => {
          console.log('Error fetching owner_groups:', error)
          // в случае ошибки, устанавливаем пустой массив групп
          this.ownerGroups = []
        })
        .finally(() => this.loading = false)
    }
  }
}
</script>

<style scoped>
.v-list-item {
  min-height: 36px !important;
}

.v-text-field.v-text-field--outlined input {
  margin-top: 0;
}

.v-chip {
  margin: 0;
}

/* Увеличиваем высоту input поля */
.v-input.v-autocomplete {
  font-size: 14px;
}

.v-input.v-autocomplete .v-input__slot {
  min-height: 58px !important;
}

.v-input.v-autocomplete .v-select__selections {
  padding-top: 8px;
}

/* стили для элементов выпадающего списка */
.v-list-item__content {
  padding: 8px 0;
}

.v-list-item__title {
  font-size: 14px;
}
</style> 