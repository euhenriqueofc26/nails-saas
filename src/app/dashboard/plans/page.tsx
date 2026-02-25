'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Check, Crown, Zap, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Plan {
  id: string
  name: string
  slug: string
  price: number
  maxClients: number
  maxAppointments: number
  maxServices: number
  hasFinancial: boolean
  hasPublicPage: boolean
  hasAnalytics: boolean
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    slug: 'free',
    price: 0,
    maxClients: 10,
    maxAppointments: 50,
    maxServices: 5,
    hasFinancial: false,
    hasPublicPage: true,
    hasAnalytics: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    slug: 'pro',
    price: 49.9,
    maxClients: 100,
    maxAppointments: 200,
    maxServices: 20,
    hasFinancial: true,
    hasPublicPage: true,
    hasAnalytics: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    slug: 'premium',
    price: 99.9,
    maxClients: -1,
    maxAppointments: -1,
    maxServices: -1,
    hasFinancial: true,
    hasPublicPage: true,
    hasAnalytics: true,
  },
]

const features = [
  { name: 'Clientes', free: '10', pro: '100', premium: 'Ilimitado' },
  { name: 'Agendamentos/mês', free: '50', pro: '200', premium: 'Ilimitado' },
  { name: 'Serviços', free: '5', pro: '20', premium: 'Ilimitado' },
  { name: 'Página pública', free: true, pro: true, premium: true },
  { name: 'Controle financeiro', free: false, pro: true, premium: true },
  { name: 'Análises', free: false, pro: true, premium: true },
]

export default function PlansPage() {
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string>('free')

  useEffect(() => {
    if (user) {
      setCurrentPlan(user.planId)
    }
  }, [user])

  const handleUpgrade = async (planId: string, planName: string) => {
    const adminWhatsApp = '11948746767'
    const message = encodeURIComponent(`Olá! Gostaria de assinar o plano ${planName} do ClubNailsBrasil.`)
    window.open(`https://wa.me/55${adminWhatsApp}?text=${message}`, '_blank')
  }

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'free': return <Star className="w-6 h-6" />
      case 'pro': return <Zap className="w-6 h-6" />
      case 'premium': return <Crown className="w-6 h-6" />
      default: return <Star className="w-6 h-6" />
    }
  }

  const getPlanColor = (slug: string) => {
    switch (slug) {
      case 'free': return 'bg-nude-200 text-nude-700'
      case 'pro': return 'bg-rose-500 text-white'
      case 'premium': return 'bg-gold-500 text-white'
      default: return 'bg-nude-200 text-nude-700'
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-nude-900">Escolha seu plano</h1>
        <p className="text-nude-600 mt-2">
          Selecione o plano ideal para o seu negócio
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.slug
          
          return (
            <div
              key={plan.id}
              className={`card relative ${isCurrent ? 'ring-2 ring-rose-500' : ''}`}
            >
              {plan.slug === 'pro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-xs px-3 py-1 rounded-full">
                  Mais popular
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${getPlanColor(plan.slug)}`}>
                  {getPlanIcon(plan.slug)}
                </div>
                <h3 className="text-xl font-bold text-nude-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-nude-900">
                    {plan.price === 0 ? 'Grátis' : formatCurrency(plan.price)}
                  </span>
                  {plan.price > 0 && <span className="text-nude-600">/mês</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {features.map((feature, i) => {
                  const freeValue = feature.free
                  const proValue = feature.pro
                  const premiumValue = feature.premium

                  let value: any
                  if (plan.slug === 'free') value = freeValue
                  else if (plan.slug === 'pro') value = proValue
                  else value = premiumValue

                  const isIncluded = typeof value === 'boolean' ? value : true

                  return (
                    <li key={i} className="flex items-center gap-2">
                      {isIncluded ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <span className="w-5 h-5 text-nude-300 flex-shrink-0">×</span>
                      )}
                      <span className={isIncluded ? 'text-nude-700' : 'text-nude-400'}>
                        {typeof value === 'boolean' ? feature.name : `${feature.name}: ${value}`}
                      </span>
                    </li>
                  )
                })}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.slug, plan.name)}
                disabled={loading || isCurrent}
                className={`btn w-full ${
                  isCurrent
                    ? 'bg-nude-200 text-nude-700 cursor-default'
                    : plan.slug === 'premium'
                    ? 'bg-gold-500 hover:bg-gold-600 text-white'
                    : 'btn-primary'
                }`}
              >
                {isCurrent ? 'Plano atual' : loading ? 'Processando...' : 'Assinar'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="bg-nude-100 rounded-xl p-6 max-w-3xl mx-auto">
        <h3 className="font-semibold text-nude-900 mb-4">Perguntas frequentes</h3>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-nude-800">Posso cancelar a qualquer momento?</p>
            <p className="text-sm text-nude-600">Sim, você pode cancelar seu plano quando quiser. O acesso permanece até o fim do período pago.</p>
          </div>
          <div>
            <p className="font-medium text-nude-800">Quais formas de pagamento são aceitas?</p>
            <p className="text-sm text-nude-600">Aceitamos cartão de crédito, PIX e boleto bancário.</p>
          </div>
          <div>
            <p className="font-medium text-nude-800">O que acontece com meus dados se eu mudar de plano?</p>
            <p className="text-sm text-nude-600">Seus dados são sempre seus e permanecem preservados ao mudar de plano.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
