import { useState } from 'react'

interface ConsentBannerProps {
  onConsentChange: (granted: boolean) => void
}

export function ConsentBanner({ onConsentChange }: ConsentBannerProps) {
  const [consented, setConsented] = useState(true)

  return (
    <div style={{ padding: '8px 12px', background: consented ? '#e8f5e9' : '#fce4ec', borderRadius: 6, fontSize: 14 }}>
      <strong>Consent:</strong> {consented ? 'Granted' : 'Denied'}
      <button
        onClick={() => { setConsented(true); onConsentChange(true) }}
        style={{ marginLeft: 8 }}
      >
        Accept
      </button>
      <button
        onClick={() => { setConsented(false); onConsentChange(false) }}
        style={{ marginLeft: 4 }}
      >
        Decline
      </button>
    </div>
  )
}
