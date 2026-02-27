'use client'

import { useState } from 'react'
import { GameAnalyticsProvider } from 'react-gameanalytics/next'
import { Nav } from './components/Nav'
import { AuthSimulator } from './components/AuthSimulator'
import { ConsentBanner } from './components/ConsentBanner'
import { EventLog } from './components/EventLog'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [enabled, setEnabled] = useState(true)

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <GameAnalyticsProvider
          gameKey={process.env.NEXT_PUBLIC_GA_GAME_KEY ?? 'demo-key'}
          secretKey={process.env.NEXT_PUBLIC_GA_SECRET_KEY ?? 'demo-secret'}
          userId={userId}
          enabled={enabled}
          debug
          trackPageViews={{ excludePaths: ['/api/*'] }}
          customDimensions={{
            dimension01: ['free', 'pro', 'enterprise'],
          }}
        >
          <h1 style={{ fontSize: 20 }}>react-gameanalytics Example</h1>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <AuthSimulator onUserChange={setUserId} />
            <ConsentBanner onConsentChange={setEnabled} />
          </div>
          <Nav />
          <main style={{ padding: '16px 0' }}>{children}</main>
          <EventLog />
        </GameAnalyticsProvider>
      </body>
    </html>
  )
}
