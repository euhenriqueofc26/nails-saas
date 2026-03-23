'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Scissors, ArrowRight, Check, Star, Users, Calendar, DollarSign, MessageCircle, Shield, Heart, Quote, Sparkles } from 'lucide-react'
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
          <Link href="/fundadoras" className="text-rose-600 hover:text-rose-700 font-medium text-sm">
            Conhecer plataforma →
          </Link>
        </div>
      </header>

      {/* Hero + Form */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Benefits */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles size={16} />
                Programa de Early Access
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-nude-900 mb-4 leading-tight">
                Organize sua agenda,<br />
                <span className="text-rose-500">conquiste clientes</span><br />
                e ganhe mais!
              </h1>
              
              <p className="text-lg text-nude-600 mb-8">
                A plataforma completa para nail designers que querem se profissionalizar e aumentar o faturamento.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Calendar, text: 'Agendamento 24h' },
                  { icon: Users, text: 'Cadastro de clientes' },
                  { icon: DollarSign, text: 'Controle financeiro' },
                  { icon: MessageCircle, text: 'Zap automático' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white p-3 rounded-xl shadow-sm">
                    <item.icon size={20} className="text-rose-500" />
                    <span className="text-sm font-medium text-nude-700">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-nude-500">
                <div className="flex items-center gap-1">
                  <Check size={16} className="text-green-500" />
                  <span>30 dias grátis</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check size={16} className="text-green-500" />
                  <span>Sem cartão</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check size={16} className="text-green-500" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8" id="form">
              <h2 className="text-2xl font-bold text-nude-900 mb-2">
                {isLogin ? 'Entrar' : 'Criar conta grátis'}
              </h2>
              <p className="text-nude-600 mb-6">
                {isLogin 
                  ? 'Gerencie seu negócio de unhas' 
                  : 'Comece a organizar seu studio hoje'}
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
                  {isLogin 
                    ? 'Não tem conta? Criar agora' 
                    : 'Já tem conta? Entrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-rose-500">2.500+</p>
              <p className="text-sm text-nude-600">Nail Designers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-rose-500">4.9/5</p>
              <div className="flex justify-center gap-0.5 mt-1">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-rose-500">15.000+</p>
              <p className="text-sm text-nude-600">Clientes agendados</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-rose-500">98%</p>
              <p className="text-sm text-nude-600">Satisfeitos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 px-4 bg-rose-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-nude-900 text-center mb-10">
            O que nail designers dizem
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Finalmente minhas clientes agendam sozinhas! Economizo 2 horas por dia.", name: "Camila Silva", city: "São Paulo" },
              { quote: "Perdi a conta de quantas vezes eu esquecia de responder. Agora nunca mais.", name: "Juliana Santos", city: "Rio de Janeiro" },
              { quote: "Minhas finanças agora são claras. Sei exatamente quanto faturo por mês.", name: "Patrícia Oliveira", city: "Belo Horizonte" },
            ].map((d, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                <Quote size={24} className="text-rose-300 mb-3" />
                <p className="text-nude-700 italic mb-4">"{d.quote}"</p>
                <p className="font-semibold text-nude-900">{d.name}</p>
                <p className="text-sm text-nude-500">{d.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-nude-900 text-center mb-10">
            Tudo que você precisa em um só lugar
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Calendar, title: 'Agenda Inteligente', desc: 'Suas clientes agendam 24h. Você só recebe confirmação.' },
              { icon: Users, title: 'Cadastro de Clientes', desc: 'Nome, WhatsApp, histórico. Tudo salvo para sempre.' },
              { icon: DollarSign, title: 'Controle Financeiro', desc: 'Receita, despesa, lucro. Números claros.' },
              { icon: MessageCircle, title: 'Zap Automático', desc: 'Confirmação e lembrete no WhatsApp automático.' },
              { icon: Shield, title: 'Página Profissional', desc: 'Link próprio com seus serviços e portfólio.' },
              { icon: Heart, title: 'Suporte', desc: 'Estamos aqui para te ajudar sempre.' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-rose-50">
                <div className="w-14 h-14 bg-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-nude-900 mb-2">{item.title}</h3>
                <p className="text-sm text-nude-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-rose-500 to-rose-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Comece grátis hoje mesmo!
          </h2>
          <p className="text-white/90 mb-6">
            30 dias para testar sem compromisso.<br />
            Sem cartão de crédito.
          </p>
          <a href="#form" className="inline-flex items-center gap-2 bg-white text-rose-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-rose-50 transition-colors">
            Criar conta grátis
            <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-rose-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-nude-900 text-center mb-10">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-4">
            {[
              { q: 'Preciso de cartão de crédito?', a: 'Não! Você tem 30 dias grátis para testar. Só paga se quiser continuar.' },
              { q: 'Como funciona o agendamento?', a: 'Suas clientes acessam seu link, veem horários disponíveis e agendam. Você recebe confirmação no WhatsApp.' },
              { q: 'Posso cancelar quando quiser?', a: 'Sim! Sem multa, sem burocracia. Cancele quando quiser.' },
              { q: 'Funciona no celular?', a: 'Sim! A plataforma é responsiva e funciona perfeitamente no celular, tablet e computador.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-xl">
                <h3 className="font-semibold text-nude-900 mb-2">{faq.q}</h3>
                <p className="text-nude-600 text-sm">{faq.a}</p>
              </div>
            ))}
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
          
          <div className="flex items-center justify-center gap-4 mb-4 text-xs text-white/40">
            <span>🔒 SSL Seguro</span>
            <span>🛡️ Dados Protegidos</span>
            <span>✅ Certificado</span>
          </div>
          
          <p>Feito por e para nail designers 💅</p>
          <p className="mt-2">© 2026 ClubNailsBrasil. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
