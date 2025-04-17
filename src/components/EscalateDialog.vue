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
                  :items="sortedGroups"
                  :label="$t('Group')"
                  clearable
                  autocomplete
                  outline
                  :loading="loading"
                  item-text="name"
                  item-value="id"
                  return-object
                >
                  <template v-slot:item="{ item, selected }">
                    <v-list-item-content>
                      <v-list-item-title :class="{ 'blue--text': item.isExternal, 'font-weight-bold': selected }">
                        <v-icon
                          v-if="selected"
                          small
                          color="green"
                          class="mr-2"
                        >
                          mdi-check
                        </v-icon>
                        {{ item.name }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </template>
                  <template v-slot:selection="{ item }">
                    <v-chip :color="item.isExternal ? 'blue lighten-4' : ''">
                      <span :class="{ 'blue--text text--darken-2': item.isExternal }">{{ item.name }}</span>
                    </v-chip>
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
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    // cортированный список групп, где выбранная группа будет первой
    sortedGroups() {
      if (!this.selectedGroup) {
        return this.ownerGroups
      }
      
      // сначала выбранная группа, потом все остальные
      return [
        ...this.ownerGroups.filter(g => g.id === this.selectedGroup.id),
        ...this.ownerGroups.filter(g => g.id !== this.selectedGroup.id)
      ]
    },
    // получаем значение тега Owner_1 из  для использования как дефолтная группа
    ownerFromTag() {
      // проверяем, что у нас есть алерты
      if (!this.items || this.items.length === 0) {
        return null
      }
      
      // Берем первый алерт
      const firstAlert = this.items[0]
      
      // Проверяем, что у алерта есть теги
      if (!firstAlert.tags || !Array.isArray(firstAlert.tags)) {
        return null
      }
            
      // Ищем тег Owner_1
      const ownerTag = firstAlert.tags.find(tag => {
        return typeof tag === 'string' && tag.startsWith('Owner_1:')
      })
      
      // Если нашли тег, извлекаем значение
      if (ownerTag) {
        const value = ownerTag.split(':')[1].trim()
        return value
      }
      return null
    }
  },
  watch: {
    value(val) {
      if (val) {
        this.fetchGroups()
      }
    },
    // Устанавливаем дефолтную группу, если она есть в props или в теге Owner_1
    ownerGroups(groups) {
      if (groups.length > 0) {
        // Сбрасываем выбор, если группы изменились
        this.selectedGroup = null
        
        // Определим владельца из тега заранее (для логирования)
        const ownerTagValue = this.ownerFromTag
        
        //  приоритет 1: defaultGroup из props (если указан)
        if (this.defaultGroup) {
          const group = groups.find(g => g.id === this.defaultGroup)
          if (group) {
           
            this.selectedGroup = group
            return
          } else {
          }
        }
        
        // приоритет 2: значение из тега Owner_1
        if (ownerTagValue) {
          const group = groups.find(g => g.id === ownerTagValue)
          if (group) {
            this.selectedGroup = group
            return
          } else {
          }
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
      // Логируем выбранную группу
      
      this.$emit('escalate', {
        items: this.items,
        escalation_group: this.selectedGroup ? this.selectedGroup.id : null
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
        
          
          // форматируем группы для выбора
          const groups = [
            ...Object.entries(internalGroups).map(([id, name]) => ({ id, name: id, isExternal: false })),
            ...Object.entries(externalGroups).map(([id, name]) => {
              // обрабатываем случай, когда name может быть массивом
              const displayName = Array.isArray(name) ? name[0] : name
              return { id, name: displayName, isExternal: true }
            })
          ]

          // сортируем группы по алфавиту по полю name
          groups.sort((a, b) => a.name.localeCompare(b.name))
          
          this.ownerGroups = groups
        })
        .catch(error => {
          
          // В случае ошибки, устанавливаем пустой массив групп
          this.ownerGroups = []
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script> 