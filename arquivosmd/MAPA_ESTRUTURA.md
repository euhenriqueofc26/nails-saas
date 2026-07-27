# MAPA COMPLETO DA ESTRUTURA — ClubNailsBrasil

## 🟦 NÚCLEO (Funciona Hoje)

### Autenticação
- `src/lib/auth.ts` → JWT, bcrypt, generateToken, verifyToken, generateSlug
- `src/lib/authMiddleware.ts` → authMiddleware (verifica token, trial, subscription, bloqueio)
- `src/app/api/auth/login/route.ts` → POST login
- `src/app/api/auth/forgot/route.ts` → POST (gera token), PUT (reseta senha)
- `src/app/api/register/route.ts` → POST (cria conta), GET (busca usuário)
- `src/context/AuthContext.tsx` → Provider de autenticação no frontend
- `src/components/Providers.tsx` → Envolve Auth + Onboarding

### Dashboard
- `src/app/dashboard/page.tsx` → Página principal (stats, agendamentos do dia, analytics)
- `src/app/api/dashboard/route.ts` → GET (busca todos os dados)

### Clientes
- `src/app/dashboard/clients/page.tsx` → CRUD de clientes
- `src/app/api/clients/route.ts` → GET, POST
- `src/app/api/clients/[id]/route.ts` → GET, PUT, DELETE
- `src/app/api/clients/[id]/appointments/route.ts` → GET (histórico)
- `src/app/api/clients/[id]/photos/route.ts` → GET, POST, DELETE (Cloudinary)
- `src/components/ClientProfileModal.tsx` → Modal com abas (histórico + fotos)

### Agendamentos
- `src/app/dashboard/appointments/page.tsx` → Calendário + CRUD
- `src/app/api/appointments/route.ts` → GET, POST (com verificação de conflito e blocked-time)
- `src/app/api/appointments/[id]/route.ts` → GET, PUT (confirmação auto WhatsApp), DELETE (soft-cancel)

### Serviços
- `src/app/dashboard/services/page.tsx` → CRUD de serviços
- `src/app/api/services/route.ts` → GET, POST
- `src/app/api/services/[id]/route.ts` → GET, PUT, DELETE

### Financeiro
- `src/app/dashboard/financial/page.tsx` → Receitas, despesas, relatórios
- `src/app/api/financial/route.ts` → GET (com filtros), POST (cria receita/despesa)
- `src/app/api/financial/reports/route.ts` → GET (relatório mensal/anual)

### Perfil Público
- `src/app/dashboard/public/page.tsx` → Configuração da página pública
- `src/app/api/profile/route.ts` → GET, PUT (upsert do PublicProfile)
- `src/app/dashboard/settings/page.tsx` → Configurações da conta

### Página Pública (Client-facing)
- `src/app/[slug]/page.tsx` → Página do studio
- `src/components/public/ServicesSection.tsx` → Lista de serviços
- `src/components/public/BookingModal.tsx` → Modal de agendamento
- `src/components/public/GallerySection.tsx` → Galeria (hardcoded)
- `src/components/public/ReviewsSection.tsx` → Avaliações + carrossel
- `src/components/public/Footer.tsx` → Rodapé
- `src/components/public/WhatsAppFloatButton.tsx` → Botão flutuante
- `src/components/PublicBackLink.tsx` → Link "voltar"
- `src/components/SaveSlugToLocalStorage.tsx` → Salva slug no localStorage
- `src/app/api/public/[slug]/route.ts` → GET (perfil do studio)
- `src/app/api/public/[slug]/slots/route.ts` → GET (horários disponíveis)
- `src/app/api/public/[slug]/book/route.ts` → POST (cria agendamento público)
- `src/app/api/public/[slug]/reviews/route.ts` → GET, POST (avaliações)
- `src/app/api/public/[slug]/appointments-by-phone/route.ts` → GET (busca por telefone)
- `src/app/api/public/[slug]/client-login/route.ts` → POST (login do cliente)
- `src/app/api/public/[slug]/client-appointments/route.ts` → GET (agendamentos do cliente)

### Admin
- `src/app/dashboard/admin/page.tsx` → Gerenciamento de usuários
- `src/app/api/admin/users/route.ts` → GET (lista todos)
- `src/app/api/admin/users/[id]/route.ts` → GET, PUT (mudar plano, bloquear)
- `src/app/api/admin/referrals/route.ts` → GET (lista referrals)

