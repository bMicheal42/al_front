<template>
  <v-form ref="form">
    <v-tabs
      v-model="activeTab"
      grow
    >
      <v-tab ripple>
        <v-icon>info</v-icon>&nbsp;{{ $i18n.t('Patterns') }}
      </v-tab>
      <v-tab-item
        :transition="false"
        :reverse-transition="false"
      >
        <!-- Patterns List -->
        <v-card
          flat
          class="pl-3"
        >
          <v-card-title
            d-flex
            style="justify-content: space-between"
          >
            <div class="headline">
              {{ $i18n.t('Patterns') }}
            </div>
            <v-btn
              v-has-perms="'admin'"
              color="primary"
              :loading="loading"
              @click="openModal()"
            >
              {{ $i18n.t('CreatePattern') }}
            </v-btn>
          </v-card-title>
          <v-card-actions>
            <v-container style="max-width: 100%">
              <v-data-table
                :headers="patternsHeaders"
                :items="patterns"
                :loading="loading"
                :pagination.sync="patternPagination"
                :rows-per-page-text="`${$i18n.t('RowsPerPage')}:`"
              >
                <template #items="props">
                  <tr>
                    <td>{{ props.item.id }}</td>
                    <td>{{ props.item.name }}</td>
                    <td style="max-width: 640px">
                      {{ props.item.sql_rule }}
                    </td>
                    <td>{{ props.item.priority }}</td>
                    <td>
                      <v-chip
                        small
                        label
                        :color="props.item.is_active ? 'success' : 'error'"
                        text-color="white"
                      >
                        {{ props.item.is_active ? $i18n.t('Yes') : $i18n.t('No') }}
                      </v-chip>
                    </td>
                    <td>
                      <v-btn
                        v-has-perms="'admin'"
                        icon
                        :loading="loading"
                        @click="openModal(props.item)"
                      >
                        <v-icon>edit</v-icon>
                      </v-btn>
                      <v-btn
                        v-has-perms="'admin'"
                        icon
                        :loading="loading"
                        @click="deletePattern(props.item.id)"
                      >
                        <v-icon color="error">
                          delete
                        </v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-container>
          </v-card-actions>
        </v-card>
      </v-tab-item>

      <v-tab ripple>
        <v-icon>history</v-icon>&nbsp;{{ $i18n.t('PatternsHistory') }}
      </v-tab>
      <v-tab-item
        :transition="false"
        :reverse-transition="false"
      >
        <!-- Patterns History -->
        <v-card
          flat
          class="pl-3"
        >
          <v-card-title>
            <div class="headline">
              {{ $i18n.t('PatternsHistory') }}
            </div>
          </v-card-title>
          <v-card-actions>
            <v-container style="max-width: 100%">
              <v-data-table
                :headers="historyHeaders"
                :items="history"
                :loading="loadingHistory"
                :pagination.sync="historyPagination"
                :rows-per-page-text="`${$i18n.t('RowsPerPage')}:`"
              >
                <template #items="props">
                  <tr>
                    <td>{{ props.item.id }}</td>
                    <td>{{ props.item.pattern_name }} (id: {{ props.item.pattern_id }})</td>
                    <td>
                      <div>
                        <span>
                          {{ props.item.alert_id }}
                        </span>
                        <v-btn
                          icon
                          :to="`/alert/${props.item.alert_id}`"
                        >
                          <v-icon small>
                            fa-eye
                          </v-icon>
                        </v-btn>
                      </div>
                    </td>
                    <td><v-icon>arrow_right</v-icon></td>
                    <td>
                      <div>
                        <span>
                          {{ props.item.incident_id }}
                        </span>
                        <v-btn
                          icon
                          :to="`/alert/${props.item.incident_id}`"
                        >
                          <v-icon small>
                            fa-eye
                          </v-icon>
                        </v-btn>
                      </div>
                    </td>
                    <td>{{ formatDate(props.item.create_time) }}</td>
                  </tr>
                </template>
              </v-data-table>
            </v-container>
          </v-card-actions>
        </v-card>
      </v-tab-item>

      <v-tab ripple>
        <v-icon>history</v-icon>&nbsp;{{ $i18n.t('AlertMoveHistory') }}
      </v-tab>
      <v-tab-item
        :transition="false"
        :reverse-transition="false"
      >
        <!-- Patterns History -->
        <v-card
          flat
          class="pl-3"
        >
          <v-card-title>
            <div class="headline">
              {{ $i18n.t('AlertMoveHistory') }}
            </div>
          </v-card-title>
          <v-card-actions>
            <v-container style="max-width: 100%">
              <v-data-table
                :headers="alertsMoveHistoryHeaders"
                :items="moveHistory"
                :loading="loadingMoveHistory"
                :server-items-length="totalHistoryCount"
                :pagination.sync="historyPagination"
                :rows-per-page-text="`${$i18n.t('RowsPerPage')}:`"
                @update:page="fetchHistory"
              >
                <template #items="props">
                  <tr>
                    <td>{{ props.item.id }}</td>
                    <td>
                      <div>
                        <span>
                          {{ props.item.incident_id }}
                        </span>
                        <v-btn
                          icon
                          :to="`/alert/${props.item.incident_id}`"
                        >
                          <v-icon small>
                            fa-eye
                          </v-icon>
                        </v-btn>
                      </div>
                    </td>
                    <td><v-icon>arrow_right</v-icon></td>
                    <td>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <span v-on="on">
                            {{ $i18n.t('Attributes') }}
                            <v-icon
                              small
                              style="margin-left: 8px;"
                            >
                              fa-eye
                            </v-icon>
                          </span>
                        </template>
                        <span style="white-space: pre; font-size: 15px;">
                          {{ props.item.attributes_updated }}
                        </span>
                      </v-tooltip>
                    </td>
                    <td>{{ props.item.user_name }}</td>
                    <td>{{ formatDate(props.item.create_time) }}</td>
                  </tr>
                </template>
              </v-data-table>
            </v-container>
          </v-card-actions>
        </v-card>
      </v-tab-item>
    </v-tabs>

    <!-- Modal for Create/Edit -->
    <v-dialog
      v-model="isModalOpen"
      max-width="700px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ editedPattern.id ? $i18n.t('EditPattern') : $i18n.t('CreatePattern') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container d-block>
            <v-layout column>
              <v-flex
                xs12
                sm6
              >
                <v-text-field
                  v-model="editedPattern.name"
                  :label="$i18n.t('PatternName')"
                  :disabled="loading"
                  outlined
                />
              </v-flex>
              <v-flex
                xs12
                sm6
              >
                <v-textarea
                  v-model="editedPattern.sql_rule"
                  :label="$i18n.t('SqlRule')"
                  :disabled="loading"
                  outlined
                />
              </v-flex>
              <v-flex
                xs12
                sm6
              >
                <v-text-field
                  v-model="editedPattern.priority"
                  :label="$i18n.t('Priority')"
                  type="number"
                  :disabled="loading"
                  outlined
                />
              </v-flex>
              <v-flex
                xs12
                sm6
              >
                <v-checkbox
                  v-model="editedPattern.is_active"
                  :label="$i18n.t('PatternActive')"
                  :disabled="loading"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions
          style="justify-content: space-between; padding-bottom: 20px; margin-inline: 30px"
        >
          <v-btn
            color="warning"
            :disabled="loading"
            @click="openTestModal"
          >
            {{ $i18n.t('TestRule') }}
          </v-btn>
          <div>
            <v-btn
              color="error"
              :disabled="loading"
              @click="closeModal"
            >
              {{ $i18n.t('Cancel') }}
            </v-btn>
            <v-btn
              v-has-perms="'admin'"
              color="success"
              :loading="loading"
              @click="savePattern"
            >
              {{ editedPattern.id ? $i18n.t('SavePattern') : $i18n.t('CreatePattern') }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="isTestModalOpen"
      max-width="1400px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ $i18n.t('TestPattern') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container
            d-flex
            style="max-width: 100%"
          >
            <v-layout
              column
              style="max-height: 320px; max-width: 740px; overflow-y: scroll"
            >
              <v-flex
                xs12
                sm6
              >
                <v-treeview
                  class="test-result-tree"
                  :items="treeData"
                  activatable
                  open-all
                  open-on-click
                />
              </v-flex>
            </v-layout>
            <v-layout column>
              <v-flex
                xs12
                sm6
              >
                <v-text-field
                  v-model="testAlertId"
                  :label="$i18n.t('AlertIdToTest')"
                  :disabled="testLoading"
                  outlined
                />
              </v-flex>
              <v-flex
                xs12
                sm6
              >
                <v-textarea
                  v-model="testSqlRule"
                  :label="$i18n.t('SqlRuleToTest')"
                  :disabled="loading"
                  outlined
                />
              </v-flex>
              <v-btn
                color="warning"
                :disabled="testLoading"
                :loading="testLoading"
                @click="testRule"
              >
                {{ $i18n.t('Test') }}
              </v-btn>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions
          style="justify-content: flex-end; padding-bottom: 20px; margin-inline: 30px"
        >
          <v-btn
            color="error"
            :disabled="loading"
            @click="closeTestModal"
          >
            {{ $i18n.t('Cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-form>
</template>

<script>
import PatternsApi from '@/services/api/patterns.service'
import AlertsApi from '@/services/api/alert.service'
import i18n from '@/plugins/i18n'

export default {
  data: () => ({
    loading: false,
    loadingHistory: false,
    loadingMoveHistory: false,
    testLoading: false,
    testSqlRule: '',
    isModalOpen: false,
    isTestModalOpen: false,
    treeData: [],
    patterns: [],
    moveHistory: [],
    history: [],
    testAlertId: '',
    totalHistoryCount: 0,
    activeTab: 0,
    patternPagination: { sortBy: 'id', descending: false, rowsPerPage: 10, page: 1 },
    historyPagination: { sortBy: 'id', descending: true, rowsPerPage: 10, page: 1 },
    moveHistoryPagination: { sortBy: 'id', descending: true, rowsPerPage: 10, page: 1 },
    editedPattern: {},
    originalPattern: {},
    historyHeaders: [
      { text: 'ID', value: 'id' },
      { text: i18n.t('Pattern'), value: 'pattern_name' },
      { text: i18n.t('AlertChild'), value: 'alert_id' },
      { text: '', value: 'arrow', sortable: false, width: '60px' },
      { text: i18n.t('IncidentParent'), value: 'incident_id' },
      { text: i18n.t('Date'), value: 'create_time' },
    ],
    alertsMoveHistoryHeaders: [
      { text: 'ID', value: 'id' },
      { text: i18n.t('IncidentParent'), value: 'incident_id' },
      { text: '', value: 'arrow', sortable: false, width: '60px' },
      { text: i18n.t('Attributes'), value: 'attributes_updated' },
      { text: i18n.t('User'), value: 'user_name' },
      { text: i18n.t('Date'), value: 'create_time' },
    ],
    patternsHeaders: [
      { text: 'ID', value: 'id' },
      { text: i18n.t('PatternName'), value: 'name' },
      { text: i18n.t('SqlRule'), value: 'sql_rule' },
      { text: i18n.t('Priority'), value: 'priority' },
      { text: i18n.t('PatternActive'), value: 'is_active' },
      { text: i18n.t('Actions'), value: 'actions', sortable: false },
    ],
  }),
  watch: {
    historyPagination: {
      handler() {
        this.fetchHistory()
      },
      deep: true,
    },
  },
  mounted() {
    this.fetchPatterns()
    this.fetchHistory()
    this.fetchMoveHistory()
  },
  methods: {
    // Fetch patterns for display
    async fetchPatterns() {
      this.loading = true
      try {
        this.patterns = await PatternsApi.getPatterns()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching patterns:', error)
      } finally {
        this.loading = false
      }
    },
    async setDefaultTestAlertId() {
      if (this.$store.state.alerts?.alerts?.length) {
        this.testAlertId = this.$store.state.alerts.alerts[0].id
      } else {
        await this.$store.dispatch('alerts/getIssues')
        if (this.$store.state.alerts?.alerts?.length) {
          this.testAlertId = this.$store.state.alerts.alerts[0].id
        }
      }

    },
    openModal(pattern = null) {
      this.isModalOpen = true
      if (pattern) {
        this.editedPattern = { ...pattern }
        this.originalPattern = { ...pattern }
      } else {
        this.editedPattern = { name: '', sql_rule: '', priority: 1, is_active: true }
        this.originalPattern = {}
      }
    },
    openTestModal() {
      this.isTestModalOpen = true
      if (this.editedPattern.sql_rule) {
        this.testSqlRule = this.editedPattern.sql_rule
      }
      this.testRule()
    },
    closeTestModal() {
      this.isTestModalOpen = false
    },
    formatTestResult(data) {
      const res = []

      res.push({
        id: 'Count',
        name: `${i18n.t('Count')}: ${ data?.pattern_duplicates?.length || 0 }`,
        children: undefined
      })

      if (data?.pattern_duplicates?.length) {
        data.pattern_duplicates.forEach((item, index) => {
          res.push({
            id: index,
            name: `${index + 1}. ${i18n.t('AlertId')}: ${ item?.id }`,
            children: [{
              id: index,
              name: JSON.stringify(item, null, 2),
              children: []
            }]
          })
        })
      }

      this.treeData = res
    },
    testRule() {
      if (!this.testAlertId) {
        this.treeData = [{
          id: 1,
          name: i18n.t('AlertIdIsRequired'),
          children: undefined,
        }]
        return
      }
      const alertId = this.testAlertId.trim()
      if (alertId.length !== 36) {
        this.treeData = [{
          id: 1,
          name: 'Alert ID must be 36 characters long',
          children: undefined,
        }]
        return
      }
      if (!this.testSqlRule) {
        this.treeData = [{
          id: 1,
          name: 'Test Sql Rule must be provided',
          children: undefined,
        }]
        return
      }
      this.testLoading = true

      PatternsApi.testPattern(this.testAlertId, this.testSqlRule)
        .then((response) => {
          this.formatTestResult(response)
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Error testing pattern:', error)
        })
        .finally(() => {
          this.testLoading = false
        })
    },
    closeModal() {
      this.isModalOpen = false
      this.editedPattern = { ...this.originalPattern }
    },
    async savePattern() {
      this.loading = true
      try {
        if (this.editedPattern.id) {
          await PatternsApi.updatePattern(this.editedPattern.id, this.editedPattern)
        } else {
          await PatternsApi.createPattern(this.editedPattern)
        }
        this.closeModal()
        this.fetchPatterns()
        this.$store.dispatch('notifications/showSnackbar', {
          success: true,
          timeout: 5000,
          text: `${i18n.t('Created')} ${i18n.t('Pattern').toLowerCase()}`
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error saving pattern:', error)
      }
    },
    // Delete a pattern
    async deletePattern(patternId) {
      try {
        this.loading = true
        await PatternsApi.deletePattern(patternId)
        this.loading = false
        this.fetchPatterns()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error deleting pattern:', error)
      }
    },
    // Fetch pattern history
    async fetchHistory() {
      this.loadingHistory = true
      const { page, rowsPerPage } = this.historyPagination
      const limit = ((rowsPerPage === -1) ? 1000 : rowsPerPage) * 2
      const offset = (page - 1) * rowsPerPage

      try {
        const response = await PatternsApi.getPatternsHistory(limit, offset)
        const already_presented_dict = this.history.reduce((acc, item) => {
          acc[item.id] = true
          return acc
        }, {})
        this.history = [
          ...this.history,
          ...(response?.history || []).filter(item => !already_presented_dict[item.id])
        ].sort((a, b) => b.id - a.id)
        this.historyPagination.totalItems = this.history.length

        if (this.history.length > 1) {
          this.testAlertId = this.history[0].alert_id
        } else {
          this.setDefaultTestAlertId()
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching history:', error)
      } finally {
        this.loadingHistory = false
      }
    },
    // Fetch alerts move history
    async fetchMoveHistory() {
      this.loadingMoveHistory = true
      const { page, rowsPerPage } = this.moveHistoryPagination
      const limit = ((rowsPerPage === -1) ? 1000 : rowsPerPage) * 2
      const offset = (page - 1) * rowsPerPage

      try {
        const response = await AlertsApi.getAlertMoveHistory(limit, offset)
        const already_presented_dict = this.moveHistory.reduce((acc, item) => {
          acc[item.id] = true
          return acc
        }, {})
        this.moveHistory = [
          ...this.moveHistory,
          ...(response?.history || []).filter(item => !already_presented_dict[item.id])
        ].sort((a, b) => b.id - a.id)
        this.historyPagination.totalItems = this.moveHistory.length
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching history:', error)
      } finally {
        this.loadingMoveHistory = false
      }
    },
    formatDate(date) {
      const dateObj = new Date(date)
      return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`
    },
  },
}
</script>

<style>
.test-result-tree .v-treeview-node .v-treeview-node .v-treeview-node__label {
  max-width: 400px;
  white-space: pre;
  color: orange;
}
</style>
