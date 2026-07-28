'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Check, CreditCard, Smartphone, Barcode, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

const plansData: Record<string, { name: string; price: number; period: string }> = {
  pro: { name: 'Plano Pro', price: 49.9, period: 'mensal' },
  premium: { name: 'Plano Premium', price: 99.9, period: 'mensal' },
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [planSlug, setPlanSlug] = useState('')
  const [plan, setPlan] = useState<{ name: string; price: number; period: string } | null>(null)

  useEffect(() => {
    const p = searchParams.get('plan')
    const status = searchParams.get('status')
    if (status === 'failure') {
      toast.error('Pagamento não foi concluído')
    } else if (status === 'pending') {
      toast('Pagamento pendente. Assim que for confirmado, seu plano será ativado.')
    }
    if (p && plansData[p]) {
      setPlanSlug(p)
      setPlan(plansData[p])
    }
  }, [searchParams])

  const handlePayment = async () => {
    if (!plan) return

    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planId: planSlug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      window.location.href = data.checkoutUrl
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nude-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-nude-900 text-center mb-8">
          Finalizar Assinatura
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-nude-900 mb-4">Plano selecionado</h2>
          <div className="flex justify-between items-center p-4 bg-nude-100 rounded-xl">
            <div>
              <p className="font-semibold text-nude-900">{plan.name}</p>
              <p className="text-sm text-nude-600">Cobrança {plan.period}</p>
            </div>
            <p className="text-2xl font-bold text-rose-500">
              {formatCurrency(plan.price)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-nude-900 mb-4">Forma de pagamento</h2>

          <div className="space-y-3">
            <div className="flex items-center p-4 border-2 border-nude-200 rounded-xl bg-nude-50">
              <CreditCard className="w-6 h-6 text-nude-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-nude-900">Cartão de crédito</p>
                <p className="text-sm text-nude-500">Parcele em até 12x</p>
              </div>
            </div>
            <div className="flex items-center p-4 border-2 border-nude-200 rounded-xl bg-nude-50">
              <Smartphone className="w-6 h-6 text-nude-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-nude-900">PIX</p>
                <p className="text-sm text-nude-500">Aprovação instantânea</p>
              </div>
            </div>
            <div className="flex items-center p-4 border-2 border-nude-200 rounded-xl bg-nude-50">
              <Barcode className="w-6 h-6 text-nude-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-nude-900">Boleto bancário</p>
                <p className="text-sm text-nude-500">Vence em 3 dias úteis</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-nude-400 mt-3">
            Você escolherá a forma de pagamento no ambiente seguro do MercadoPago.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-nude-600">Subtotal</span>
            <span className="text-nude-900">{formatCurrency(plan.price)}</span>
          </div>
          <hr className="my-4 border-nude-200" />
          <div className="flex justify-between items-center text-lg font-bold">
            <span className="text-nude-900">Total</span>
            <span className="text-rose-500">{formatCurrency(plan.price)}</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full mt-6 btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Redirecionando para pagamento...
            </>
          ) : (
            <>Ir para pagamento - {formatCurrency(plan.price)}</>
          )}
        </button>

        <p className="text-center text-sm text-nude-500 mt-4">
          Pagamento processado pelo MercadoPago. Ambiente 100% seguro.
        </p>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
