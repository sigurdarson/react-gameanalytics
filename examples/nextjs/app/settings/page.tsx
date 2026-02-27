'use client'

import { useGameAnalytics } from 'react-gameanalytics/next'

export default function SettingsPage() {
  const ga = useGameAnalytics()

  return (
    <div>
      <h2>Settings</h2>

      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
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

        <button
          onClick={() =>
            ga.setGlobalCustomEventFields({
              organizationId: 'org_xyz',
              appVersion: '2.4.1',
            })
          }
          style={{ padding: '8px 16px' }}
        >
          Set Global Fields (orgId)
        </button>
      </div>
    </div>
  )
}
