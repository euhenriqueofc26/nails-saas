'use client'

import { useEffect, useState, useRef } from 'react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { X, Camera } from 'lucide-react'

interface OnboardingStepConfig {
  route: string
  message: string
  targetSelector: string
  highlightSelector?: string
}

const stepConfigs: Record<number, OnboardingStepConfig> = {
  1: {
    route: '/dashboard',
    message: 'Clique no ícone da câmera para adicionar sua foto de perfil',
    targetSelector: '[data-onboarding="avatar"]',
  },
  2: {
    route: '/dashboard/services',
    message: 'Clique em Novo Serviço para criar seu primeiro serviço',
    targetSelector: '#novo-servico-btn',
  },
  3: {
    route: '/dashboard/public',
    message: 'Preencha os campos e clique em Salvar, depois copie o link',
    targetSelector: '[data-onboarding="save"]',
  },
}

export default function OnboardingOverlay() {
  const { step, isOnboardingActive, finishStep } = useOnboarding()
  const [currentPath, setCurrentPath] = useState('')
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [positioned, setPositioned] = useState(false)
  
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

  useEffect(() => {
    if (!shouldShow) {
      setTargetRect(null)
      setPositioned(false)
      return
    }

    const findAndPosition = () => {
      const selector = currentConfig.targetSelector
      const element = document.querySelector(selector)
      
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)
        
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        setTimeout(() => setPositioned(true), 400)
      }
    }

    findAndPosition()
    
    const interval = setInterval(findAndPosition, 500)
    setTimeout(() => clearInterval(interval), 3000)

    return () => clearInterval(interval)
  }, [shouldShow, currentPath, step])

  const handleSkip = () => {
    finishStep()
  }

  if (!shouldShow || !targetRect) {
    return (
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div className="absolute top-4 right-4 z-50 pointer-events-auto">
          <button
            onClick={handleSkip}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-white/80 hover:text-white bg-white/10 rounded-full backdrop-blur-sm transition-colors"
          >
            <X size={14} />
            Pular
          </button>
        </div>
      </div>
    )
  }

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: targetRect.bottom + 10,
    left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 340)),
    zIndex: 51,
  }

  const arrowStyle: React.CSSProperties = targetRect ? {
    position: 'fixed',
    top: targetRect.top - 8,
    left: targetRect.left + targetRect.width / 2 - 8,
  } : {}

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/60 pointer-events-auto" />
      
      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <button
          onClick={handleSkip}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-white/80 hover:text-white bg-white/10 rounded-full backdrop-blur-sm transition-colors"
        >
          <X size={14} />
          Pular
        </button>
      </div>

      <div 
        className="absolute z-[51]"
        style={{
          position: 'fixed',
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
          borderRadius: '8px',
          boxShadow: '0 0 0 4px rgba(236, 72, 153, 0.5), 0 0 20px rgba(236, 72, 153, 0.3)',
          animation: 'pulse-ring 1.5s ease-out infinite',
        }}
      />

      <svg 
        className="fixed z-[51] text-rose-500" 
        style={arrowStyle}
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="currentColor"
      >
        <path d="M8 0L16 8L8 16L7 14L12 8L7 2L8 0Z" />
      </svg>

      <div 
        className="bg-white rounded-xl shadow-2xl p-4 max-w-sm z-[52]"
        style={tooltipStyle}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-rose-500 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-500 font-medium">{step}/3</span>
        </div>

        <p className="text-gray-800 font-medium text-sm">
          {currentConfig?.message}
        </p>
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