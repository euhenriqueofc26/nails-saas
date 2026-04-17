'use client'

import { useEffect, useState } from 'react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { X, Check, ChevronRight } from 'lucide-react'

interface OnboardingStepConfig {
  route: string
  targetElement?: string
  message: string
  subSteps?: {
    element?: string
    message: string
    advanceOn?: 'blur' | 'click' | 'submit' | 'manual'
  }[]
}

const stepConfigs: Record<number, OnboardingStepConfig> = {
  1: {
    route: '/dashboard',
    targetElement: '[data-onboarding="avatar"]',
    message: 'Adicione uma foto sua para gerar mais confiança nas suas clientes 💅',
  },
  2: {
    route: '/dashboard/services',
    targetElement: '[data-onboarding="service-form"]',
    message: 'Vamos adicionar seus serviços? Comece pelo nome 💅',
    subSteps: [
      { element: 'service-name', message: 'Nome do serviço (ex: Unha em gel)', advanceOn: 'blur' },
      { element: 'service-price', message: 'Defina o valor do serviço', advanceOn: 'blur' },
      { element: 'service-duration', message: 'Quanto tempo você leva nesse atendimento?', advanceOn: 'blur' },
      { element: 'service-image', message: 'Adicione uma imagem para atrair suas clientes', advanceOn: 'manual' },
      { element: 'service-description', message: 'Opcional: descreva o serviço', advanceOn: 'blur' },
      { element: 'service-create', message: 'Clique em criar serviço para continuar', advanceOn: 'click' },
    ],
  },
  3: {
    route: '/dashboard/public',
    targetElement: '[data-onboarding="copy-link"]',
    message: 'Esse é o seu link de agendamento. Vamos deixá-lo pronto para suas clientes 💅',
    subSteps: [
      { element: 'cover-image', message: 'Adicione uma imagem do seu trabalho ou studio', advanceOn: 'manual' },
      { element: 'bio', message: 'Descreva seu trabalho (ex: especialista em unhas em gel)', advanceOn: 'blur' },
      { element: 'address', message: 'Informe onde você atende', advanceOn: 'blur' },
      { element: 'working-hours', message: 'Defina seus horários disponíveis', advanceOn: 'blur' },
      { element: 'socials', message: 'Adicione seu Instagram para mais credibilidade', advanceOn: 'blur' },
      { element: 'save', message: 'Salve as configurações para continuar', advanceOn: 'click' },
      { element: 'copy-link', message: 'Agora copie seu link e envie no WhatsApp para começar a receber agendamentos! 🎉', advanceOn: 'click' },
    ],
  },
}

export default function OnboardingOverlay() {
  const { step, subSteps, isActive, loading, advanceSubStep, completeOnboarding, setStep, markStepComplete } = useOnboarding()
  const [currentPath, setCurrentPath] = useState('')
  const [showTooltip, setShowTooltip] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [])

  const currentConfig = stepConfigs[step]
  const currentSubStepIndex = subSteps[step]?.currentSubStep ?? 0
  const currentSubStepConfig = currentConfig?.subSteps?.[currentSubStepIndex]

  const shouldShow = isActive && 
    !loading && 
    currentConfig && 
    (currentPath === currentConfig.route || 
     currentPath === `/dashboard` && currentConfig.route === '/dashboard' ||
     currentPath.includes(currentConfig.route.replace('/dashboard', '')))

  if (!shouldShow) return null

  const progress = (step / 3) * 100

  const handleNext = () => {
    if (step < 3) {
      markStepComplete()
    } else {
      completeOnboarding()
    }
  }

  const handleSkip = () => {
    setStep(4)
    completeOnboarding()
  }

  const handleCopySuccess = () => {
    if (step === 3 && currentSubStepIndex === 6) {
      completeOnboarding()
    }
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
            {currentSubStepConfig?.message || currentConfig?.message}
          </p>

          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Mais tarde
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white text-sm font-medium rounded-lg hover:bg-rose-600 transition-colors"
            >
              {step === 3 && currentSubStepIndex === 6 ? 'Concluir!' : 'Próximo'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { OnboardingOverlay }