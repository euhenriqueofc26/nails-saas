'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Check, CreditCard, Smartphone, Barcode, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

const plansData: Record<string, { name: string; price: number; period: string }> = {
  pro: { name: 'Plano Pro', price: 49.9, period: 'mensal' },
  premium: { name: 'Plano Premium', price: 99.9, period: 'mensal' },
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [planSlug, setPlanSlug] = useState('')
  const [plan, setPlan] = useState<{ name: string; price: number; period: string } | null>(null)

  useEffect(() => {
    const p = searchParams.get('plan')
    if (p && plansData[p]) {
      setPlanSlug(p)
      setPlan(plansData[p])
    }
  }, [searchParams])

  const handlePayment = async () => {
    if (!plan) return

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Pagamento simulado com sucesso!')
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      toast.error('Erro ao processar pagamento')
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
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-rose-500 bg-rose-50' : 'border-nude-200'}`}>
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="sr-only"
              />
              <CreditCard className="w-6 h-6 text-nude-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-nude-900">Cartão de crédito</p>
                <p className="text-sm text-nude-600">Parcele em até 12x</p>
              </div>
              {paymentMethod === 'card' && <Check className="w-5 h-5 text-rose-500" />}
            </label>

            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'pix' ? 'border-rose-500 bg-rose-50' : 'border-nude-200'}`}>
              <input
                type="radio"
                name="payment"
                value="pix"
                checked={paymentMethod === 'pix'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="sr-only"
              />
              <Smartphone className="w-6 h-6 text-nude-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-nude-900">PIX</p>
                <p className="text-sm text-nude-600">Aprovação instantânea</p>
              </div>
              {paymentMethod === 'pix' && <Check className="w-5 h-5 text-rose-500" />}
            </label>

            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'boleto' ? 'border-rose-500 bg-rose-50' : 'border-nude-200'}`}>
              <input
                type="radio"
                name="payment"
                value="boleto"
                checked={paymentMethod === 'boleto'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="sr-only"
              />
              <Barcode className="w-6 h-6 text-nude-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-nude-900">Boleto bancário</p>
                <p className="text-sm text-nude-600">Vence em 3 dias úteis</p>
              </div>
              {paymentMethod === 'boleto' && <Check className="w-5 h-5 text-rose-500" />}
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-nude-600">Subtotal</span>
            <span className="text-nude-900">{formatCurrency(plan.price)}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-nude-600">Taxa (0%)</span>
            <span className="text-green-600">R$ 0,00</span>
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
              Processando...
            </>
          ) : (
            <>Pagar {formatCurrency(plan.price)}</>
          )}
        </button>

        <p className="text-center text-sm text-nude-500 mt-4">
          Pagamento seguro. Cancelamento a qualquer momento.
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
