'use client'

import { useEffect, useState } from 'react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { X, ChevronRight } from 'lucide-react'

interface OnboardingStepConfig {
  route: string
  message: string
}

const stepConfigs: Record<number, OnboardingStepConfig> = {
  1: {
    route: '/dashboard',
    message: 'Adicione uma foto sua para gerar mais confiança nas suas clientes 💅',
  },
  2: {
    route: '/dashboard/services',
    message: 'Vamos adicionar seus serviços para começar a agenda💅',
  },
  3: {
    route: '/dashboard/public',
    message: 'Configure sua página pública para suas clientes agendarem 💅',
  },
}

export default function OnboardingOverlay() {
  const { step, currentSubStep, isOnboardingActive, advanceToStep, finishStep } = useOnboarding()
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [])

  const currentConfig = stepConfigs[step]
  const shouldShow = isOnboardingActive && currentConfig && (
    currentPath === currentConfig.route || 
    currentPath === '/dashboard'
  )

  if (!shouldShow) return null

  const progress = (step / 3) * 100

  const handleSkip = () => {
    finishStep()
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" />
      
      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <button
          onClick={handleSkip}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-white/80 hover:text-white bg-white/10 rounded-full backdrop-blur-sm transition-colors"
        >
          <X size={14} />
          Pular
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-md w-full px-4">
        <div className="bg-white rounded-xl shadow-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 font-medium">{step}/3</span>
          </div>

          <p className="text-gray-800 font-medium text-sm mb-4">
            {currentConfig?.message}
          </p>

          <div className="flex items-center justify-end">
            <span className="text-xs text-gray-400 mr-auto">
              {step === 1 ? 'Adicione sua foto' : 
               step === 2 ? 'Crie um serviço' : 
               'Configure sua página'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export { OnboardingOverlay }