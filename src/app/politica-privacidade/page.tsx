import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-nude-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-nude-900 mb-6">Política de Privacidade</h1>
        
        <p className="text-nude-600 mb-6">
          ClubNailsBrasil
          <br />
          Última atualização: Março de 2026
        </p>

        <div className="space-y-6 text-nude-700">
          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">1. Introdução</h2>
            <p>
              O ClubNailsBrasil valoriza a privacidade dos seus usuários. Esta Política de Privacidade estabelece como coletamos, usamos, protegemos e compartilhamos suas informações pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">2. Informações que Coletamos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dados de cadastro (nome, email, telefone)</li>
              <li>Informações do estabelecimento (nome do studio, endereço)</li>
              <li>Dados de clientes cadastrados pelas nails</li>
              <li>Histórico de agendamentos</li>
              <li>Avaliações e comentários</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">3. Como Usamos suas Informações</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer nossos serviços de gestão</li>
              <li>Comunicar sobre agendamentos e lembretes</li>
              <li>Processar pagamentos (quando aplicável)</li>
              <li>Melhorar nossos serviços</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">4. Proteção de Dados</h2>
            <p>
              Utilizamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Os dados são armazenados em servidores seguros com criptografia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">5. Compartilhamento de Dados</h2>
            <p>
              Não vendemos suas informações pessoais. Compartilhamos dados apenas com:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provedores de serviços (hospedagem, pagamento)</li>
              <li>Quando exigido por lei</li>
              <li>Com seu consentimento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">6. Direitos do Usuário</h2>
            <p>Você tem direito de:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incorretos</li>
              <li>Solicitar exclusão de dados</li>
              <li>Exportar seus dados</li>
              <li>Revogar consentimento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-nude-900 mb-3">7. Contato</h2>
            <p>
              Para dúvidas sobre esta política, entre em contato:
              <br />
              Email: clubnailsbrasil@gmail.com
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t text-center">
          <Link href="/" className="text-rose-600 hover:text-rose-700">← Voltar</Link>
        </div>
      </div>
    </div>
  )
}
