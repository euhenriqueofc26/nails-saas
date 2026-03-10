'use client'

import { ArrowLeft } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

function BackButton() {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [href, setHref] = useState('/')
  
  useEffect(() => {
    setMounted(true)
    const from = searchParams.get('from')
    if (from && !from.startsWith('/dashboard') && !from.startsWith('/api')) {
      setHref(from)
    }
  }, [searchParams])
  
  if (!mounted) {
    return (
      <span className="inline-flex items-center gap-2 text-rose-300 mb-6">
        <ArrowLeft size={20} />
        Voltar
      </span>
    )
  }
  
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 text-rose-500 hover:text-rose-600 mb-6"
    >
      <ArrowLeft size={20} />
      Voltar
    </a>
  )
}

export default function TermosDeUsoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-nude-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    }>
      <div className="min-h-screen bg-nude-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <BackButton />

          <h1 className="text-2xl font-bold text-nude-900 mb-6">Termos de Uso</h1>
          
          <div className="prose prose-nude max-w-none bg-white rounded-xl p-6 shadow-sm">
            <p className="text-nude-600 mb-4">
              ClubNailsBrasil
              <br />
              Última atualização: Março de 2026
            </p>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">1. Aceitação dos Termos</h2>
              <p className="text-nude-700">
                Ao acessar e utilizar o ClubNailsBrasil, você concorda em cumprir estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossa plataforma.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">2. Descrição do Serviço</h2>
              <p className="text-nude-700">
                O ClubNailsBrasil é uma plataforma de gestão para profissionais de unhas, oferecendo ferramentas para gerenciamento de clientes, agendamentos, portfólio online e muito mais.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">3. Cadastro e Conta</h2>
              <ul className="list-disc pl-6 space-y-2 text-nude-700">
                <li>Você deve fornecer informações verdadeiras e atualizadas</li>
                <li>É responsável por manter a confidencialidade da sua conta</li>
                <li>Você deve ter pelo menos 18 anos para utilizar o serviço</li>
                <li>Uma pessoa física ou jurídica pode ter apenas uma conta</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">4. Responsabilidades do Usuário</h2>
              <p className="text-nude-700 mb-2">Você concorda em:</p>
              <ul className="list-disc pl-6 space-y-2 text-nude-700">
                <li>Utilizar a plataforma apenas para fins legais</li>
                <li>Não violar direitos de terceiros</li>
                <li>Não intentar ataques ou uso indevido da plataforma</li>
                <li>Manter seus dados de acesso em segurança</li>
                <li>Cumprir todas as leis aplicáveis</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">5. Propriedade Intelectual</h2>
              <p className="text-nude-700">
                Todo o conteúdo da plataforma, incluindo textos, gráficos, logos, imagens e software, é propriedade do ClubNailsBrasil ou de seus licenciadores e está protegido por leis de propriedade intelectual.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">6. Limitação de Responsabilidade</h2>
              <p className="text-nude-700">
                O ClubNailsBrasil não será responsável por quaisquer danos indiretos, incidentais, especiais ou consequenciais resultantes do uso ou incapacidade de usar a plataforma.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">7. Modificações do Serviço</h2>
              <p className="text-nude-700">
                Reservamo-nos o direito de modificar ou descontinuar qualquer aspecto da plataforma a qualquer momento. Notificaremos sobre mudanças significativas quando possível.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">8. Rescisão</h2>
              <p className="text-nude-700">
                Podemos rescindir ou suspender seu acesso à plataforma a qualquer tempo, sem aviso prévio, caso você viole estes Termos de Uso.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">9. Contato</h2>
              <p className="text-nude-700">
                Para dúvidas sobre estes termos, entre em contato:
                <br />
                Email: clubnailsbrasil@gmail.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
