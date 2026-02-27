'use client'

import { useState } from 'react'

interface AuthSimulatorProps {
  onUserChange: (userId: string | undefined) => void
}

export function AuthSimulator({ onUserChange }: AuthSimulatorProps) {
  const [loggedIn, setLoggedIn] = useState(false)
  const userId = loggedIn ? 'user_abc123' : undefined

  const toggle = () => {
    const next = !loggedIn
    setLoggedIn(next)
    onUserChange(next ? 'user_abc123' : undefined)
  }

  return (
    <div style={{ padding: '8px 12px', background: '#f0f0f0', borderRadius: 6, fontSize: 14 }}>
      <strong>Auth:</strong> {loggedIn ? `Logged in as ${userId}` : 'Logged out'}
      <button onClick={toggle} style={{ marginLeft: 8 }}>
        {loggedIn ? 'Logout' : 'Login'}
      </button>
    </div>
  )
}
