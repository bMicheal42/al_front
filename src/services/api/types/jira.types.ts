// интерфейс для ответа от API владельцев Jira
export interface JiraOwnersResponse {
  owners: {
    internal_owners: Record<string, string>; // внутренние группы: id -> name
    external_owners: Record<string, string | string[]>; // внешние группы: id -> name или массив имен
  };
}

// интерфейс для группы владельцев Jira с дополнительной информацией
export interface JiraOwnerGroup {
  id: string;
  name: string;
  isExternal: boolean;
} 