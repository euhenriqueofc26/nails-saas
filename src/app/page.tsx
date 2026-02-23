'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Scissors, ArrowRight } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    whatsapp: '',
    studioName: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isLogin ? '/api/auth/login' : '/api/register'

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin 
          ? { email: formData.email, password: formData.password }
          : formData
        ),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar solicitação')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      toast.success(isLogin ? 'Bem-vindo de volta!' : 'Conta criada com sucesso!')
      window.location.href = '/dashboard'
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
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-lg">
              <div className="w-2 h-2 bg-gold-400 rounded-full" />
              <span>Agendamentos online automáticos</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-lg">
              <div className="w-2 h-2 bg-gold-400 rounded-full" />
              <span>CRM completo de clientes</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-lg">
              <div className="w-2 h-2 bg-gold-400 rounded-full" />
              <span>Controle financeiro detalhado</span>
            </div>
          </div>
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
              {isLogin ? 'Entrar' : 'Criar conta'}
            </h2>
            <p className="text-nude-600 mb-6">
              {isLogin 
                ? 'Gerencie seu negócio de.unhas' 
                : 'Comece a gerenciar seu salão hoje'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-nude-700 mb-1">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nude-700 mb-1">
                      Nome do Studio
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={formData.studioName}
                      onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
                      placeholder="Ex: Studio Maria Unhas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nude-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      className="input"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nude-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-nude-400 hover:text-nude-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Entrar' : 'Criar conta'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-rose-600 hover:text-rose-700 text-sm"
              >
                {isLogin 
                  ? 'Não tem conta? Criar agora' 
                  : 'Já tem conta? Entrar'}
              </button>
            </div>

            {isLogin && (
              <div className="mt-4 text-center">
                <a href="/forgot-password" className="text-sm text-nude-500 hover:text-nude-700">
                  Esqueceu a senha?
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
