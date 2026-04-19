'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'

interface OnboardingStep {
  currentSubStep: number
  subSteps: string[]
}

interface OnboardingContextType {
  step: number
  setStep: (step: number) => void
  subSteps: Record<number, OnboardingStep>
  currentSubStep: number
  advanceToStep: (nextStep: number) => Promise<void>
  advanceSubStep: (step?: number) => void
  isOnboardingActive: boolean
  finishStep: () => Promise<void>
}

const defaultSubSteps: Record<number, OnboardingStep> = {
  1: { subSteps: ['avatar'], currentSubStep: 0 },
  2: { subSteps: ['createService'], currentSubStep: 0 },
  3: { 
    subSteps: ['coverImage', 'bio', 'address', 'workingHours', 'socials', 'save', 'viewPage'], 
    currentSubStep: 0 
  },
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1)
  const [subSteps, setSubSteps] = useState<Record<number, OnboardingStep>>(defaultSubSteps)
  const [isOnboardingActive, setIsOnboardingActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasFetched, setHasFetched] = useState(false)
  const [previousAvatar, setPreviousAvatar] = useState<string | null>(null)

  const { token, isLoading: authLoading, user } = useAuth()

  const fetchOnboardingStatus = async () => {
    try {
      const res = await fetch('/api/user/onboarding', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()

      if (data.showOnboarding && !data.onboardingCompleted) {
        setStep(data.onboardingStep || 1)
        setIsOnboardingActive(true)
      }
    } catch (error) {
      console.error('Error fetching onboarding:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setHasFetched(false)
  }, [user?.id])

  useEffect(() => {
    if (!authLoading && token && user && !hasFetched) {
      fetchOnboardingStatus().then(() => {
        setHasFetched(true)
      })
    } else if (!authLoading && !token) {
      setLoading(false)
    }
  }, [authLoading, token, user, hasFetched])

  // Função para avançar para um step específico
  const advanceToStep = async (nextStep: number) => {
    if (nextStep > 3) {
      finishStep()
      return
    }

    try {
      await fetch('/api/user/onboarding', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ step: nextStep }),
      })
      setStep(nextStep)
    } catch (error) {
      console.error('Error advancing step:', error)
    }
  }

  // Função para avançar substep
  const advanceSubStep = (stepKey?: number) => {
    const targetStep = stepKey ?? step
    const currentStepData = subSteps[targetStep]
    if (!currentStepData) return

    if (currentStepData.currentSubStep < currentStepData.subSteps.length - 1) {
      setSubSteps(prev => ({
        ...prev,
        [targetStep]: {
          ...prev[targetStep],
          currentSubStep: prev[targetStep].currentSubStep + 1,
        },
      }))
    }
  }

  // Finalizar onboarding
  const finishStep = async () => {
    try {
      await fetch('/api/user/onboarding', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ step: 4 }),
      })

      await fetch('/api/user/onboarding-complete', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setIsOnboardingActive(false)
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  return (
    <OnboardingContext.Provider
      value={{
        step,
        setStep,
        subSteps,
        currentSubStep: subSteps[step]?.currentSubStep ?? 0,
        advanceToStep,
        advanceSubStep,
        isOnboardingActive,
        finishStep,
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