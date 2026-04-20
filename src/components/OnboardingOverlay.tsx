'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useOnboarding } from '@/hooks/useOnboarding'
import { X, Check, ChevronRight, Sparkles } from 'lucide-react'

interface OnboardingStepConfig {
  route: string
  message: string
  targetSelector: string
}

const stepConfigs: Record<number, OnboardingStepConfig> = {
  1: {
    route: '/dashboard',
    message: 'Adicione uma foto sua para suas clientes confiarem mais',
    targetSelector: '[data-onboarding="avatar"]',
  },
  2: {
    route: '/dashboard/services',
    message: 'Crie seu primeiro serviço para suas clientes agendarem',
    targetSelector: '#novo-servico-btn',
  },
  3: {
    route: '/dashboard/public',
    message: 'Configure sua página pública para começar a receber agendamentos',
    targetSelector: '[data-onboarding="page-title"]',
  },
}

export default function OnboardingOverlay() {
  const router = useRouter()
  const currentPath = usePathname()

  const { step, isOnboardingActive, finishStep, advanceToStep } = useOnboarding()

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [showOpening, setShowOpening] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const currentConfig = stepConfigs[step]

  const shouldShow =
    isOnboardingActive &&
    !dismissed &&
    currentConfig &&
    currentPath === currentConfig.route

  // Opening Step 1
  useEffect(() => {
    if (
      isOnboardingActive &&
      !dismissed &&
      step === 1 &&
      currentPath === '/dashboard'
    ) {
      setShowOpening(true)
      const timer = setTimeout(() => setShowOpening(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnboardingActive, step, currentPath])

  // Encontrar elemento (robusto)
  useEffect(() => {
    if (!shouldShow) {
      setTargetRect(null)
      return
    }

    let attempts = 0

    const findElement = () => {
      const element = document.querySelector(
        currentConfig?.targetSelector || ''
      )

      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)

        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })

        return true
      }

      return false
    }

    const interval = setInterval(() => {
      const found = findElement()
      attempts++

      if (found || attempts > 15) {
        clearInterval(interval)
      }
    }, 300)

    return () => clearInterval(interval)
  }, [shouldShow, currentConfig?.targetSelector])

  // 🔥 CONTROLE REAL DO TOOLTIP (corrige Step 3)
  useEffect(() => {
    if (!shouldShow || !targetRect) return

    setShowTooltip(true)

    const timer = setTimeout(() => {
      setShowTooltip(false)
    }, 6000)

    return () => clearTimeout(timer)
  }, [step, shouldShow, targetRect])

  const handleDismiss = () => {
    setDismissed(true)
    finishStep()
  }

  const handleSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      handleDismiss()
    }, 2000)
  }

  if (!showOpening && !shouldShow) return null

  // Opening screen
  if (showOpening) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-2xl">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-rose-500" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Olá, seja bem-vinda! Vamos deixar sua agenda pronta em 2 minutos?
          </h2>
          <p className="text-gray-600 mb-6">
            Assim suas clientes já vão poder agendar sozinhas hoje.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowOpening(false)}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              Mais tarde
            </button>
            <button
              onClick={() => setShowOpening(false)}
              className="px-6 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors"
            >
              Começar agora
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Success feedback
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 pointer-events-none">
        <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="text-green-500" size={20} />
          </div>
          <span className="text-gray-900 font-medium">
            Link copiado! Agora é só enviar para suas clientes 🚀
          </span>
        </div>
      </div>
    )
  }

  if (!targetRect || !showTooltip) return null

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: targetRect.bottom + 16,
    left: 16,
    right: 16,
    maxWidth: '320px',
    margin: '0 auto',
    zIndex: 60,
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      <div className="absolute top-4 right-4 z-[70] pointer-events-auto">
        <button
          onClick={handleDismiss}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-white/80 hover:text-white bg-white/10 rounded-full backdrop-blur-sm"
        >
          <X size={14} />
          Mais tarde
        </button>
      </div>

      {/* Highlight */}
      <div
        className="absolute z-[55] pointer-events-none"
        style={{
          position: 'fixed',
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
          borderRadius: '8px',
          boxShadow:
            '0 0 0 4px rgba(236, 72, 153, 0.5), 0 0 20px rgba(236, 72, 153, 0.3)',
          animation: 'pulse-ring 1.5s ease-out infinite',
        }}
      />

      {/* Tooltip */}
      <div
        className="bg-white rounded-xl shadow-2xl p-4 max-w-sm z-[70] pointer-events-auto"
        style={tooltipStyle}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{step}/3</span>
        </div>

        <p className="text-gray-800 font-medium text-sm mb-3">
          {currentConfig?.message}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDismiss}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Mais tarde
          </button>

          <button
            onClick={() => {
              if (step === 1) {
                router.push('/dashboard/services')
              } else if (step === 2) {
                router.push('/dashboard/public')
              }
              advanceToStep(step + 1)
            }}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-rose-500 text-white text-xs rounded-lg hover:bg-rose-600"
          >
            Próximo
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.5), 0 0 20px rgba(236, 72, 153, 0.3); }
          50% { box-shadow: 0 0 0 8px rgba(236, 72, 153, 0.3), 0 0 30px rgba(236, 72, 153, 0.2); }
          100% { box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.5), 0 0 20px rgba(236, 72, 153, 0.3); }
        }
      `}</style>
    </div>
  )
}

export { OnboardingOverlay }