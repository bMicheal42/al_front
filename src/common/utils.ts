export default {
  getAllowedScopes(scopes: string[], allScopes: string[]) {
    let derivedScopes: string[] = []

    function expandScope(scope: string) {
      return allScopes.filter(s => s.startsWith(scope))
    }

    for (let scope of scopes) {
      derivedScopes.push(...expandScope(scope))
      if (scope.startsWith('admin')) {
        derivedScopes.push(...expandScope(scope.replace('admin', 'delete')))
        derivedScopes.push(...expandScope(scope.replace('admin', 'write')))
        derivedScopes.push(...expandScope(scope.replace('admin', 'read')))
      }
      if (scope.startsWith('write')) {
        derivedScopes.push(...expandScope(scope.replace('write', 'read')))
      }
    }
    return Array.from(new Set(derivedScopes)).sort()
  },
  toHash(obj: object): string {
    return Object.entries(obj)
      .filter(x => !!x[1])
      .reduce((a: string[], [k, v]) => a.concat(`${k}:${v}`), [])
      .join(';')
  },
  fromHash(hash: string): object {
    let h = decodeURI(hash).substring(1)
    return h
      ? h
          .split(';')
          .map(x => x.split(':'))
          .reduce((a, [k, v]) => Object.assign(a, {[k]: v}), {})
      : {}
  },
  hashColor(value: string, isDark: boolean = false): string { // FIXME think how to make more elegant color generation
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash)
    }
    hash = hash % 360
    if (hash < 0) hash += 360
    hash = hash * 0.55 + 160

    return `hsl(${hash}, ${isDark ? 80 : 59}%, ${isDark ? 42 : 50}%)`
  },
  statusColor(status: string): string {
    switch (status) {
      case 'open':
        return 'rgb(203,41,41)'
      case 'ack':
        return '#0052cc'
      case 'fixing-by-24/7':
        return '#0052cc'
      case 'closed':
        return '#00875a'
      case 'observation':
        return '#999999'
      case 'pending':
        return '#999999'
      case 'false-positive':
        return '#de9000'
      case 'escalated':
        return '#00875a'
      default:
        return '#999999'
    }
  },
  jiraStatusColor(status: string): string {
    // Current Jira statuses:
    // In queue - blue-gray
    // Waiting for L3 - blue-gray
    // Working - yellow
    // 24/7 Processing - yellow
    // User Request - blue-gray
    // Observation - yellow
    // Resolved - green
    // Closed - green
    switch (status) {
      // case 'open':
      //   return 'rgb(203,41,41)'
      case 'Resolved':
      case 'Closed':
        return '#00875a'
      case 'In queue':
      case 'Working':
      case '24/7 Processing':
      case 'Observation':
      case 'blue':
        return '#0052CC'
      case 'Waiting for L3':
      case 'User Request':
        return '#5243AA'
      default:
        return '#999999'
    }
  },
}
