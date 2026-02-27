'use client'

import { useEffect } from 'react'
import { useGameAnalytics } from 'react-gameanalytics/next'

export default function AnalyticsPage() {
  const ga = useGameAnalytics()

  useEffect(() => {
    ga.addDesignEvent({ eventId: 'feature:analytics:viewed' })
  }, [ga])

  return (
    <div>
      <h2>Dashboard / Analytics</h2>
      <p>This page fires a design event on mount (<code>feature:analytics:viewed</code>).</p>
      <p>The page view tracker also fires: <code>pageView:dashboard:analytics</code></p>
    </div>
  )
}
