'use client'

import { AuthProvider } from '@/context/AuthContext'
import { OnboardingProvider } from '@/hooks/useOnboarding'
import { OnboardingOverlay } from '@/components/OnboardingOverlay'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <OnboardingProvider>
        {children}
        <OnboardingOverlay />
      </OnboardingProvider>
    </AuthProvider>
  )
}
