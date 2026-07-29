'use client'

import { useState } from 'react'
import { ArrowLeft, Mail, Scissors } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao solicitar recuperação')
      }

      setSent(true)
      toast.success('Email enviado! Verifique sua caixa de entrada.')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nude-50 via-rose-50 to-nude-100 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 items-center justify-center p-12">
        <div className="text-white text-center max-w-lg">
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full">
            <Scissors className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold mb-4">ClubNailsBrasil</h1>
          <p className="text-xl text-white/90 mb-8">
            Organize sua agenda, gerencie clientes e controle seu financeiro em um só lugar.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-500 rounded-full mb-4">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-nude-900">ClubNailsBrasil</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-nude-900 mb-2">
              Recuperar senha
            </h2>
            <p className="text-nude-600 mb-6">
              {sent
                ? 'Enviamos um email com as instruções para redefinir sua senha.'
                : 'Digite seu email cadastrado e enviaremos o link de recuperação.'}
            </p>

            {sent ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-nude-500">
                  Não recebeu? Verifique a caixa de spam ou tente novamente.
                </p>
                <Link
                  href="/entrar"
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Voltar ao login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-nude-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Enviar link de recuperação'
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/entrar"
                className="text-rose-600 hover:text-rose-700 text-sm inline-flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Voltar ao login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
