'use client'

import { useState } from 'react'
import { ArrowRight, Check, Star, Users, Calendar, DollarSign, MessageCircle, Sparkles, Clock, Shield, Heart } from 'lucide-react'
import Link from 'next/link'

export default function FundadorasPage() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    instagram: '',
    cidade: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const mensagem = `Olá! Quero entrar para a Lista VIP das 10 Nails Fundadoras da ClubNailsBrasil.\n\n*Meus dados:*\nNome: ${formData.nome}\nWhatsApp: ${formData.whatsapp}\nInstagram: ${formData.instagram}\nCidade: ${formData.cidade}`
    const url = `https://wa.me/5521981890659?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
    setFormSubmitted(true)
  }

  const vagasRestantes = 7

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-rose-500/5" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles size={16} />
            Programa de Early Access
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-nude-900 mb-6 leading-tight">
            As primeiras 10 <span className="text-rose-500">Nail Fundadoras</span> da ClubNailsBrasil
          </h1>
          
          <p className="text-xl text-nude-600 mb-8 max-w-2xl mx-auto">
            Estamos selecionando 10 profissionais de unhas para participar do lançamento da plataforma que vai transformar a forma de organizar agendamentos, clientes e finanças.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#lista-vip"
              className="inline-flex items-center justify-center gap-2 bg-rose-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-rose-600 transition-colors"
            >
              Quero ser uma Nail Fundadora
              <ArrowRight size={20} />
            </a>
            <Link
              href="/entrar"
              className="inline-flex items-center justify-center gap-2 bg-white text-nude-700 px-8 py-4 rounded-full font-semibold text-lg border-2 border-nude-200 hover:border-rose-300 transition-colors"
            >
              Já sou cliente
            </Link>
          </div>

          <p className="mt-4 text-sm text-nude-500">
            ⚠️ Apenas {vagasRestantes} vagas restantes
          </p>
        </div>
      </section>

      {/* Problema */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-nude-900 text-center mb-12">
            Se você trabalha com unhas, provavelmente já passou por isso:
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              'Muitas mensagens para agendar',
              'Confusão com horários',
              'Clientes que esquecem do horário',
              'Falta de controle financeiro',
              'Dificuldade para organizar clientes',
              'Perda de tempo com whatsapp'
            ].map((problema, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-rose-50 rounded-xl">
                <span className="text-2xl">😩</span>
                <span className="text-nude-700 font-medium">{problema}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-xl text-nude-700">Foi por isso que criamos a <span className="font-bold text-rose-500">ClubNailsBrasil</span>.</p>
          </div>
        </div>
      </section>

      {/* Solução */}
      <section className="py-16 px-4 bg-gradient-to-br from-rose-500 to-rose-600 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Uma plataforma criada para Nail Designers
          </h2>
          <p className="text-white/80 text-center mb-12">
            Com a ClubNailsBrasil você terá:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Users, text: 'Página profissional de agendamentos' },
              { icon: Calendar, text: 'Clientes agendam sozinhas' },
              { icon: MessageCircle, text: 'Confirmação automática no WhatsApp' },
              { icon: Shield, text: 'Registro completo das clientes (CRM)' },
              { icon: DollarSign, text: 'Controle financeiro simples' },
              { icon: Check, text: 'Tudo organizado em um único painel' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 p-4 rounded-xl">
                <item.icon size={24} className="text-rose-200" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-nude-900 text-center mb-12">
            Como funciona
          </h2>

          <div className="space-y-6">
            {[
              { step: '1', title: 'Você envia seu link para suas clientes', desc: 'Compartilhe sua página personalizada de agendamentos' },
              { step: '2', title: 'Elas escolhem o serviço e o horário', desc: 'Visualizam todos os serviços disponíveis' },
              { step: '3', title: 'O agendamento chega no seu WhatsApp', desc: 'Confirmação automática instantânea' },
              { step: '4', title: 'Tudo aparece no painel da plataforma', desc: 'Organizado, sem confusão' }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-nude-900">{item.title}</h3>
                  <p className="text-nude-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vídeo Demonstrativo */}
      <section className="py-16 px-4 bg-gradient-to-br from-rose-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-nude-900 mb-3">
            Veja a plataforma em ação
          </h2>
          <p className="text-lg text-nude-600 mb-8">
            Em poucos segundos você entende como funciona a ClubNailsBrasil.
          </p>
          
          <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-rose-100 inline-block max-w-full">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full max-w-2xl h-auto block"
              style={{ maxHeight: '500px' }}
            >
              <source src="/videos/demo-plataforma.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* Visão */}
      <section className="py-16 px-4 bg-rose-50">
        <div className="max-w-3xl mx-auto text-center">
          <Heart size={48} className="text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-nude-900 mb-6">
            Acreditamos que nail designers merecem ferramentas profissionais para crescer.
          </h2>
          <p className="text-xl text-nude-700">
            A ClubNailsBrasil nasce com um propósito: <span className="font-bold">transformar a forma como profissionais de unhas gerenciam seus negócios.</span>
          </p>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-nude-900 text-center mb-4">
            Benefícios das Fundadoras
          </h2>
          <p className="text-nude-600 text-center mb-12">
            Ao entrar agora, você garante:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Acesso antecipado', desc: 'Seja uma das primeiras a usar a plataforma' },
              { title: 'Participar da construção', desc: 'Sua opinião molda o futuro da plataforma' },
              { title: 'Condições especiais', desc: 'Preços exclusivos de lançamento' },
              { title: 'Reconhecimento', desc: 'Título oficial de Nail Fundadora' },
              { title: 'Prioridade em recursos', desc: 'Novas funcionalidades antes de todos' },
              { title: 'Comunidade exclusiva', desc: 'Grupo privado para fundadoras' }
            ].map((beneficio, i) => (
              <div key={i} className="flex items-start gap-4 p-6 border-2 border-rose-100 rounded-xl hover:border-rose-300 transition-colors">
                <Check size={24} className="text-rose-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-nude-900">{beneficio.title}</h3>
                  <p className="text-sm text-nude-600">{beneficio.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Escassez */}
      <section className="py-12 px-4 bg-nude-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-2xl md:text-3xl font-bold text-rose-400 mb-4">
            ⚠️ Apenas 10 vagas disponíveis
          </p>
          <p className="text-white/70">
            3 vagas já reservadas. Corra antes que acabem!
          </p>
        </div>
      </section>

      {/* Prova Social */}
      <section className="py-8 px-4 bg-rose-50">
        <div className="max-w-xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <p className="text-lg font-medium text-nude-900">
            Mais de 30 nail designers já demonstraram interesse
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section id="lista-vip" className="py-20 px-4 bg-gradient-to-br from-rose-500 to-rose-600">
        <div className="max-w-xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Quer fazer parte das 10 Nails Fundadoras?
          </h2>
          <p className="text-white/90 mb-8">
            Preencha o formulário abaixo que entraremos em contato pelo WhatsApp
          </p>

          {formSubmitted ? (
            <div className="bg-white/10 p-8 rounded-2xl">
              <Check size={48} className="mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Perfeito!</h3>
              <p className="text-white/90">
                Você será redirecionado para nosso WhatsApp. Complete o envio da mensagem para garantir sua vaga!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Seu nome</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white"
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Instagram (opcional)</label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white"
                  placeholder="@seuinstagram"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Cidade</label>
                <input
                  type="text"
                  required
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white"
                  placeholder="São Paulo, SP"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-white text-rose-500 font-bold py-4 rounded-lg hover:bg-rose-50 transition-colors"
              >
                Quero entrar para a Lista VIP
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-white/70">
            🔒 Seus dados estão seguros. Não enviamos spam.
          </p>
        </div>
      </section>

      {/* Footer Simples */}
      <footer className="py-8 px-4 bg-nude-900 text-white/60 text-center text-sm">
        <p>© 2026 ClubNailsBrasil. Todos os direitos reservados.</p>
        <div className="flex justify-center gap-4 mt-4">
          <Link href="/politica-privacidade" className="hover:text-white">Política de Privacidade</Link>
          <Link href="/termos-de-uso" className="hover:text-white">Termos de Uso</Link>
        </div>
      </footer>
    </div>
  )
}
