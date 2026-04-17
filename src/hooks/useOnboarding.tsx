'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface OnboardingStep {
  currentSubStep: number
  subSteps: string[]
}

interface OnboardingContextType {
  step: number
  setStep: (step: number) => void
  subSteps: Record<number, OnboardingStep>
  currentSubStep: number
  setCurrentSubStep: (step: number, subStep: number) => void
  completeOnboarding: () => Promise<void>
  isActive: boolean
  loading: boolean
  advanceSubStep: () => void
  markStepComplete: () => Promise<void>
}

const defaultSubSteps: Record<number, OnboardingStep> = {
  1: { subSteps: ['avatar'], currentSubStep: 0 },
  2: { subSteps: ['name', 'price', 'duration', 'image', 'description', 'create'], currentSubStep: 0 },
  3: { subSteps: ['coverImage', 'bio', 'address', 'workingHours', 'socials', 'save', 'copyLink'], currentSubStep: 0 },
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1)
  const [subSteps, setSubSteps] = useState<Record<number, OnboardingStep>>(defaultSubSteps)
  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOnboardingStatus()
  }, [])

  const fetchOnboardingStatus = async () => {
    try {
      const res = await fetch('/api/user/onboarding')
      const data = await res.json()

      if (!data.onboardingCompleted && data.onboardingStep) {
        setStep(data.onboardingStep)
        setIsActive(true)
      }
    } catch (error) {
      console.error('Error fetching onboarding:', error)
    } finally {
      setLoading(false)
    }
  }

  const setCurrentSubStep = (stepKey: number, subStep: number) => {
    setSubSteps(prev => ({
      ...prev,
      [stepKey]: {
        ...prev[stepKey],
        currentSubStep: subStep,
      },
    }))
  }

  const advanceSubStep = () => {
    const currentStepData = subSteps[step]
    if (!currentStepData) return

    if (currentStepData.currentSubStep < currentStepData.subSteps.length - 1) {
      setSubSteps(prev => ({
        ...prev,
        [step]: {
          ...prev[step],
          currentSubStep: prev[step].currentSubStep + 1,
        },
      }))
    }
  }

  const completeOnboarding = async () => {
    try {
      await fetch('/api/user/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 4 }),
      })

      await fetch('/api/user/onboarding-complete', {
        method: 'POST',
      })

      setIsActive(false)
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  const markStepComplete = async () => {
    const nextStep = step + 1
    if (nextStep > 3) {
      completeOnboarding()
      return
    }

    try {
      await fetch('/api/user/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: nextStep }),
      })
      setStep(nextStep)
      setSubSteps(prev => ({
        ...prev,
        [nextStep]: { ...prev[nextStep], currentSubStep: 0 },
      }))
    } catch (error) {
      console.error('Error advancing step:', error)
    }
  }

  return (
    <OnboardingContext.Provider
      value={{
        step,
        setStep,
        subSteps,
        currentSubStep: subSteps[step]?.currentSubStep ?? 0,
        setCurrentSubStep,
        completeOnboarding,
        isActive,
        loading,
        advanceSubStep,
        markStepComplete,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}