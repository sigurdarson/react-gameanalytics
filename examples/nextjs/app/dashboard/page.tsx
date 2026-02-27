'use client'

import { useGameAnalytics } from 'react-gameanalytics/next'

export default function DashboardPage() {
  const ga = useGameAnalytics()

  return (
    <div>
      <h2>Dashboard</h2>

      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <button
          onClick={() =>
            ga.addBusinessEvent({
              currency: 'USD',
              amount: 2900,
              itemType: 'subscription',
              itemId: 'pro_monthly',
              cartType: 'dashboard_upgrade',
            })
          }
          style={{ padding: '8px 16px' }}
        >
          Upgrade to Pro ($29/mo)
        </button>

        <button
          onClick={() =>
            ga.addResourceEvent({
              flowType: 'sink',
              currency: 'credits',
              amount: 10,
              itemType: 'export',
              itemId: 'csv_export',
            })
          }
          style={{ padding: '8px 16px' }}
        >
          Spend 10 Credits (CSV Export)
        </button>
      </div>
    </div>
  )
}
