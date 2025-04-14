export const ALERT_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  FALSE_POSITIVE: 'false-positive',
  ACK: 'ack',
  PENDING: 'pending',
  FIXING_BY_24_7: 'fixing-by-24/7',
  OBSERVATION: 'observation',
  ESCALATED: 'escalated',
}

// Если нет jira_key и не инцидент
export const canMergeWith = (alert) => {
  return (
    alert.attributes?.incident &&
    !alert.attributes?.jira_key &&
    [
      ALERT_STATUS.OPEN,
      ALERT_STATUS.CLOSED,
      ALERT_STATUS.ACK,
    ].includes(alert.status)
  )
}

export const alertModel = {
  ALERT_STATUS,
  canMergeWith
}