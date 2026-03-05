'use client'

import Link from 'next/link'
import PublicBackLink from '@/components/PublicBackLink'

interface Props {
  searchParams: { from?: string }
}

export default function TermsOfServicePage({ searchParams }: Props) {
  const fallbackPath = searchParams?.from || '/fundador'
  return (
    <div className="min-h-screen bg-nude-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-nude-900 mb-6">Termos de Uso</h1>
        
        <p className="text-nude-600 mb-6">
          ClubNailsBrasil
          <br />
          Última atualização: Março de 2026
        </p>

        <div className="space-y-6 text-nude-700">
          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o ClubNailsBrasil, você aceita e concorda em cumprir estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">2. Descrição do Serviço</h2>
            <p>
              O ClubNailsBrasil é uma plataforma de gestão desenvolvida especificamente para Nail Designers, oferecendo ferramentas para:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Gerenciamento de agendamentos</li>
              <li>Cadastro e gestão de clientes</li>
              <li>Criação de página pública</li>
              <li>Sistema de avaliações</li>
              <li>Controle financeiro básico</li>
              <li>Marketing via WhatsApp</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">3. Cadastro e Conta</h2>
            <p>Para usar nossos serviços, você deve:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Fornecer informações verdadeiras e completas</li>
              <li>Manter suas informações atualizadas</li>
              <li>Ser maior de 18 anos ou ter autorização legal</li>
              <li>Ser profissional da área de beleza/cuidado pessoal</li>
              <li>Responsabilizar-se pela segurança da sua conta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">4. Planos e Pagamentos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Oferecemos planos Grátis e Pro</li>
              <li>O plano Grátis tem limitações de funcionalidades</li>
              <li>Os planos pagos são cobrados mensalmente</li>
              <li>Pagamentos são processados via Stripe ou outro meio informado</li>
              <li>Você pode cancelar a qualquer momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">5. Uso Proibido</h2>
            <p>Você NÃO pode:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Usar para fins ilegais</li>
              <li>Violar direitos de terceiros</li>
              <li>Compartilhar sua conta com terceiros</li>
              <li>Tentar acessar sistemas não autorizados</li>
              <li>Publicar conteúdo ofensivo ou ilegal</li>
              <li>Usar para serviços de prostituição ou similares</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">6. Limitação de Responsabilidade</h2>
            <p>
              O ClubNailsBrasil é fornecido "como está". Não garantimos que os serviços serão sempre seguros, disponíveis ou sem erros. Não nos responsabilizamos por danos indiretos, incidentais ou consequenciais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">7. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo, design, código e materiais do ClubNailsBrasil são de nossa propriedade exclusiva. Você não pode copiar, modificar ou distribuir nossos materiais sem autorização.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">8. Encerramento</h2>
            <p>
              Podemos encerrar ou suspender seu acesso a qualquer momento, sem aviso prévio, se você violar estes termos. Após encerramento, você não terá mais acesso aos seus dados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">9. Contato</h2>
            <p>
              Para dúvidas sobre estes termos:
              <br />
              Email: clubnailsbrasil@gmail.com
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t text-center">
          <PublicBackLink path={fallbackPath} />
        </div>
      </div>
    </div>
  )
}
