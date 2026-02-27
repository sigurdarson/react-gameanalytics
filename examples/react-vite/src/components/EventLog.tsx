import { useEffect, useState } from 'react'
import { useGameAnalytics } from 'react-gameanalytics/react'
import type { GAPlugin, GAEvent } from 'react-gameanalytics'

interface LogEntry {
  type: string
  params: Record<string, unknown>
  timestamp: number
}

export function EventLog() {
  const ga = useGameAnalytics()
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    const plugin: GAPlugin = {
      name: 'event-log-ui',
      type: 'enrichment',
      execute(event: GAEvent) {
        setLogs((prev) => [...prev.slice(-49), {
          type: event.type,
          params: event.params,
          timestamp: event.timestamp,
        }])
        return event
      },
    }

    ga.addPlugin(plugin)
    return () => { ga.removePlugin('event-log-ui') }
  }, [ga])

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12, maxHeight: 300, overflow: 'auto', fontSize: 13, fontFamily: 'monospace' }}>
      <strong>Event Log ({logs.length})</strong>
      {logs.length === 0 && <p style={{ color: '#999' }}>No events yet. Interact with the app to see events.</p>}
      {logs.map((log, i) => (
        <div key={i} style={{ borderTop: '1px solid #eee', padding: '4px 0' }}>
          <span style={{ color: '#1976d2' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
          <strong>{log.type}</strong>:{' '}
          <span>{JSON.stringify(log.params)}</span>
        </div>
      ))}
    </div>
  )
}
