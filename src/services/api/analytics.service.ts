import api from './index'

const severityValues = {
  medium: 3,
  high: 4,
  critical: 5,
}

const formatCsvModel = (row) => ({
  severity: severityValues[row.severity] || 0,
  'host_id(url)': `https://monitoring.sdventures.com/hostinventories.php?filter_field=name&filter_exact=1&filter_field_value=${row.host}`,
  host_name: row.host,
  trigger_id: row?.zabbix_trigger_id ? row?.zabbix_trigger_id : '',
  trigger_name: row.text,
  acknowledged: row?.acked_by ? 1 : 0,
  day_shift: '', // заглушка
  disaster: '', // заглушка
  created_time: row.receive_time.slice(0, 19).replace('T', ' '),
  ackned_time: row?.ack_time ? row.ack_time.slice(0, 19).replace('T', ' ') : '',
  MTTD: row?.alert_ttd_sec ? row.alert_ttd_sec : '',
  acknowledged_user: row.acked_by ? row.acked_by : '',
  inc_user: row?.jira_url ? row.acked_by : '',
  inc_time: row?.jira_url ? (row?.fixing_time ? row.fixing_time.slice(0, 19).replace('T', ' ') : '') : '',
  inc: row?.jira_url ? row?.jira_url : '',
  dupl_user: '', // заглушка
  dupl_time: '', // заглушка
  dupl: (
      row?.incident
          ? ''
          : (
              row?.resolve_time
                  ? (row?.parent?.jira_url || '')
                  : ''
          )
  ),
  false_pos_user: row?.false_positive_time ? (row?.acked_by ? row?.acked_by : '') : '',
  false_pos_time: row?.false_positive_time ? row.false_positive_time.slice(0, 19).replace('T', ' ') : '',
  false_pos: row?.false_positive_time ? 1 : 0,
  flap_user: '', // заглушка
  flap_time: '', // заглушка
  flap: '', // заглушка
  resolved_time: row?.resolve_time ? row.resolve_time.slice(0, 19).replace('T', ' ') : '',
  'MTTR(sec)': row?.alert_ttr_sec ? row.alert_ttr_sec : '',
  project_group: row?.project_group ? row.project_group : '',
  info_system: row?.info_system ? row.info_system : '',
  event_url: (row?.zabbix_trigger_id && row?.zabbix_id)
      ? `https://monitoring.sdventures.com/tr_events.php?triggerid=${row.zabbix_trigger_id}&eventid=${row.zabbix_id}`
      : '',
  MTTU: (row?.inc_ttu_fixing_sec || row?.inc_ttu_false_positive_sec || ''),
  alerta_url: row?.id ? `http://zabbix.npdev.lan:8081/alert/${row.id}` : ''
})

const transformRaw = raw => {
  const dict = {}
  raw?.forEach(row => {
    if (row?.id) {
      dict[row.id] = row
    }
  })
  return raw?.map(row => {
    return formatCsvModel({ ...row, parent: row?.parent_id ? (dict[row.parent_id] || null) : null })
  }) || []
}

export default {
  getAnalytics(params) {
    return api.get('/analytics', { params })
  },
  getRawData(params) {
    return api.get('/analytics/raw', { params }).then(data => data?.raw).then(transformRaw)
  }
}
