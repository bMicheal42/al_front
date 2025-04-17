import api from './index'
import { JiraOwnersResponse } from './types/jira.types'

export default {
  /**
   * Получение конфигурации Jira, включая группы владельцев, группы проектов и другие настройки
   * @returns {Promise<JiraOwnersResponse>} Возвращает промис с конфигурацией Jira
   */
  getJiraOwners(): Promise<JiraOwnersResponse> {
    return api.get('/config/jira-owners')
  }
} 