import { useGameAnalytics } from 'react-gameanalytics/react'

export function Settings() {
  const ga = useGameAnalytics()

  return (
    <div>
      <h2>Settings</h2>

      <h3>Custom Dimensions</h3>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button
          onClick={() => ga.setCustomDimension01('free')}
          style={{ padding: '8px 16px' }}
        >
          Set Plan: Free
        </button>
        <button
          onClick={() => ga.setCustomDimension01('pro')}
          style={{ padding: '8px 16px' }}
        >
          Set Plan: Pro
        </button>
        <button
          onClick={() => ga.setCustomDimension01('enterprise')}
          style={{ padding: '8px 16px' }}
        >
          Set Plan: Enterprise
        </button>
      </div>

      <h3 style={{ marginTop: 16 }}>Global Custom Event Fields</h3>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button
          onClick={() => ga.setGlobalCustomEventFields({ theme: 'dark', locale: 'en-US' })}
          style={{ padding: '8px 16px' }}
        >
          Set Dark Theme + en-US
        </button>
        <button
          onClick={() => ga.setGlobalCustomEventFields({ theme: 'light', locale: 'es-ES' })}
          style={{ padding: '8px 16px' }}
        >
          Set Light Theme + es-ES
        </button>
        <button
          onClick={() => ga.setGlobalCustomEventFields({})}
          style={{ padding: '8px 16px' }}
        >
          Clear Fields
        </button>
      </div>
    </div>
  )
}
