<template>
  <v-app
    id="alerta"
    :dark="isDark"
    :class="{'fixed-top-toolbar': isFixed}"
  >
    <div v-if="!isKiosk">
      <v-navigation-drawer
        v-if="isLoggedIn || !isAuthRequired || isAllowReadonly"
        v-model="drawer"
        :clipped="$vuetify.breakpoint.lgAndUp"
        disable-resize-watcher
        fixed
        app
      >
        <v-toolbar
          :color="isDark ? '#616161' : '#eeeeee'"
          clipped-left
          :flat="!isFixed"
        >
          <v-toolbar-side-icon @click.stop="drawer = !drawer" />

          <router-link
            to="/"
            class="toolbar-title"
          >
            <img
              v-if="$config.site_logo_url"
              :src="$config.site_logo_url"
              height="48"
            >
            <v-toolbar-title
              v-else
              class="logo"
            >
              valera
            </v-toolbar-title>
          </router-link>
        </v-toolbar>

        <v-divider />
        <v-list dense>
          <template v-for="(item, index) in items">
            <v-list-tile
              v-if="item.icon && item.show"
              :key="item.text"
              v-has-perms="item.perms"
              :to="item.path"
            >
              <v-list-tile-action>
                <v-icon :style="`rotate: ${item.rotate ? '90deg' : 'unset'}`">
                  {{ item.icon }}
                </v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ item.text }}
                  <v-icon
                    v-if="item.appendIcon"
                    small
                  >
                    {{ item.appendIcon }}
                  </v-icon>
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-list-group
              v-else-if="item.queries && item.queries.length > 0"
              :key="item.text"
              :prepend-icon="item.model ? item.icon : item['icon-alt']"
              sub-group
              no-action
            >
              <template v-slot:activator>
                <v-list-tile>
                  <v-list-tile-title>
                    {{ item.text }}
                  </v-list-tile-title>
                </v-list-tile>
              </template>
              <v-list-tile
                v-for="(q, i) in item.queries"
                :key="i"
                @click="submitSearch(q.query)"
              >
                <v-list-tile-title v-text="q.text" />
                <v-list-tile-action>
                  <v-icon
                    small
                    @click.stop="deleteSearch(q)"
                    v-text="q.icon"
                  />
                </v-list-tile-action>
              </v-list-tile>
            </v-list-group>

            <v-divider
              v-else-if="item.divider"
              :key="index"
            />
          </template>
        </v-list>
      </v-navigation-drawer>

      <v-toolbar
        v-if="selected.length === 0"
        :color="isDark ? '#616161' : '#eeeeee'"
        flat
        class="mb-1"
      >
        <v-toolbar-side-icon
          @click.stop="drawer = !drawer"
        />

        <router-link
          to="/"
          class="toolbar-title"
        >
          <img
            v-if="$config.site_logo_url"
            :src="$config.site_logo_url"
            height="48"
          >
          <v-toolbar-title
            v-else
            class="logo"
          >
            valera
          </v-toolbar-title>
        </router-link>

        <v-spacer />

        <v-text-field
          v-if="$route.name === 'alerts'"
          v-model="query"
          :flat="!hasFocus"
          :label="$t('Search')"
          prepend-inner-icon="search"
          solo
          clearable
          height="44"
          class="pt-2 mr-3 hidden-sm-and-down"
          @focus="hasFocus = true"
          @blur="hasFocus = false"
          @change="submitSearch"
          @click:clear="clearSearch"
        >
          <template v-slot:append-outer>
            <v-tooltip
              bottom
            >
              <template v-slot:activator="{ on }">
                <v-icon
                  v-on="on"
                  @click="saveSearch"
                >
                  push_pin
                </v-icon>
              </template>
              <span>{{ $t('Save') }}</span>
            </v-tooltip>
          </template>
        </v-text-field>

        <div
          v-if="$route.name === 'alerts'"
          v-show="isLoggedIn"
        >
          <v-tooltip bottom>
            <v-switch
              slot="activator"
              :input-value="isWatch"
              hide-details
              open-delay="3000"
              @change="toggle('isWatch', $event)"
            />
            <span>{{ $t('Watch') }}</span>
          </v-tooltip>
        </div>

        <v-spacer class="hidden-sm-and-down" />

        <v-tooltip bottom>
          <v-btn
            v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
            slot="activator"
            icon
            @click="toggleFullScreen"
          >
            <v-icon>{{ isFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</v-icon>
          </v-btn>
          <span>{{ $t('FullScreen') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
            slot="activator"
            icon
          >
            <v-icon @click="refresh">
              refresh
            </v-icon>
          </v-btn>
          <span>{{ $t('Refresh') }}</span>
        </v-tooltip>

        <v-menu
          v-show="isLoggedIn"
          v-model="menu"
          :close-on-content-click="false"
          :nudge-width="200"
          offset-x
        >
          <v-btn
            slot="activator"
            icon
          >
            <v-avatar
              size="32px"
            >
              <img
                v-if="avatar && !error"
                :src="avatar"
                @error="error = true"
              >
              <v-icon
                v-else
                v-text="navbar.signin.icon"
              />
            </v-avatar>
          </v-btn>

          <profile-me
            v-if="profile"
            :profile="profile"
            @close="menu = false"
          />
        </v-menu>

        <span class="hidden-xs-only">
          <v-btn
            v-show="!isLoggedIn && isSignupEnabled"
            round
            outline
            color="primary"
            to="/signup"
          >
            {{ $t('SignUp') }}
          </v-btn>
          <v-btn
            v-show="!isLoggedIn"
            round
            color="primary"
            to="/login"
          >
            {{ $t('LogIn') }}
          </v-btn>
        </span>
      </v-toolbar>

      <v-toolbar
        v-if="selected.length > 0"
        :color="isDark ? '#8e8e8e' : '#bcbcbc'"
        class="mb-1"
      >
        <v-btn
          icon
          @click="clearSelected"
        >
          <v-icon>arrow_back</v-icon>
        </v-btn>
        <span class="hidden-sm-and-down">
          <v-toolbar-title>
            {{ $t('Back') }}
          </v-toolbar-title>
        </span>
        <v-spacer />

        <span class="subheading">
          <span class="hidden-sm-and-down">{{ $t('Selected') }} {{ $t('SelectedIncidents') }}:</span> {{ selectedIncidents.length }}
          <span class="hidden-sm-and-down">
            ({{ $t('SelectedWith') }} {{ selectedAlertsCount }} <span class="hidden-sm-and-down"> {{ $t('AlertsInside') }}</span>
          </span>)
        </span>

        <v-spacer />

        <!-- FIXME TEMPORARY HIDDEN ACTION (its need?) -->
        <v-tooltip
          v-if="1 === 2"
          bottom
        >
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            @click="toggleWatch()"
          >
            <v-icon>
              visibility
            </v-icon>
          </v-btn>
          <span>{{ $t('Watch') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            :disabled="selectedOpen.length === 0"
            @click="bulkAckAlert()"
          >
            <v-icon
              color="#0F0"
              :large="true"
            >
              check
            </v-icon>
          </v-btn>
          <span>{{ $t('Ack') }}</span>
        </v-tooltip>

        <v-tooltip
          v-if="selectedIncidents.length > 0"
          bottom
        >
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            :disabled="!selectedAcknowledgedIncidents.length"
            @click="takeInFixingBy24Per7()"
          >
            <v-icon
              color="#F00"
              :medium="true"
            >
              fa-fire
            </v-icon>
          </v-btn>
          <span>{{ $t('TakeInFixingBy24Per7') }}</span>
        </v-tooltip>

        <!-- FIXME New incident action check if alerts in one incident selected (not whole inc) -->
        <v-tooltip
          v-if="isSplittableIncidentSelected"
          bottom
        >
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            @click="moveAlerts()"
          >
            <v-icon
              color="#FF0"
              :medium="true"
            >
              fa-object-ungroup
            </v-icon>
          </v-btn>
          <span>{{ $t('SplitIncident') }}</span>
        </v-tooltip>

        <!-- FIXME New incident action check if alerts in one incident selected (not whole inc) -->
        <v-tooltip
          v-if="isIncidentPartSelected"
          bottom
        >
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            @click="moveAlerts()"
          >
            <v-icon
              color="#FF0"
              :medium="true"
            >
              fa-plus-square
            </v-icon>
          </v-btn>
          <span>{{ $t('NewIncident') }}</span>
        </v-tooltip>

        <!-- FIXME New incident action check if alerts in one incident selected (not whole inc) -->
        <v-tooltip
          v-if="isMultipleIncidentsSelected"
          bottom
        >
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            @click="moveAlerts()"
          >
            <v-icon
              style="rotate: 90deg"
              color="#FF0"
              :medium="true"
            >
              fa-sitemap
            </v-icon>
          </v-btn>
          <span>{{ $t('MergeIncident') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            :disabled="selectedFixing.length === 0"
            @click="bulkAidoneAlert()"
          >
            <v-icon
              color="#0F0"
              :large="true"
            >
              fa-eye
            </v-icon>
          </v-btn>
          <span>{{ $t('Aidone') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            :disabled="selectedForFalsePositive.length === 0"
            @click="bulkFalsePositive()"
          >
            <v-icon
              color="#22F"
              :size="32"
            >
              fa-frown
            </v-icon>
          </v-btn>
          <span>{{ $t('FalsePositive') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            :disabled="selectedForEscalation.length === 0"
            @click="bulkEscalate()"
          >
            <v-icon
              color="#F00"
              :size="32"
            >
              fa-bell
            </v-icon>
          </v-btn>
          <span>{{ $t('Escalate') }}</span>
        </v-tooltip>

        <v-tooltip
          v-has-perms="'admin'"
          bottom
        >
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            :disabled="selectedForConfirmEscalation.length === 0"
            @click="bulkConfirmEscalation()"
          >
            <v-icon
              color="#F00"
              :size="32"
            >
              fa-bell
            </v-icon>
          </v-btn>
          <span>{{ $t('ConfirmEscalation') }}</span>
        </v-tooltip>

        <v-tooltip
          v-has-perms="'admin'"
          bottom
        >
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            :disabled="selectedForClose.length === 0"
            @click="bulkConfirmResolution()"
          >
            <v-icon
              color="#0F0"
              :size="32"
            >
              fa-thumbs-up
            </v-icon>
          </v-btn>
          <span>{{ $t('Close') }}</span>
        </v-tooltip>
        <disaster-button @makeDisaster="bulkMakeDisaster" />
        

        <!-- FIXME TEMPORARY HIDDEN ACTION (its need?) -->
        <v-tooltip
          v-if="1 === 2"
          bottom
        >
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            @click="bulkShelveAlert()"
          >
            <v-icon>
              schedule
            </v-icon>
          </v-btn>
          <span>{{ $t('Shelve') }}</span>
        </v-tooltip>

        <!-- FIXME TEMPORARY HIDDEN ACTION (its need?) -->
        <v-tooltip
          v-if="1 === 2"
          bottom
        >
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            @click="takeBulkAction('close')"
          >
            <v-icon>
              highlight_off
            </v-icon>
          </v-btn>
          <span>{{ $t('Close') }}</span>
        </v-tooltip>

        <!-- FIXME TEMPORARY HIDDEN ACTION (its need?) -->
        <v-tooltip
          v-if="1 === 2"
          bottom
        >
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            @click="bulkDeleteAlert()"
          >
            <v-icon>
              delete
            </v-icon>
          </v-btn>
          <span>{{ $t('Delete') }}</span>
        </v-tooltip>

        <v-menu
          bottom
          left
        >
          <v-btn
            slot="activator"
            flat
            icon
            small
            class="btn--plain px-1 mx-0"
          >
            <v-icon small>
              more_vert
            </v-icon>
          </v-btn>

          <v-list
            subheader
          >
            <v-subheader>Actions</v-subheader>
            <v-divider />
            <v-list-tile
              v-for="(action, i) in actions"
              :key="i"
              @click="takeBulkAction(action)"
            >
              <v-list-tile-title>{{ action | splitCaps }}</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>

        <v-spacer />

        <v-tooltip bottom>
          <v-btn
            v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
            slot="activator"
            icon
            @click="toggleFullScreen"
          >
            <v-icon>{{ isFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</v-icon>
          </v-btn>
          <span>{{ $t('FullScreen') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
            slot="activator"
            icon
          >
            <v-icon @click="refresh">
              refresh
            </v-icon>
          </v-btn>
          <span>{{ $t('Refresh') }}</span>
        </v-tooltip>

        <v-menu
          v-show="isLoggedIn"
          v-model="menu"
          :close-on-content-click="false"
          :nudge-width="200"
          offset-x
        >
          <v-btn
            slot="activator"
            icon
          >
            <v-avatar
              size="32px"
            >
              <img
                v-if="avatar && !error"
                :src="avatar"
                @error="error = true"
              >
              <v-icon
                v-else
                v-text="navbar.signin.icon"
              />
            </v-avatar>
          </v-btn>

          <profile-me
            v-if="profile"
            :profile="profile"
            @close="menu = false"
          />
        </v-menu>

        <span class="hidden-xs-only">
          <v-btn
            v-show="!isLoggedIn && isSignupEnabled"
            round
            outline
            color="primary"
            disabled
          >
            {{ $t('SignUp') }}
          </v-btn>
          <v-btn
            v-show="!isLoggedIn"
            round
            color="primary"
            disabled
          >
            {{ $t('LogIn') }}
          </v-btn>
        </span>
      </v-toolbar>
    </div>

    <v-content>
      <div
        v-if="isFixed"
        class="fixed-toolbar-offset"
      />
      <banner />
      <router-view />
      <snackbar />
    </v-content>

    <div v-if="!isKiosk">
      <span class="hidden-sm-and-up">
        <v-btn
          v-show="!isLoggedIn && isSignupEnabled"
          block
          round
          outline
          color="primary"
          to="/signup"
          :disabled="selected.length > 0"
        >
          {{ $t('SignUp') }}
        </v-btn>
        <v-btn
          v-show="!isLoggedIn"
          block
          round
          color="primary"
          to="/login"
          :disabled="selected.length > 0"
        >
          {{ $t('LogIn') }}
        </v-btn>
      </span>
    </div>
  </v-app>
</template>

<script>
import Banner from '@/components/lib/Banner.vue'
import ProfileMe from '@/components/auth/ProfileMe.vue'
import Snackbar from '@/components/lib/Snackbar.vue'
import DisasterButton from '@/components/AlertActions/DisasterButton.vue'
import i18n from '@/plugins/i18n'

export default {
  name: 'App',
  components: {
    Banner,
    ProfileMe,
    Snackbar,
    DisasterButton
  },
  props: [],
  data: () => ({
    hasFocus: false,
    menu: false,
    message: false,
    hints: true,
    dialog: false,
    drawer: false,
    navbar: {
      signin: { icon: 'account_circle', text: i18n.t('SignIn'), path: '/login' }
    },
    error: false,
    isFixed: false // Tracks whether the toolbar should be fixed
  }),
  computed: {
    items() {
      return [
        {
          icon: 'list',
          text: i18n.t('Alerts'),
          path: '/alerts',
          perms: 'read:alerts',
          show: true
        },
        {
          icon: 'expand_less',
          'icon-alt': 'expand_more',
          text: i18n.t('Searches'),
          model: false,
          queries: this.queries
        },
        {
          icon: 'timer',
          text: i18n.t('Heartbeats'),
          path: '/heartbeats',
          perms: 'read:heartbeats',
          show: true
        },
        {
          icon: 'person',
          text: i18n.t('Users'),
          path: '/users',
          perms: 'admin:users',
          show: true
        },
        {
          icon: 'people',
          text: i18n.t('Groups'),
          path: '/groups',
          perms: 'read:groups',
          show: this.$config.provider === 'basic'
        },
        {
          icon: 'domain',
          text: i18n.t('Customers'),
          path: '/customers',
          perms: 'read:customers',
          show: this.$config.customer_views
        },
        {
          icon: 'notifications_off',
          text: i18n.t('Blackouts'),
          path: '/blackouts',
          perms: 'read:blackouts',
          show: true
        },
        {
          icon: 'security',
          text: i18n.t('Permissions'),
          path: '/perms',
          perms: 'read:perms',
          show: true
        },
        {
          icon: 'vpn_key',
          text: i18n.t('APIKeys'),
          path: '/keys',
          perms: 'read:keys',
          show: this.isLoggedIn || !this.isAuthRequired
        },
        {
          icon: 'assessment',
          text: i18n.t('Reports'),
          path: '/reports',
          perms: 'read:alerts',
          show: true
        },
        { divider: true},
        {
          icon: 'account_circle',
          text: i18n.t('Profile'),
          path: '/profile',
          perms: null,
          show: this.isLoggedIn
        },
        {
          icon: 'directions',
          text: i18n.t('Patterns'),
          path: '/patterns',
          perms: 'admin:users',
          show: this.isLoggedIn
        },
        {
          icon: 'fa-align-right',
          rotate: true,
          text: i18n.t('Analytics'),
          path: '/analytics',
          perms: 'admin:users',
          show: this.isLoggedIn
        },
        {
          icon: 'settings',
          text: i18n.t('Settings'),
          path: '/settings',
          perms: null,
          show: this.isLoggedIn
        },
        // { icon: 'chat_bubble', text: 'Send feedback' },
        {
          icon: 'help',
          text: i18n.t('Help'),
          path: '/help',
          appendIcon: 'open_in_new',
          perms: null,
          show: true
        },
        {
          icon: 'info',
          text: i18n.t('About'),
          path: '/about',
          perms: 'read:management',
          show: true
        }
      ]
    },
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    isWatch() {
      return this.$store.state.alerts.isWatch
    },
    languagePref() {
      return this.$store.getters.getPreference('languagePref')
    },
    isKiosk() {
      return this.$store.state.alerts.isKiosk
    },
    isLoggedIn() {
      return this.$store.getters['auth/isLoggedIn']
    },
    isAuthRequired() {
      return this.$config.auth_required
    },
    isAllowReadonly() {
      return this.$config.allow_readonly
    },
    isSignupEnabled() {
      return this.$config.signup_enabled
    },
    profile() {
      return this.$store.state.auth.payload || {}
    },
    query: {
      get() {
        return this.$store.state.alerts.query
          ? this.$store.state.alerts.query.q
          : null
      },
      set(value) {
        // FIXME: offer query suggestions to user here, in future
      }
    },
    queries() {
      return this.$store.getters.getUserQueries.map(query => (
        {
          icon: 'remove_circle_outline',
          text: query.text,
          path: '/alerts',
          query: query.q,
          perms: 'read:alerts',
          show: true
        }))
    },
    actions() {
      return this.$config.actions
    },
    selected() {
      return this.$store.state.alerts.alerts.filter(a => this.$store.state.alerts.selected.some(s => a.id === s.id))
    },
    selectedIncidents() {
      return this.selected.filter(a => !!a.attributes?.incident)
    },
    selectedAlerts() {
      return this.selected.filter(a => !a.attributes?.incident)
    },
    selectedAlertsCount() {
      const selectedIncidentAlerts = this.selectedIncidents.reduce((count, incident) => {
        if (this.$store.state.alerts.nestedSelected[incident.id]) {
          count += 1
        }
        return count
      }, 0)
      return this.selectedAlerts.length + selectedIncidentAlerts
    },
    selectedOpen() {
      return [
        ...this.selectedIncidents.filter(inc => this.$store.state.alerts.nestedSelected[inc.id]),
        ...this.selectedAlerts
      ].filter(a => a.status === 'open')
    },
    selectedFixing() {
      return this.selected.filter(a => a.status === 'fixing-by-24/7')
    },
    selectedForFalsePositive() {
      return this.selectedIncidents.filter(a => ['false-positive', 'closed','open'].includes(a.status) === false)
    },
    selectedForEscalation() {
      return this.selectedIncidents.filter(a => ['fixing-by-24/7', 'observation'].includes(a.status))
    },
    selectedForConfirmEscalation() {
      return this.selectedIncidents.filter(a => a.status === 'pending')
    },
    selectedForClose() {
      return this.selected.filter(a => a.status !== 'closed')
    },
    selectedAcknowledgedIncidents() { // FIXME REVIEW ON OPER-14748
      return this.selectedIncidents.filter(a => a.status === 'ack')
    },
    isSplittableIncidentSelected() {
      if (this.selectedIncidents.length !== 1) return false
      const selectedIncident = this.selectedIncidents[0]
      const selectedIncidentAlertsLength = (selectedIncident.attributes['duplicate alerts'] || []).length
      return (selectedIncidentAlertsLength === 1 && this.selectedAlerts.length === 1)
    },
    isIncidentPartSelected() { // only one and only partial
      if (this.selectedIncidents.length !== 1) return false
      const selectedIncident = this.selectedIncidents[0]
      const selectedIncidentAlertsLength = (selectedIncident.attributes['duplicate alerts'] || []).length
      const selectedIncidentAlert = this.$store.state.alerts.nestedSelected[selectedIncident?.id]

      return (selectedIncidentAlertsLength + 1 > this.selectedAlerts.length + (selectedIncidentAlert ? 1 : 0))
    },
    isMultipleIncidentsSelected() { // 2 or more (part or full)
      return this.selectedIncidents.length > 1
    },
    ackTimeout() {
      return this.$store.getters.getPreference('ackTimeout')
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    username() {
      return this.$store.getters['auth/getUsername']
    },
    avatar() {
      return this.$store.getters['auth/getAvatar']
    }
  },
  watch: {
    isKiosk(val) {
      if (val) {
        this.toggleFullScreen()
      }
    },
    languagePref(val) {
      i18n.locale = val
    }
  },
  mounted() {
    if (this.isLoggedIn) {
      this.$store.dispatch('getUserPrefs')
      this.$store.dispatch('getUserQueries')
      window.addEventListener('scroll', this.handleScroll)
      this.$shared.set('moveAlerts', this.moveAlerts)
    }
  },
  methods: {
    handleScroll() {
      this.isFixed = window.scrollY > 0
    },
    submitSearch(query) {
      this.$store.dispatch('alerts/updateQuery', { q: query })
      this.$router.push({
        query: { ...this.$router.query, q: query },
        hash: this.$store.getters['alerts/getHash']
      })
      this.refresh()
    },
    clearSearch() {
      this.query = null
      this.$store.dispatch('alerts/updateQuery', {})
      this.$router.push({
        query: { ...this.$router.query, q: undefined },
        hash: this.$store.getters['alerts/getHash']
      })
      this.refresh()
    },
    multiDragMassDeselect() {
      if ('multiDragDeselect' in this.$shared) {
        Array.from(document.querySelectorAll('tr.sortableRow'))
          .forEach(this.$shared.multiDragDeselect)
      }
    },
    clearSelected() {
      this.$store.dispatch('alerts/updateSelected', [])
      this.$store.dispatch('alerts/updateNestedSelected', {})
      this.multiDragMassDeselect()
    },
    saveSearch() {
      if (this.query) {
        this.$store.dispatch('addUserQuery', {
          text: this.query,
          q: this.query
        })
      }
    },
    deleteSearch(query) {
      this.$store.dispatch('removeUserQuery', query)
    },
    takeBulkAction(action) {
      Promise.all(this.selected.map(a => this.$store.dispatch('alerts/takeAction', [a.id, action, '']))).then(() => {
        this.clearSelected()
        this.$store.dispatch('alerts/getAlerts')
      })
    },
    takeInFixingBy24Per7() { // FIXME REVIEW ON OPER-14748
      Promise.all(this.selectedAcknowledgedIncidents.map(a => this.$store.dispatch('alerts/takeAction', [a.id, 'inc', ''])))
        .then(() => {
          this.$store.dispatch('alerts/getAlerts')
        })
      this.clearSelected()
    },
    bulkMakeDisaster(payload) {
      const ids = this.selected?.map(a => a.id)

      this.$store.dispatch('alerts/makeDisaster', { ids, ...payload })
      this.clearSelected()
    },
    bulkAckAlert() {
      this.selectedOpen.forEach(alert => {
        this.$store
          .dispatch('alerts/takeAction', [
            alert.id,
            'ack',
            '',
            this.ackTimeout
          ])
      })
      this.clearSelected()
    },
    bulkAidoneAlert() {
      this.selectedFixing.forEach(alert => {
        if (alert.attributes?.incident) this.$store
          .dispatch('alerts/takeAction', [
            alert.id,
            'aidone',
            '',
            this.ackTimeout
          ])
      })
      this.clearSelected()
    },
    bulkFalsePositive() {
      Promise.all(this.selectedForFalsePositive.map(a => {
        this.$store
          .dispatch('alerts/takeAction', [
            a.id,
            'false-positive',
            '',
            this.ackTimeout
          ])
      })).then(() => {
        this.clearSelected()
        this.$store.dispatch('alerts/getAlerts')
      })
    },
    bulkEscalate() {
      Promise.all(this.selectedForEscalation.map(a => {
        this.$store
          .dispatch('alerts/takeAction', [
            a.id,
            'esc',
            '',
            this.ackTimeout
          ])
      })).then(() => {
        this.clearSelected()
        this.$store.dispatch('alerts/getAlerts')
      })
    },
    bulkConfirmEscalation() {
      Promise.all(this.selectedForConfirmEscalation.map(a => {
        this.$store
          .dispatch('alerts/takeAction', [
            a.id,
            'escalation',
            '',
            this.ackTimeout
          ])
      })).then(() => {
        this.clearSelected()
        this.$store.dispatch('alerts/getAlerts')
      })
    },
    bulkConfirmResolution() {
      Promise.all(this.selectedForClose.map(a => {
        this.$store
          .dispatch('alerts/takeAction', [
            a.id,
            'close',
            '',
            this.ackTimeout
          ])
      })).then(() => {
        this.clearSelected()
        this.$store.dispatch('alerts/getAlerts')
      })
    },
    bulkShelveAlert() {
      Promise.all(this.selected.map(a => {
        this.$store
          .dispatch('alerts/takeAction', [
            a.id,
            'shelve',
            '',
            this.shelveTimeout
          ])
      })).then(() => {
        this.clearSelected()
        this.$store.dispatch('alerts/getAlerts')
      })
    },
    isWatched(tags) {
      const tag = `watch:${this.username}`
      return tags ? tags.indexOf(tag) > -1 : false
    },
    // method maps all incidents to:
    // 1. if incident has no duplicate alerts, then its id
    // 2. if incident has duplicate alerts, then if partial alerts are selected, then selected children ids
    // 3. if incident has duplicate alerts, then if full incident is selected, then incident id
    getMovingIds(passedIncidents = null) {
      return (passedIncidents || this.selectedIncidents).reduce((ids, { id: incidentId, attributes }) => {
        const duplicateIds = attributes['duplicate alerts']

        if (!duplicateIds || duplicateIds.length === 0) {
          ids.push({ id: incidentId, isIncident: true })
          return ids
        }

        // if not selected add incident id and all child ids (for dragged but no selected)
        if (!this.selectedIncidents.find(i => i.id === incidentId)) {
          ids.push({ id: incidentId, isIncident: true, all: true })
          ids.push(...duplicateIds.map(id => ({ id, isIncident: false, parentId: incidentId })))
          return ids
        }

        const selectedChilds = [incidentId, ...duplicateIds]
        const filteredChilds = selectedChilds.filter(duplicateId => this.$store.state.alerts.nestedSelected[duplicateId])

        if (selectedChilds.length === filteredChilds.length) {
          ids.push({ id: incidentId, isIncident: true, all: true })
          return ids
        }
        ids.push(...filteredChilds.map(id => ({ id, isIncident: id === incidentId, parentId: incidentId })))
        return ids
      }, [])
    },
    // FIXME if already moving something - show snackbar and prevent new move
    moveAlerts(target = null, movedIncidents = null) {
      const movingObjects = this.getMovingIds(movedIncidents)
      const jiraKeysCount = [...movingObjects, { id: target}].reduce((acc, { id }) => {
        if (!id) return acc
        const found = this.$store.state.alerts.alerts.find(a => a.id === id)
        if (!found || !found?.attributes?.jira_key) return acc
        return acc + 1
      }, 0)

      if (jiraKeysCount > 1) {
        this.$store.dispatch('notifications/showSnackbar', {
          type: 'error',
          text: i18n.t('RestrictedMergeJira'),
          timeout: 5000,
        })
        return
      }

      this.$store.dispatch('notifications/showSnackbar', {
        text: i18n.t('MovingAlerts'),
        timeout: 999999,
      })
      this.$store.dispatch('alerts/move', {
        movingObjects,
        target
      })
        .then(() => {
          this.clearSelected()
          this.refresh()
        }).catch((err) => {
          // eslint-disable-next-line no-console
          console.info('got error on moveAlerts', err)
        }).finally(() => {
          this.$store.dispatch('notifications/closeSnackbar', {
            text: i18n.t('MovingAlerts')
          })
        })
    },
    toggleWatch() {
      var map
      if (this.selected.some(x => !this.isWatched(x.tags))) {
        map = this.selected.map(a => this.watchAlert(a.id))
      } else {
        map = this.selected.map(a => this.unwatchAlert(a.id))
      }
    
      Promise.all(map).then(() => {
        this.clearSelected()
        this.$store.dispatch('alerts/getAlerts')
      })
    },
    watchAlert(id) {
      this.$store.dispatch('alerts/watchAlert', id)
    },
    unwatchAlert(id) {
      this.$store.dispatch('alerts/unwatchAlert', id)
    },
    bulkDeleteAlert() {
      confirm(i18n.t('ConfirmDelete')) &&
        Promise.all(this.selected.map(a => this.$store.dispatch('alerts/deleteAlert', a.id, false))).then(() => {
          this.clearSelected()
          this.$store.dispatch('alerts/getAlerts')
        })
    },
    toggle(sw, value) {
      this.$store.dispatch('alerts/toggle', [sw, value])
    },
    toggleFullScreen() {
      let elem = document.getElementById('alerta')
      if (!this.isFullscreen()) {
        elem.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    },
    isFullscreen() {
      return document.fullscreenElement
    },
    refresh() {
      this.$store.dispatch('set', ['refresh', Math.random()])
    }
  }
}
</script>

<style>

@import "./assets/css/fonts.css";

.toolbar-title {
  color: inherit;
  text-decoration: inherit;
}

.fixed-top-toolbar div.application--wrap > div > nav.v-toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.fixed-top-toolbar div > nav.v-toolbar.theme--light {
  box-shadow: 0 4px 0 rgba(200, 200, 200, 0.9) !important;
  transition: all 0.3s ease-in-out;
}

.fixed-top-toolbar div > nav.v-toolbar.theme--dark {
  box-shadow: 0 4px 0 rgba(50, 50, 50, 0.9) !important;
  transition: all 0.3s ease-in-out;
}

.fixed-toolbar-offset {
  height: 65px;
  width: 100%;
}

.logo {
  font-family: "Sonsie One", cursive;
  font-size: 26px;
}

.btn--plain {
  padding: 0;
  opacity: 0.6;
}
.btn--plain:before {
  background-color: transparent !important;
  transition: none !important;
}
.btn--plain:hover {
  opacity: 1;
}
</style>
