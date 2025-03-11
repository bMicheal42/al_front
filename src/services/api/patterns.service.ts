import api from './index'

export default {
  getPatterns() {
    return api.get('/patterns')
  },
  createPattern(data: object) {
    return api.post('/patterns', data)
  },
  updatePattern(patternId: string, data: object) {
    return api.put(`/patterns/${patternId}`, data)
  },
  deletePattern(patternId: string) {
    return api.delete(`/patterns/${patternId}`)
  },
  testPattern(alertId: string, sql_rule: string) {
    return api.post('/patterns/query_test', {
      id: alertId,
      pattern_query: sql_rule
    })
  },
  getPatternsHistory(limit: number = 100, offset: number = 0) {
    return api.get('/patterns/history', {
        params: {
          limit,
          offset
        }
    })
  }
}