### Outros Core
- `src/app/dashboard/blocked-times/page.tsx` → Bloquear horários (via appointments page)
- `src/app/api/blocked-times/route.ts` → GET, POST, DELETE
- `src/app/dashboard/suppliers/page.tsx` → Fornecedores
- `src/app/api/suppliers/route.ts` → GET, POST
- `src/app/api/suppliers/[id]/route.ts` → DELETE
- `src/app/dashboard/plans/page.tsx` → Planos (atualmente redireciona pra WhatsApp)
- `src/app/api/checkout/route.ts` → POST (gera URL de checkout simulado)
- `src/app/checkout/page.tsx` → Checkout simulado
- `src/app/dashboard/settings/termos/page.tsx` → Termos de uso
- `src/app/dashboard/settings/politicas/page.tsx` → Política de privacidade
- `src/app/dashboard/indicacoes/page.tsx` → Indique e ganhe
- `src/app/api/referrals/me/route.ts` → GET (stats de indicação)
- `src/components/ImageUpload.tsx` → Upload de imagem
- `src/components/OnboardingOverlay.tsx` → Onboarding em 3 passos
- `src/hooks/useOnboarding.tsx` → Hook de onboarding
- `src/app/api/user/onboarding/route.ts` → GET, PUT
- `src/app/api/user/onboarding-complete/route.ts` → POST
- `src/app/api/user/avatar/route.ts` → PUT
- `src/app/api/user/ai-toggle/route.ts` → POST
- `src/app/api/reminders/route.ts` → GET (lembretes)
- `src/lib/utils.ts` → formatCurrency, formatDate, calculateEndTime, toBrazilDate, formatTime, extractHoursForDay
- `src/lib/prisma.ts` → Singleton do Prisma
- `src/lib/cloudinary.ts` → Config do Cloudinary
- `src/lib/audit.ts` → logEvent (só console.log)
- `src/lib/rate-limit.ts` → checkRateLimit (Upstash, mas env vars ausentes)
- `src/lib/referral.ts` → generateReferralCode
- `src/app/page.tsx` → Landing page
- `src/app/layout.tsx` → Layout com metadata SEO
- `src/app/fundadoras/page.tsx` → Página das fundadoras
- `src/app/entrar/page.tsx` → Página de login separada
- `src/app/api/partners/route.ts` → GET, POST (sem auth)
- `src/components/GoogleAnalytics.tsx` → GA4
- `src/app/api/upload/route.ts` → POST (Cloudinary, sem auth)

---

## 🟩 WHATSAPP (Evolution API)

### Integração
- `src/lib/evolution-api.ts` → createInstance, sendTextMessage, listAllInstances, logoutInstance, connectInstance, getInstanceQrCode, getConnectionState, formatPhoneForEvolution, WHATSAPP_PLAN_LIMIT
- `src/app/api/whatsapp/connect/route.ts` → POST (cria instância, conecta, busca QR)
- `src/app/api/whatsapp/disconnect/route.ts` → POST (logout)
- `src/app/api/whatsapp/status/route.ts` → GET (status + live check)
- `src/app/api/whatsapp/send/route.ts` → POST (envia mensagem)
- `src/components/WhatsAppConnect.tsx` → Modal QR Code + polling

### Webhooks
- `src/app/api/webhooks/evolution/incoming/route.ts` → POST (mensagens recebidas)
- `src/app/api/webhooks/evolution/connection-update/route.ts` → POST (mudança de status)

### Lembretes (via WhatsApp)
- `src/app/api/cron/reminders/route.ts` → GET (envia lembretes automáticos)

---

## 🟨 IA (Groq AI)

- `src/lib/groq-ai.ts` → processIncomingMessage (usa Llama 3.3 70B via Groq)
- `src/app/api/user/ai-toggle/route.ts` → POST (ativa/desativa IA)
- `src/app/dashboard/settings/page.tsx` → Toggle de IA (só Premium)
- `src/app/api/webhooks/evolution/incoming/route.ts` → Chama processIncomingMessage

---

## 🟧 FUTURO (Planejado/Incompleto)

