import { useGameAnalytics } from 'react-gameanalytics/react'

export function Dashboard() {
  const ga = useGameAnalytics()

  return (
    <div>
      <h2>Dashboard</h2>

      <h3>Business Events</h3>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
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
      </div>

      <h3 style={{ marginTop: 16 }}>Resource Events</h3>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
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
        <button
          onClick={() =>
            ga.addResourceEvent({
              flowType: 'source',
              currency: 'credits',
              amount: 50,
              itemType: 'export',
              itemId: 'referral_bonus',
            })
          }
          style={{ padding: '8px 16px' }}
        >
          Earn 50 Credits (Referral)
        </button>
      </div>

      <h3 style={{ marginTop: 16 }}>Error Events</h3>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button
          onClick={() =>
            ga.addErrorEvent({
              severity: 'warning',
              message: 'Dashboard widget failed to load: timeout after 5000ms',
            })
          }
          style={{ padding: '8px 16px' }}
        >
          Warning: Widget Timeout
        </button>
        <button
          onClick={() =>
            ga.addErrorEvent({
              severity: 'error',
              message: 'Failed to fetch analytics data: 503 Service Unavailable',
            })
          }
          style={{ padding: '8px 16px' }}
        >
          Error: API Failure
        </button>
        <button
          onClick={() =>
            ga.addErrorEvent({
              severity: 'critical',
              message: 'Payment processing failed: gateway unreachable',
            })
          }
          style={{ padding: '8px 16px' }}
        >
          Critical: Payment Failed
        </button>
      </div>
    </div>
  )
}
