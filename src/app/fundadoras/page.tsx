'use client'

import { useState } from 'react'
import { ArrowRight, Check, Star, Users, Calendar, DollarSign, MessageCircle, Sparkles, Clock, Shield, Heart, Quote, User, Phone, Instagram, MapPin, Zap, TrendingUp, Wallet, Target } from 'lucide-react'
import Link from 'next/link'

export default function FundadorasPage() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    instagram: '',
    cidade: '',
    clientesSemana: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const mensagem = `Olá! Quero ser uma Nail Fundadora da ClubNailsBrasil!\n\n*Meus dados:*\nNome: ${formData.nome}\nWhatsApp: ${formData.whatsapp}\nInstagram: ${formData.instagram}\nCidade: ${formData.cidade}\nClientes por semana: ${formData.clientesSemana}`
    const url = `https://wa.me/5511948746767?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
    setFormSubmitted(true)
  }

  const vagasRestantes = 7
  const vagasTotal = 10

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-rose-500/5" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge Urgência */}
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-bold mb-6 animate-pulse">
            <Clock size={16} />
            ⚠️ Apenas {vagasRestantes} vagas restantes – CORRE!
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-nude-900 mb-4 leading-tight">
            Cansada de zap lotado, horário errado<br />
            e cliente sumindo?
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-rose-500 mb-6">
            Seja uma das {vagasRestantes} últimas Nail Fundadoras e transforme sua rotina AGORA!
          </h2>
          
          <p className="text-xl text-nude-600 mb-6 max-w-2xl mx-auto">
            Clientes agendam sozinhas 24h, agenda automática, dinheiro controlado – <span className="font-bold">e você ganha 50% OFF + 14 dias GRÁTIS!</span>
          </p>

          {/* Badge Trial + Oferta */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold mb-8 shadow-lg">
            <Sparkles size={20} />
            50% OFF + 14 DIAS GRÁTIS – Só pras {vagasRestantes} vagas finais!
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a
              href="#lista-vip"
              className="inline-flex items-center justify-center gap-2 bg-rose-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-rose-600 transition-colors shadow-lg"
            >
              Quero ser Nail Fundadora
              <ArrowRight size={20} />
            </a>
          </div>

          {/* Contador Visual */}
          <div className="max-w-xs mx-auto mb-6">
            <p className="text-sm text-nude-600 mb-2">Vagas restantes: {vagasRestantes}/{vagasTotal}</p>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-red-500 to-rose-500 h-4 rounded-full transition-all"
                style={{ width: `${(vagasRestantes / vagasTotal) * 100}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-nude-500">
            ✨ Mais de 30 nails já demonstraram interesse – não fique de fora!
          </p>
        </div>
      </section>

      {/* Seção de Dores - Mais Humana */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-nude-900 text-center mb-4">
            Me conta, mana... isso é você?
          </h2>
          <p className="text-nude-600 text-center mb-12">
            Aquele desespero de toda semana que só quem viveu sabe
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { emoji: '💬', text: 'Zap explodindo de mensagem: "tem horário?", "vai ter segunda?", "posso ir às 3?"' },
              { emoji: '😰', text: 'Cliente confirma, depois não aparece. E você perdendo renda.' },
              { emoji: '🗓️', text: 'Confusão danada: fulana marcou 2x, sicrana esqueceu o horário.' },
              { emoji: '📒', text: 'Caderninho do avô: anota tudo à mão e as clientes se perdem.' },
              { emoji: '💰', text: 'Fim do mês: "será que ganhei bem? quanto será que eu fiz?"' },
              { emoji: '😫', text: 'Perder 2h por dia só respondendo zap. Tempo que podia estar vivendo!' }
            ].map((problema, i) => (
              <div key={i} className="flex items-start gap-3 p-5 bg-rose-50 rounded-xl border-l-4 border-rose-400">
                <span className="text-3xl">{problema.emoji}</span>
                <span className="text-nude-700 font-medium text-base">{problema.text}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-2xl text-nude-800">Pois é... <span className="font-bold text-rose-500">A gente criou a solução!</span></p>
          </div>
        </div>
      </section>

      {/* Vídeo Demonstrativo */}
      <section className="py-12 px-4 bg-gradient-to-br from-rose-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-nude-900 mb-4">
            🎬 <span className="text-rose-500">Veja na prática em 4 minutos</span>
          </h2>
          <p className="text-lg text-nude-600 mb-8">
            Sem enrolação. Veja como funciona e pronto.
          </p>
          
          <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-rose-100 inline-block max-w-full mb-8">
            <iframe 
              width="800" 
              height="450"
              src="https://www.youtube.com/embed/GCxlAPjp8Hc"
              title="Demonstração ClubNailsBrasil"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
              className="w-full max-w-3xl aspect-video"
            />
          </div>

          <div>
            <a
              href="#lista-vip"
              className="inline-flex items-center justify-center gap-2 bg-rose-500 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-rose-600 transition-colors shadow-lg"
            >
              Quero ser uma Nail Fundadora
            </a>
          </div>
        </div>
      </section>

      {/* Screenshots / O que você ganha */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-nude-900 text-center mb-4">
            O que você vai ganhar
          </h2>
          <p className="text-nude-600 text-center mb-12">
            Tudo organizado num app só seu
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Calendar, title: 'Agenda Limpa', desc: 'Suas clientes veem horários disponíveis e agendam sozinhas. Sem você digitar nada.' },
              { icon: Users, title: 'Cadastro de Clientes', desc: 'Nome, WhatsApp, histórico. Tudo salvo. Nunca mais pergunta "qual é o seu nome?"' },
              { icon: Wallet, title: 'Dinheiro Controlado', desc: 'Receita, despesa, lucro. Veja quanto você ganhou no mês. Feito pra quem não manja de números.' },
              { icon: Zap, title: 'Zap Automático', desc: 'Cliente agenda, você recebe confirmação no Zap. Ela recebe lembrete. Todo mundo ganha.' }
            ].map((feature, i) => (
              <div key={i} className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-2xl border border-rose-100 shadow-md">
                <div className="w-14 h-14 bg-rose-500 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="text-white w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-nude-900 mb-2">{feature.title}</h3>
                <p className="text-nude-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solução */}
      <section className="py-16 px-4 bg-gradient-to-br from-rose-500 to-rose-600 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Com a ClubNailsBrasil você tem:
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Calendar, text: 'Página profissional de agendamentos' },
              { icon: Users, text: 'Clientes agendam sozinhas 24h' },
              { icon: Zap, text: 'Confirmação automática no WhatsApp' },
              { icon: Shield, text: 'CRM completo das clientes' },
              { icon: TrendingUp, text: 'Controle financeiro simples' },
              { icon: Check, text: 'Tudo em um único painel' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 p-4 rounded-xl">
                <item.icon size={24} className="text-rose-200" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O que dizem as Nail Designers */}
      <section className="py-20 px-4 bg-gradient-to-br from-rose-50 via-white to-rose-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-nude-900 text-center mb-12">
            O que nail designers dizem
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Finalmente minhas clientes agendam sozinhas! Economizo 2 horas por dia.",
                author: "Camila Silva",
                city: "São Paulo, SP",
                avatar: "/imgnails/nail1.jpg"
              },
              {
                quote: "Perdi a conta de quantas vezes eu esquecia de responder. Agora nunca mais.",
                author: "Juliana Santos",
                city: "Rio de Janeiro, RJ",
                avatar: "/imgnails/nail2.jpg"
              },
              {
                quote: "Minhas finanças agora são claras. Sei exatamente quanto faturo por mês.",
                author: "Patrícia Oliveira",
                city: "Belo Horizonte, MG",
                avatar: "/imgnails/nail3.jpg"
              }
            ].map((depo, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-lg border border-rose-100 text-center">
                <img 
                  src={depo.avatar} 
                  alt={depo.author}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-rose-100"
                />
                <Quote size={32} className="text-rose-300 mb-4" />
                <p className="text-nude-700 italic mb-6">"{depo.quote}"</p>
                <div className="border-t border-rose-100 pt-4">
                  <p className="font-bold text-nude-900">{depo.author}</p>
                  <p className="text-sm text-nude-500">{depo.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Urgência - Oferta Especial */}
      <section className="py-12 px-4 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <Clock size={32} className="mx-auto mb-4 text-rose-200" />
          <h3 className="text-2xl font-bold mb-2">
            Oferta de Lançamento: 50% OFF no primeiro ano
          </h3>
          <p className="text-white/90 mb-4">
            Teste GRÁTIS 14 dias sem cartão – pague só se amar!<br />
            <span className="font-bold text-2xl">R$ 24,90/mês</span> em vez de R$ 49,90
          </p>
          <p className="text-rose-200 text-sm">
            ✨ Promoção válida apenas para as {vagasRestantes} Nail Fundadoras restantes
          </p>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-nude-900 text-center mb-4">
            Benefícios Exclusivos das Fundadoras
          </h2>
          <p className="text-nude-600 text-center mb-12">
            Ao entrar agora, você garante:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: '14 dias GRÁTIS', desc: 'Teste sem compromisso. Sem cartão.' },
              { title: '50% OFF permanente', desc: 'R$ 24,90/mês pelo primeiro ano' },
              { title: 'Acesso antecipado', desc: 'Seja uma das primeiras a usar' },
              { title: 'Moldar a plataforma', desc: 'Sua opinião define o futuro' },
              { title: 'Título oficial', desc: 'Nail Fundadora reconhecida' },
              { title: 'Prioridade total', desc: 'Novas funcionalidades primeiro' }
            ].map((beneficio, i) => (
              <div key={i} className="flex items-start gap-4 p-6 border-2 border-rose-100 rounded-xl hover:border-rose-300 transition-colors bg-rose-50/50">
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
            ⚠️ Apenas {vagasRestantes} vagas restantes
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
      <section id="lista-vip" className="py-20 px-4 bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-rose-500 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Garantir Minha Vaga Agora
              </h2>
              <p className="text-gray-500 text-sm">
                Preencha e garanta seus benefícios de fundadora
              </p>
            </div>

            {formSubmitted ? (
              <div className="bg-green-50 border border-green-200 p-8 rounded-2xl text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="text-green-500 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Você está quase lá!</h3>
                <p className="text-green-700">
                  Complete o envio da mensagem no WhatsApp para garantir sua vaga.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
                    placeholder="WhatsApp (11) 99999-9999"
                  />
                </div>
                <div className="relative">
                  <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
                    placeholder="@seuinstagram"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
                    placeholder="Cidade, Estado"
                  />
                </div>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    required
                    value={formData.clientesSemana}
                    onChange={(e) => setFormData({ ...formData, clientesSemana: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-100 text-gray-800 focus:outline-none focus:border-rose-400 focus:bg-white transition-all appearance-none"
                  >
                    <option value="">Quantas clientes atende por semana?</option>
                    <option value="1-10">1 a 10 clientes</option>
                    <option value="11-20">11 a 20 clientes</option>
                    <option value="21+">Mais de 20 clientes</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold py-4 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Quero ser Nail Fundadora – Garantir Vaga Agora!
                </button>
                <p className="text-center text-gray-400 text-xs">
                  🔒 Seus dados estão seguros. Não enviamos spam.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-nude-900 text-white/60 text-center text-sm">
        <div className="flex flex-col items-center gap-4 mb-4">
          <a 
            href="https://instagram.com/clubnailsbrasilofc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-rose-400 transition-colors flex items-center gap-2"
          >
            <Instagram className="w-5 h-5" />
            @clubnailsbrasilofc
          </a>
          <a 
            href="https://wa.me/5511948746767" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-rose-400 transition-colors flex items-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Suporte via WhatsApp
          </a>
        </div>
        <p className="mb-2">Feito por e para nail designers 💅</p>
        <p className="mb-4">© 2026 ClubNailsBrasil. Todos os direitos reservados.</p>
        <div className="flex justify-center gap-4">
          <Link href="/politica-privacidade?from=%2Ffundadoras" className="hover:text-white">Política de Privacidade</Link>
          <Link href="/termos-de-uso?from=%2Ffundadoras" className="hover:text-white">Termos de Uso</Link>
        </div>
      </footer>
    </div>
  )
}
