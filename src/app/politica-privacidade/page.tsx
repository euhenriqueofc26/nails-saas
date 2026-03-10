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

export default function PoliticaPrivacidadePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-nude-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    }>
      <div className="min-h-screen bg-nude-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <BackButton />

          <h1 className="text-2xl font-bold text-nude-900 mb-6">Política de Privacidade</h1>
          
          <div className="prose prose-nude max-w-none bg-white rounded-xl p-6 shadow-sm">
            <p className="text-nude-600 mb-4">
              ClubNailsBrasil
              <br />
              Última atualização: Março de 2026
            </p>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">1. Introdução</h2>
              <p className="text-nude-700">
                O ClubNailsBrasil valoriza a privacidade dos seus usuários. Esta Política de Privacidade estabelece como coletamos, usamos, protegemos e compartilhamos suas informações pessoais.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">2. Informações que Coletamos</h2>
              <ul className="list-disc pl-6 space-y-2 text-nude-700">
                <li>Dados de cadastro (nome, email, telefone)</li>
                <li>Informações do estabelecimento (nome do studio, endereço)</li>
                <li>Dados de clientes cadastrados pelas nails</li>
                <li>Histórico de agendamentos</li>
                <li>Avaliações e comentários</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">3. Como Usamos suas Informações</h2>
              <ul className="list-disc pl-6 space-y-2 text-nude-700">
                <li>Fornecer nossos serviços de gestão</li>
                <li>Comunicar sobre agendamentos e lembretes</li>
                <li>Processar pagamentos (quando aplicável)</li>
                <li>Melhorar nossos serviços</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">4. Proteção de Dados</h2>
              <p className="text-nude-700">
                Utilizamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Os dados são armazenados em servidores seguros com criptografia.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">5. Compartilhamento de Dados</h2>
              <p className="text-nude-700 mb-2">
                Não vendemos suas informações pessoais. Compartilhamos dados apenas com:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-nude-700">
                <li>Provedores de serviços (hospedagem, pagamento)</li>
                <li>Quando exigido por lei</li>
                <li>Com seu consentimento</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">6. Direitos do Usuário</h2>
              <p className="text-nude-700 mb-2">Você tem direito de:</p>
              <ul className="list-disc pl-6 space-y-2 text-nude-700">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incorretos</li>
                <li>Solicitar exclusão de dados</li>
                <li>Exportar seus dados</li>
                <li>Revogar consentimento</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-nude-900 mb-3">7. Contato</h2>
              <p className="text-nude-700">
                Para dúvidas sobre esta política, entre em contato:
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
