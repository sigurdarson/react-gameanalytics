'use client'

import { useGameAnalytics } from 'react-gameanalytics/next'

export default function HomePage() {
  const ga = useGameAnalytics()

  return (
    <div>
      <h2>Home</h2>
      <p>This is the landing page. Click the button to fire a design event.</p>
      <button
        onClick={() => ga.addDesignEvent({ eventId: 'ui:cta:hero_clicked' })}
        style={{ padding: '8px 16px', fontSize: 14 }}
      >
        Hero CTA Click
      </button>
    </div>
  )
}
