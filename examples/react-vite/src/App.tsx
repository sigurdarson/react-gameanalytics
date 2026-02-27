import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { GameAnalyticsProvider, useTrackPageView } from 'react-gameanalytics/react'
import { Nav } from './components/Nav'
import { AuthSimulator } from './components/AuthSimulator'
import { ConsentBanner } from './components/ConsentBanner'
import { EventLog } from './components/EventLog'
import { Home } from './pages/Home'
import { Dashboard } from './pages/Dashboard'
import { Settings } from './pages/Settings'
import { Onboarding } from './pages/Onboarding'

function PageTracker() {
  const location = useLocation()
  useTrackPageView(location.pathname, { excludePaths: ['/api/*'] })
  return null
}

export function App() {
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [enabled, setEnabled] = useState(true)

  return (
    <GameAnalyticsProvider
      gameKey={import.meta.env.VITE_GA_GAME_KEY ?? 'demo-key'}
      secretKey={import.meta.env.VITE_GA_SECRET_KEY ?? 'demo-secret'}
      userId={userId}
      enabled={enabled}
      debug
      resourceCurrencies={['credits']}
      resourceItemTypes={['export']}
      customDimensions={{
        dimension01: ['free', 'pro', 'enterprise'],
      }}
    >
      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <h1 style={{ fontSize: 20 }}>react-gameanalytics - Vite + React</h1>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <AuthSimulator onUserChange={setUserId} />
          <ConsentBanner onConsentChange={setEnabled} />
        </div>
        <Nav />
        <PageTracker />
        <main style={{ padding: '16px 0' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </main>
        <EventLog />
      </div>
    </GameAnalyticsProvider>
  )
}
