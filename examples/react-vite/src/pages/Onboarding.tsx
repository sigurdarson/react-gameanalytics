import { useState } from 'react'
import { useGameAnalytics } from 'react-gameanalytics/react'

const steps = ['profile', 'preferences', 'confirmation']

export function Onboarding() {
  const ga = useGameAnalytics()
  const [step, setStep] = useState(0)
  const [started, setStarted] = useState(false)

  const startFlow = () => {
    setStarted(true)
    setStep(0)
    ga.addProgressionEvent({
      status: 'start',
      progression01: 'onboarding',
      progression02: steps[0],
    })
  }

  const nextStep = () => {
    ga.addProgressionEvent({
      status: 'complete',
      progression01: 'onboarding',
      progression02: steps[step],
    })

    if (step < steps.length - 1) {
      const next = step + 1
      setStep(next)
      ga.addProgressionEvent({
        status: 'start',
        progression01: 'onboarding',
        progression02: steps[next],
      })
    } else {
      setStarted(false)
    }
  }

  const failStep = () => {
    ga.addProgressionEvent({
      status: 'fail',
      progression01: 'onboarding',
      progression02: steps[step],
    })
    setStarted(false)
  }

  return (
    <div>
      <h2>Onboarding Flow</h2>
      {!started ? (
        <button onClick={startFlow} style={{ padding: '8px 16px' }}>
          Start Onboarding
        </button>
      ) : (
        <div>
          <p>
            Step {step + 1} of {steps.length}: <strong>{steps[step]}</strong>
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={nextStep} style={{ padding: '8px 16px' }}>
              {step === steps.length - 1 ? 'Finish' : 'Next Step'}
            </button>
            <button onClick={failStep} style={{ padding: '8px 16px', background: '#fce4ec' }}>
              Abandon
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
