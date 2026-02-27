'use client'

import { useState } from 'react'
import { useGameAnalytics } from 'react-gameanalytics/next'

const steps = ['profile', 'team_invite', 'integration']

export default function OnboardingPage() {
  const ga = useGameAnalytics()
  const [currentStep, setCurrentStep] = useState(0)

  const startOnboarding = () => {
    setCurrentStep(0)
    ga.addProgressionEvent({
      status: 'start',
      progression01: 'onboarding',
      progression02: steps[0],
    })
  }

  const completeStep = () => {
    const step = steps[currentStep]
    ga.addProgressionEvent({
      status: 'complete',
      progression01: 'onboarding',
      progression02: step,
      score: (currentStep + 1) * 30,
    })

    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      ga.addProgressionEvent({
        status: 'start',
        progression01: 'onboarding',
        progression02: steps[nextStep],
      })
    }
  }

  const failStep = () => {
    ga.addProgressionEvent({
      status: 'fail',
      progression01: 'onboarding',
      progression02: steps[currentStep],
    })
  }

  return (
    <div>
      <h2>Onboarding</h2>
      <p>Current step: <strong>{steps[currentStep]}</strong> ({currentStep + 1}/{steps.length})</p>

      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <button onClick={startOnboarding} style={{ padding: '8px 16px' }}>
          Start Onboarding
        </button>
        <button onClick={completeStep} style={{ padding: '8px 16px' }}>
          Complete Step
        </button>
        <button onClick={failStep} style={{ padding: '8px 16px' }}>
          Fail Step
        </button>
      </div>
    </div>
  )
}
