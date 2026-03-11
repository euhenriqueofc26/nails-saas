'use client'

import { useState } from 'react'
import { ArrowRight, Check, Star, Users, Calendar, DollarSign, MessageCircle, Sparkles, Clock, Shield, Heart, Quote, User, Phone, Instagram, MapPin } from 'lucide-react'
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
    const url = `https://wa.me/5511948746767?text=${encodeURIComponent(mensagem)}`
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

      {/* Vídeo Demonstrativo */}
      <section className="py-16 px-4 bg-gradient-to-br from-rose-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-nude-900 mb-3">
            Pare de perder tempo agendando pelo WhatsApp.<br />
            <span className="text-rose-500">Veja em menos de 4 minutos como organizar seus agendamentos automaticamente.</span>
          </h2>
          <p className="text-lg text-nude-600 mb-4">
            Veja como a ClubNailsBrasil organiza seus agendamentos automaticamente e reduz o tempo gasto no WhatsApp.
          </p>
          <p className="text-rose-600 font-medium mb-8">
            ✨ Mais de 30 nail designers já demonstraram interesse na plataforma.
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

      {/* Urgência - Oferta Especial */}
      <section className="py-12 px-4 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <Clock size={32} className="mx-auto mb-4 text-rose-200" />
          <h3 className="text-2xl font-bold mb-2">
            Oferta de Lançamento: 50% OFF no primeiro ano
          </h3>
          <p className="text-white/90 mb-4">
            Garanta agora e paying apenas <span className="font-bold text-2xl">R$ 24,90/mês</span> em vez de R$ 49,90
          </p>
          <p className="text-rose-200 text-sm">
            ✨ Promoção válida apenas para as 10 Nail Fundadoras
          </p>
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
      <section id="lista-vip" className="py-20 px-4 bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-rose-500 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Garantir Minha Vaga
              </h2>
              <p className="text-gray-500 text-sm">
                Preencha abaixo e venha construir a história da ClubNailsBrasil conosco
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
              <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="(11) 99999-9999"
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
                    placeholder="São Paulo, SP"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold py-4 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Quero ser uma Nail Fundadora
                </button>
                <p className="text-center text-gray-400 text-xs">
                  🔒 Seus dados estão seguros. Não enviamos spam.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer Simples */}
      <footer className="py-8 px-4 bg-nude-900 text-white/60 text-center text-sm">
        <div className="flex justify-center gap-6 mb-4">
          <a 
            href="https://instagram.com/clubnailsbrasilofc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-rose-400 transition-colors flex items-center gap-2"
          >
            <Instagram className="w-5 h-5" />
            @clubnailsbrasilofc
          </a>
        </div>
        <p className="mb-4">© 2026 ClubNailsBrasil. Todos os direitos reservados.</p>
        <div className="flex justify-center gap-4">
          <Link href="/politica-privacidade" className="hover:text-white">Política de Privacidade</Link>
          <Link href="/termos-de-uso" className="hover:text-white">Termos de Uso</Link>
        </div>
      </footer>
    </div>
  )
}
