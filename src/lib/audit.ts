export type AuditEvent = {
  type: string;
  timestamp: string;
  payload?: any;
}

export function logEvent(type: string, payload?: any) {
  const event: AuditEvent = {
    type,
    timestamp: new Date().toISOString(),
    payload,
  }
  console.log('[AUDIT]', JSON.stringify(event))
  // TODO: persist to database or external service in future
}
