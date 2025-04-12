import api from './index'
import axios from 'axios'

export default {
  getAlert(alertId: string) {
    return api.get(`/alert/${alertId}`)
  },
  setStatus(alertId: string, data: object) {
    return api.put(`/alert/${alertId}/status`, data)
  },
  actionAlert(alertId: string, data: object) {
    const { action, text, timeout } = data as any
    return this.bulkActionAlerts({
      alert_ids: [alertId],
      action,
      text,
      timeout
    })
  },
  bulkActionAlerts(data: object) {
    return api.put('/_bulk/alerts/action', data)
  },
  moveAlerts(data: object, target: string | null) {
    return api.post(`/alerts/move/${target || 'new'}`, data)
  },
  tagAlert(alertId: string, data: object) {
    return api.put(`/alert/${alertId}/tag`, data)
  },
  untagAlert(alertId: string, data: object) {
    return api.put(`/alert/${alertId}/untag`, data)
  },
  updateAttributes(alertId: string, attributes: object) {
    let data = {
      attributes: attributes
    }
    return api.put(`/alert/${alertId}/attributes`, data)
  },
  addNote(alertId: string, data: object) {
    return api.put(`/alert/${alertId}/note`, data)
  },
  getNotes(alertId: string) {
    return api.get(`/alert/${alertId}/notes`)
  },
  updateNote(alertId: string, noteId: string, data: object) {
    return api.put(`/alert/${alertId}/note/${noteId}`, data)
  },
  deleteNote(alertId: string, noteId: string) {
    return api.delete(`/alert/${alertId}/note/${noteId}`)
  },
  getAlerts(query: object, setCancelTokenAction) {
    const cancelTokenSource = axios.CancelToken.source()
    setCancelTokenAction(cancelTokenSource)
    let config = {
      params: query,
      cancelToken: cancelTokenSource.token
    }
    return api.get('/alerts', config)
  },
  getAlertMoveHistory(limit: number = 100, offset: number = 0) {
    return api.get('/alerts/move_history', {
      params: {
        limit,
        offset
      }
    })
  },
  getAlertHistory(query: object) {
    let config = {
      params: query
    }
    return api.get('/alerts/history', config)
  },
  getCounts(query: object) {
    let config = {
      params: query
    }
    return api.get('/alerts/count', config)
  },
  getTop10Count(query: object) {
    let config = {
      params: query
    }
    return api.get('/alerts/top10/count', config)
  },
  getTop10Flapping(query: object) {
    let config = {
      params: query
    }
    return api.get('/alerts/top10/flapping', config)
  },
  getTop10Standing(query: object) {
    let config = {
      params: query
    }
    return api.get('/alerts/top10/standing', config)
  },

  deleteAlert(alertId: string) {
    return api.delete(`/alert/${alertId}`)
  },

  getEnvironments(query: object) {
    let config = {
      params: query
    }
    return api.get('/environments', config)
  },
  getServices(query: object) {
    let config = {
      params: query
    }
    return api.get('/services', config)
  },
  getGroups(query: object) {
    let config = {
      params: query
    }
    return api.get('/alerts/groups', config)
  },
  getTags(query: object) {
    let config = {
      params: query
    }
    return api.get('/alerts/tags', config)
  }
}
