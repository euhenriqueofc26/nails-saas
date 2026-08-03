'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Check, Crown, Zap, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

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

const features = [
  { name: 'Período Trial', free: '15 dias', pro: '15 dias', premium: '15 dias' },
  { name: 'Clientes', free: '10', pro: '100', premium: 'Ilimitado' },
  { name: 'Agendamentos/mês', free: '50', pro: '200', premium: 'Ilimitado' },
  { name: 'Serviços', free: '5', pro: '20', premium: 'Ilimitado' },
  { name: 'Página pública', free: true, pro: true, premium: true },
  { name: 'Controle financeiro', free: false, pro: true, premium: true },
  { name: 'Análises', free: false, pro: true, premium: true },
  { name: 'WhatsApp automático', free: false, pro: false, premium: true },
  { name: 'IA Secretária', free: false, pro: false, premium: true },
]

export default function PlansPage() {
  const router = useRouter()
  const { token, user } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/plans')
        const data = await res.json()
        if (res.ok) setPlans(data.plans)
      } catch {
        console.error('Erro ao buscar planos')
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const currentPlan = user?.plan?.slug || user?.planId || 'free'

  const now = new Date()
  const hasActiveSubscription = !!user?.subscriptionEndsAt && new Date(user.subscriptionEndsAt) > now
  const trialEnds = user?.trialEndsAt ? new Date(user.trialEndsAt) : null
  const inTrial = !!trialEnds && trialEnds > now && !hasActiveSubscription
  const accessExpired = !hasActiveSubscription && (!trialEnds || trialEnds <= now)

  const handleUpgrade = async (planId: string) => {
    router.push(`/checkout?plan=${planId}`)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-nude-500">Carregando planos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-nude-900">Escolha seu plano</h1>
        <p className="text-nude-600 mt-2">
          Selecione o plano ideal para o seu negócio
        </p>
      </div>

      {inTrial && (
        <div className="max-w-3xl mx-auto bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
          <p className="font-medium text-nude-800">
            Você está no período de teste (15 dias) com acesso ao plano Premium
            {trialEnds && (
              <> — o teste expira em <span className="font-semibold">{trialEnds.toLocaleDateString('pt-BR')}</span>.</>
            )}
          </p>
          <p className="text-sm text-nude-600 mt-1">
            Escolha um plano agora para não perder o acesso quando o teste terminar.
          </p>
        </div>
      )}

      {accessExpired && (
        <div className="max-w-3xl mx-auto bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
          <p className="font-medium text-nude-800">
            Seu acesso expirou. Escolha um plano para continuar usando a plataforma.
          </p>
          <p className="text-sm text-nude-600 mt-1">Seus dados estão preservados.</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = hasActiveSubscription && currentPlan === plan.slug
          const isFree = plan.price === 0

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
                  const value = (feature as any)[plan.slug]
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
                onClick={() => handleUpgrade(plan.slug)}
                disabled={isCurrent || isFree}
                className={`btn w-full ${
                  isCurrent || isFree
                    ? 'bg-nude-200 text-nude-700 cursor-default'
                    : plan.slug === 'premium'
                    ? 'bg-gold-500 hover:bg-gold-600 text-white'
                    : 'btn-primary'
                }`}
              >
                {isCurrent ? 'Plano atual' : isFree ? 'Plano grátis' : inTrial ? 'Assinar agora' : 'Assinar'}
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
