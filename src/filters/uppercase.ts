import Vue from 'vue'

// See https://vuejs.org/v2/guide/filters.html

export default Vue.filter('uppercase', function (value) {
  if (value == null) return ''
  value = value.toString()
  return value.toUpperCase()
})
