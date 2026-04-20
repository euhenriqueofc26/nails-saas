'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Scissors, ArrowRight, Check, Star, Users, Calendar, DollarSign, MessageCircle, Shield, Heart, Quote, Sparkles, Clock, Instagram, Globe, Wallet, AlertCircle, CheckCircle2, X, Copy, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    whatsapp: '',
    studioName: '',
    instagram: '',
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100">
      {/* Header */}
      <header className="py-4 px-6 bg-white/80 backdrop-blur-sm border-b border-rose-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-nude-900">ClubNailsBrasil</span>
          </div>
          <Link href="/entrar" className="text-rose-600 hover:text-rose-700 font-medium text-sm">
            Entrar →
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="py-16 md:py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-nude-900 mb-6 leading-tight">
            Pare de perder<br />
            <span className="text-rose-500">clientes antigas.</span>
          </h1>
          
          <p className="text-xl text-nude-600 mb-4">
            Recupere suas clientes e aumente seu faturamento com mensagens prontas no WhatsApp em segundos 💅
          </p>
          
          <p className="text-nude-500 mb-8">
            Nail designers já estão usando para encher a agenda sem depender de Instagram.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a href="#form" className="btn btn-primary px-8 py-4 text-lg">
              Quero recuperar minhas clientes
            </a>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-nude-500">
            <div className="flex items-center gap-1">
              <Check size={16} className="text-green-500" />
              <span>15 dias grátis</span>
            </div>
            <div className="flex items-center gap-1">
              <Check size={16} className="text-green-500" />
              <span>Sem cartão</span>
            </div>
            <div className="flex items-center gap-1">
              <Check size={16} className="text-green-500" />
              <span>Comece agora</span>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 1 - O DIFERENCIAL */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-nude-900 mb-8">
            💬 Recupere clientes com 1 clique
          </h2>
          
          <div className="bg-rose-50 rounded-2xl p-8">
            <p className="text-nude-700 mb-6">
              Você não precisa correr atrás.<br />
              Nem lembrar quem sumiu.
            </p>
            
            <p className="text-nude-600 mb-6">O ClubNailsBrasil faz isso por você:</p>
            
            <div className="flex flex-col gap-4 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <Check size={16} />
                </div>
                <span className="text-nude-700">Selecione a cliente</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <Check size={16} />
                </div>
                <span className="text-nude-700">Escolha uma promoção pronta</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <Check size={16} />
                </div>
                <span className="text-nude-700">Envie direto no WhatsApp</span>
              </div>
            </div>
            
            <p className="mt-6 text-rose-600 font-medium">
              Simples. Rápido. E funciona.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2 - DOR */}
      <section className="py-16 px-4 bg-rose-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-nude-900 mb-8">
            Você também passa por isso?
          </h2>
          
          <div className="space-y-4 text-left">
            <div className="bg-white p-4 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-500 flex-shrink-0" />
              <span className="text-nude-700">Clientes que somem e nunca mais voltam</span>
            </div>
            <div className="bg-white p-4 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-500 flex-shrink-0" />
              <span className="text-nude-700">Demora para responder no WhatsApp</span>
            </div>
            <div className="bg-white p-4 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-500 flex-shrink-0" />
              <span className="text-nude-700">Agenda com horários vazios</span>
            </div>
            <div className="bg-white p-4 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-500 flex-shrink-0" />
              <span className="text-nude-700">Promoções que você esquece de fazer</span>
            </div>
          </div>
          
          <p className="mt-8 text-lg text-nude-600">
            Isso não é falta de cliente.<br />
            <span className="font-bold text-nude-900">É falta de sistema.</span>
          </p>
        </div>
      </section>

      {/* SEÇÃO 3 - RESULTADO */}
      <section className="py-16 px-4 bg-gradient-to-br from-rose-500 to-rose-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">
            Mais clientes voltando = mais dinheiro no seu bolso 💸
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 p-6 rounded-xl">
              <CheckCircle2 size={32} className="mx-auto mb-3" />
              <p className="font-medium">Reativa clientes antigas automaticamente</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <CheckCircle2 size={32} className="mx-auto mb-3" />
              <p className="font-medium">Preenche horários vazios da agenda</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <CheckCircle2 size={32} className="mx-auto mb-3" />
              <p className="font-medium">Aumenta seu faturamento sem esforço</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <CheckCircle2 size={32} className="mx-auto mb-3" />
              <p className="font-medium">Profissionaliza seu atendimento</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4 - FUNCIONALIDADES */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-nude-900 text-center mb-10">
            Tudo que você precisa em um só lugar
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-rose-50 p-6 rounded-2xl">
              <Calendar size={32} className="text-rose-500 mb-3" />
              <h3 className="font-bold text-nude-900 mb-2">Agenda Inteligente</h3>
              <p className="text-nude-600 text-sm">Clientes agendam sozinhas 24h por dia</p>
            </div>
            <div className="bg-rose-50 p-6 rounded-2xl">
              <MessageCircle size={32} className="text-rose-500 mb-3" />
              <h3 className="font-bold text-nude-900 mb-2">WhatsApp Automático</h3>
              <p className="text-nude-600 text-sm">Confirmações e lembretes sem você precisar responder</p>
            </div>
            <div className="bg-rose-50 p-6 rounded-2xl">
              <Users size={32} className="text-rose-500 mb-3" />
              <h3 className="font-bold text-nude-900 mb-2">Cadastro de Clientes</h3>
              <p className="text-nude-600 text-sm">Histórico completo + contato sempre salvo</p>
            </div>
            <div className="bg-rose-50 p-6 rounded-2xl">
              <DollarSign size={32} className="text-rose-500 mb-3" />
              <h3 className="font-bold text-nude-900 mb-2">Controle Financeiro</h3>
              <p className="text-nude-600 text-sm">Saiba exatamente quanto você ganha</p>
            </div>
            <div className="bg-rose-50 p-6 rounded-2xl">
              <Globe size={32} className="text-rose-500 mb-3" />
              <h3 className="font-bold text-nude-900 mb-2">Página Profissional</h3>
              <p className="text-nude-600 text-sm">Seu próprio link para receber agendamentos</p>
            </div>
            <div className="bg-rose-50 p-6 rounded-2xl">
              <Sparkles size={32} className="text-rose-500 mb-3" />
              <h3 className="font-bold text-nude-900 mb-2">Promoções Prontas</h3>
              <p className="text-nude-600 text-sm">Templates para enviar com 1 clique</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 5 - COMO FUNCIONA */}
      <section className="py-16 px-4 bg-rose-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-nude-900 mb-10">
            Começar é simples:
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl">
              <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                1
              </div>
              <p className="text-nude-700 font-medium">Crie sua conta grátis</p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                2
              </div>
              <p className="text-nude-700 font-medium">Configure seus serviços (menos de 2 minutos)</p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                3
              </div>
              <p className="text-nude-700 font-medium">Comece a receber agendamentos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form + CTA Final */}
      <section className="py-16 px-4 bg-gradient-to-br from-rose-500 to-rose-600 text-white" id="form">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              Sua agenda não vai se encher sozinha.
            </h2>
            <p className="text-xl text-white/90 mb-6">
              Comece agora e traga suas clientes de volta hoje mesmo 💅
            </p>
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <p className="font-medium mb-4">Teste grátis por 15 dias</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check size={16} /> Sem cartão de crédito
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} /> Sem compromisso
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} /> Cancele quando quiser
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 text-nude-900">
            <h3 className="text-2xl font-bold mb-2">
              {isLogin ? 'Entrar' : 'Criar conta grátis'}
            </h3>
            <p className="text-nude-600 mb-6">
              {isLogin ? 'Gerencie seu negócio' : 'Comece a organizar seu studio'}
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
                  <div>
                    <label className="block text-sm font-medium text-nude-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      placeholder="@seuinstagram"
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
                    {isLogin ? 'Entrar' : 'Criar conta grátis'}
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
                {isLogin ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-rose-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-nude-900 text-center mb-10">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl">
              <h3 className="font-semibold text-nude-900 mb-2">Precisa de cartão?</h3>
              <p className="text-nude-600 text-sm">Não! Você tem 15 dias grátis para testar.</p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <h3 className="font-semibold text-nude-900 mb-2">Funciona no celular?</h3>
              <p className="text-nude-600 text-sm">Sim! A plataforma é responsiva.</p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <h3 className="font-semibold text-nude-900 mb-2">Posso cancelar?</h3>
              <p className="text-nude-600 text-sm">Sim! Sem multas, quando quiser.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-nude-900 text-white/60 text-center text-sm">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <a href="/politica-privacidade" className="hover:text-rose-400">Política de Privacidade</a>
            <a href="/termos-de-uso" className="hover:text-rose-400">Termos de Uso</a>
            <a href="https://instagram.com/clubnailsbrasilofc" target="_blank" className="hover:text-rose-400">Instagram</a>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">ClubNailsBrasil</span>
          </div>
          
          <p>Feito por e para nail designers 💅</p>
          <p className="mt-2">© 2026 ClubNailsBrasil. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}