### Pagamento (Stripe)
- Schema: `User.stripeCustomerId`, `User.stripeSubscriptionId`, `User.subscriptionEndsAt`
- `src/app/checkout/page.tsx` → Checkout simulado (setTimeout fake)
- `src/app/api/checkout/route.ts` → Gera URL com query params
- `src/app/dashboard/plans/page.tsx` → "Assinar" abre WhatsApp
- `src/lib/authMiddleware.ts` → Verifica `subscriptionEndsAt`
- `src/lib/auth.ts` → Campo `planId` no JWT
- **Status**: UI pronta, backend zero. Nenhum SDK Stripe instalado.

### Sistema de Parceiros
- Schema: `Partner` model (name, email, referralCode, commissionRate, totalEarned)
- `src/app/api/partners/route.ts` → GET, POST (sem auth, sem lógica de comissão)
- **Status**: Scaffold básico. Sem UI, sem lógica de referral→partner.

### Sistema de Indicação Completo
- Schema: `User.referredBy`, `Referral` model
- `src/app/api/register/route.ts` → Salva `referredBy` do cookie
- `src/app/api/referrals/me/route.ts` → Mostra código e contagem
- **Status**: Escrita funciona, leitura/recompensa não implementada.

### Analytics Events
- `src/lib/analytics.ts` → trackEvent, trackPageView (nunca importados)
- `src/components/GoogleAnalytics.tsx` → GA4 carrega mas eventos nunca disparam
- **Status**: Componente GA4 vivo, tracking morto.

### Audit Persistence
- `src/lib/audit.ts` → TODO: "persist to database in future"
- **Status**: Só console.log.

### Rate Limiting Real
- `src/lib/rate-limit.ts` → Usa Upstash Redis, mas env vars ausentes
- **Status**: Código existe, nunca funciona (catch retorna success: true).

### Form Validation
- `package.json`: `zod`, `react-hook-form`, `@hookform/resolvers` instalados
- **Status**: Nenhum importado no código.

### Calendar Component
- `package.json`: `react-calendar` instalado
- **Status**: Nenhum importado. UI usa inputs de data nativos.

### Relatórios Anuais
- `src/app/api/financial/reports/route.ts` → Suporta `reportType=yearly`
- `src/app/dashboard/financial/page.tsx` → Só pede dados mensais
- **Status**: Backend pronto, frontend não mostra.

### Link "Ver Planos"
- `src/app/dashboard/settings/page.tsx` → `href="#"` em vez de `/dashboard/plans`
- **Status**: Link quebrado.

---

## ⬜ CÓDIGO MORTO (Pode Remover)

### Arquivo inteiro
- `src/lib/analytics.ts` → Nunca importado

### Funções em auth.ts
- `authenticateUser()` → Nunca importada (login faz inline)

### Funções em authMiddleware.ts
- `planMiddleware()` → Nunca importada

### Funções em evolution-api.ts
- `deleteInstance()` → Nunca importada
- `getInstanceInfo()` → Nunca importada (redundante com getConnectionState)
- `generateMessageVariations()` → Nunca importada
- `shuffleArray()` → Só usa generateMessageVariations
- `generateDelay()` → Nunca importada

### Funções em utils.ts
- `formatDateTime()` → Nunca importada
- `generateTimeSlots()` → Nunca importada (duplicada em slots/route.ts)
- `validateWhatsapp()` → Nunca importada
- `formatWhatsapp()` → Nunca importada (duplicada inline em componentes)
- `getMonthName()` → Nunca importada
- `getDayOfWeek()` → Nunca importada

### Imports não utilizados
- `ImageUpload.tsx`: `Image as ImageIcon` (lucide)
- `ClientProfileModal.tsx`: `DollarSign` (lucide)
- `appointments/page.tsx`: `AlertCircle` (lucide), `user` destructured
- `admin/page.tsx`: `Filter` (lucide)
- `indicacoes/page.tsx`: `DollarSign` (lucide)
- `services/page.tsx`: `user` destructured
- `financial/page.tsx`: `user` destructured

### Console.log de debug
- `dashboard/page.tsx:111` → `console.log('Saving avatar:', avatarUrl)`
- `dashboard/page.tsx:122` → `console.log('Response:', res.status, data)`
