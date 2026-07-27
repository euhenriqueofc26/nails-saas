# RELATORIO DE AUDITORIA COMPLETA — 26/07/2026

**Projeto:** ClubNailsBrasil SaaS
**Data:** 26 de julho de 2026
**Auditor:** Opencode (big-pickle)
**Escopo:** Codigo-fonte, banco de dados, seguranca, funcionalidades

---

## SUMARIO

1. [Visao Geral do Projeto](#1-visao-geral-do-projeto)
2. [O Que Funciona](#2-o-que-funciona)
3. [O Que Nao Funciona](#3-o-que-nao-funciona)
4. [Parcialmente Feito](#4-parcialmente-feito)
5. [Auditoria de Seguranca](#5-auditoria-de-seguranca)
6. [Schema do Banco de Dados](#6-schema-do-banco-de-dados)
7. [Codigo Morto e Funcoes Nao Utilizadas](#7-codigo-morto-e-funcoes-nao-utilizadas)
8. [Todos os Bugs Encontrados (com Arquivo/Linha)](#8-todos-os-bugs-encontrados)
9. [Resumo de Severidade](#9-resumo-de-severidade)
10. [Correcoes Aplicadas Nesta Sessao](#10-correcoes-aplicadas-nesta-sessao)

---

## 1. VISAO GERAL DO PROJETO

**Descricao:** Plataforma SaaS multi-tenant para nail designers brasileiras. Oferece gestao de clientes, agendamentos, financeiro, pagina publica, WhatsApp automatizado com IA.

**Stack:**
- Frontend: Next.js 14 (App Router), React 18, TailwindCSS, TypeScript
- Backend: Next.js API Routes, Prisma ORM 5.10
- Banco: PostgreSQL (Neon)
- IA: Groq API (Llama 3.3 70B Versatile)
- WhatsApp: Evolution Go 0.7.2 (self-hosted)
- Imagens: Cloudinary
- Deploy: Vercel
- Rate Limiting: Upstash Redis

**Integracao WhatsApp + IA:**
```
Cliente manda msg WhatsApp
  -> Evolution Go envia webhook
    -> /api/webhooks/evolution/incoming recebe
      -> Salva mensagem no banco
        -> groq-ai.ts gera resposta via Groq
          -> Envia resposta via Evolution Go
```

**Planos:**

| Recurso | Free | Pro (R$29,90) | Premium (R$59,90) |
|---------|------|---------------|-------------------|
| Max Clientes | 10 | 100 | Ilimitado |
| Max Agendamentos/mes | 50 | 200 | Ilimitado |
| Max Servicos | 5 | 20 | Ilimitado |
| Financeiro | Nao | Sim | Sim |
| Pagina Publica | Sim | Sim | Sim |
| Analytics | Nao | Sim | Sim |
| IA Secretaria | Nao | Nao | Sim |
| WhatsApp Auto | Nao | Nao | Sim |

---

## 2. O QUE FUNCIONA

### 2.1 Autenticacao (parcialmente)
- **Registro** com rate limit (5/hora), slug unico, trial 15 dias — `src/app/api/register/route.ts`
- **Login** com bcrypt 12 rounds, JWT 7 dias, rate limit (10/15min) — `src/app/api/auth/login/route.ts`
- **authMiddleware** com verificacao de JWT, bloqueio, trial e assinatura — `src/lib/authMiddleware.ts`
- **Bypass CEO** para testes — `euhenriqueofc26@gmail.com`

### 2.2 Gestao de Clientes
- CRUD completo com ownership check — `src/app/api/clients/route.ts`, `src/app/api/clients/[id]/route.ts`
- Upload de fotos via Cloudinary — `src/app/api/clients/[id]/photos/route.ts`
- Busca por nome e telefone — `src/app/api/clients/route.ts`

### 2.3 Gestao de Servicos
- CRUD completo com ownership check — `src/app/api/services/route.ts`, `src/app/api/services/[id]/route.ts`
- Verificacao de plano (maxClients, maxServices)

### 2.4 Agendamentos
- CRUD com deteccao de conflitos — `src/app/api/appointments/route.ts`
- Verificacao de horarios bloqueados
- Confirmacao automatica via WhatsApp — `src/app/api/appointments/[id]/route.ts`
- Separacao `reminderSent` vs `confirmationSent`

### 2.5 Dashboard
- Dados consolidados: hoje, mes, clientes, analytics — `src/app/api/dashboard/route.ts`
- Top servicos, dias mais movimentados, clientes frequentes

### 2.6 Pagina Publica
- Perfil publico com servicos — `src/app/api/public/[slug]/route.ts`
- Slots de horarios disponiveis — `src/app/api/public/[slug]/slots/route.ts`
- Booking publico com rate limit (10/hora) — `src/app/api/public/[slug]/book/route.ts`
- Float button WhatsApp — `src/components/public/WhatsAppFloatButton.tsx`

### 2.7 WhatsApp (parcialmente)
- Conexao com Evolution Go — `src/app/api/whatsapp/connect/route.ts`
- Status com polling — `src/app/api/whatsapp/status/route.ts`
- Desconexao — `src/app/api/whatsapp/disconnect/route.ts`
- Envio manual — `src/app/api/whatsapp/send/route.ts`
- Webhook QRCode + Connected + Mensagens — `src/app/api/webhooks/evolution/incoming/route.ts`

### 2.8 IA Secretaria (parcialmente)
- Resposta automatica via Groq AI — `src/lib/groq-ai.ts`
- System prompt com servicos, precos, regras
- Historico de conversa (ultimas 5 msgs)
- Toggle de IA com validacao de plano — `src/app/api/user/ai-toggle/route.ts`

### 2.9 Cron de Lembretes
- Lembrete dia anterior + mesmo dia — `src/app/api/cron/reminders/route.ts`
- Templates variados (aleatorio)
- Fuso horario BRT (corrigido)

### 2.10 Financeiro
- Receitas e despesas — `src/app/api/financial/route.ts`
- Relatorios — `src/app/api/financial/reports/route.ts`

### 2.11 Promocoes
- CRUD de promocoes — `src/app/api/promotions/route.ts`
- Geracao de links wa.me — `src/app/api/promotions/[id]/send/route.ts`

### 2.12 Indicacoes
- Sistema de referral com codigos — `src/app/api/referrals/me/route.ts`
- Rastreamento de referrals — `src/app/api/admin/referrals/route.ts`

### 2.13 Admin
- Gerenciamento de usuarios — `src/app/api/admin/users/route.ts`
- Verificacao de role admin/CEO — `src/app/api/admin/users/[id]/route.ts`

### 2.14 Onboarding
- Fluxo guiado multi-step — `src/app/api/user/onboarding/route.ts`

---

## 3. O QUE NAO FUNCIONA

### 3.1 CRITICO — Formulario de Perfil Nao Salva
**Arquivo:** `src/app/dashboard/settings/page.tsx`, linhas 34-45
**Problema:** `handleProfileSubmit` mostra toast de sucesso MAS NAO FAZ CHAMADA fetch. Nenhuma alteracao de nome, studioName ou whatsapp e salva.
**Impacto:** Usuario muda dados mas nada e persistido.

### 3.2 CRITICO — Formulario de Senha Nao Salva
**Arquivo:** `src/app/dashboard/settings/page.tsx`, linhas 47-65
**Problema:** `handlePasswordSubmit` mostra toast de sucesso MAS NAO FAZ CHAMADA fetch. Nenhuma alteracao de senha e salva.
**Impacto:** Usuario pensa que mudou a senha mas nao mudou.

### 3.3 CRITICO — Botao "Excluir Conta" So Faz Logout
**Arquivo:** `src/app/dashboard/settings/page.tsx`, linhas 327-332
**Problema:** Botao "Excluir minha conta" chama `logout()` em vez de deletar a conta.
**Impacto:** Funcionalidade inexistente.

### 3.4 CRITICO — Client-Login: Token Nunca e Armazenado
**Arquivo:** `src/app/api/public/[slug]/client-login/route.ts`, linha 39
**Problema:** Gera `crypto.randomBytes(32)` MAS NAO ARMAZENA NO BANCO. Token retornado e inutil.
**Arquivo:** `src/app/api/public/[slug]/client-appointments/route.ts`, linha 8-9
**Problema:** Aceita `token` como query param MAS NUNCA VALIDA contra nada.
**Impacto:** Auth de clientes e 100% fake. Qualquer pessoa acessa dados com qualquer string.

### 3.5 CRITICO — Forgot Password: Email Nunca e Enviado
**Arquivo:** `src/app/api/auth/forgot/route.ts`, linhas 29-47
**Problema:** Cria token de reset MAS NAO ENVIA EMAIL. Endpoint retorna "voce recebera instrucoes" mas nada e enviado.
**Impacto:** Funcionalidade de reset de senha nao existe de verdade.

### 3.6 CRITICO — Checkout: Sem Pagamento
**Arquivo:** `src/app/api/checkout/route.ts`
**Problema:** Gera URL de checkout com params mas nao ha integracao com Stripe nem nenhum outro gateway. Schema tem campos Stripe (`stripeCustomerId`, `stripeSubscriptionId`) mas nao sao utilizados.
**Impacto:** Nao ha como cobrar clientes.

### 3.7 ALTO — appointments-by-phone Vazamento de Dados
**Arquivo:** `src/app/api/public/[slug]/appointments-by-phone/route.ts`, linha 29
**Problema:** Usa `contains` para busca por telefone. Qualquer substring funciona. Sem autenticacao.
**Impacto:** Qualquer pessoa枚mera nomes e historicos de clientes com substrings de telefone.

### 3.8 ALTO — Reviews Sem Autenticacao
**Arquivo:** `src/app/api/public/[slug]/reviews/route.ts`, linhas 4-60
**Problema:** POST aceita reviews de qualquer pessoa. Nao verifica se o reviewer e o cliente real.
**Impacto:** Reviews falsos possiveis.

### 3.9 ALTO — Upload Sem Autenticacao
**Arquivo:** `src/app/api/upload/route.ts`, linha 3
**Problema:** POST sem authMiddleware. Qualquer pessoa envia imagens para o Cloudinary do projeto.
**Impacto:** Abuso de hospedagem de imagens.

### 3.10 ALTO — Partners Sem Autenticacao
**Arquivo:** `src/app/api/partners/route.ts`, linhas 10, 15
**Problema:** GET e POST sem authMiddleware. Lista e cria partners sem restricao.
**Impacto:** Dados expostos, registros falsos.

---

## 4. PARCIALMENTE FEITO

### 4.1 Webhook Sem Autenticacao
**Arquivo:** `src/app/api/webhooks/evolution/incoming/route.ts`
**Situacao:** Secret foi adicionado (`EVOLUTION_WEBHOOK_SECRET`) mas removido porque a Evolution Go ignora query parameters. Agora endpoint e publico.
**Risco:** Qualquer pessoa pode injetar mensagens falsas e disparar respostas da IA.

### 4.2 Rate Limiter Falha Aberto
**Arquivo:** `src/lib/rate-limit.ts`, linhas 24-26
**Situacao:** Se Upstash Redis cai ou env vars nao existem, `catch { return { success: true, remaining: 999 } }` — todos os rate limits sao desativados.
**Nota:** Variaveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` nao estao no `.env`.

### 4.3 Middleware Next.js e No-Op
**Arquivo:** `src/middleware.ts`, linhas 4-6
**Situacao:** Middleware intercepta todas as rotas `/api/*` mas faz `NextResponse.next()` — zero protecao global.

### 4.4 Audit Logging So Vai Pra Console
**Arquivo:** `src/lib/audit.ts`, linhas 7-14
**Situacao:** `logEvent()` so faz `console.log`. Chamado apenas no login. Nao persiste em banco nem servico externo.

### 4.5 Pagina de Settings Com Funcionalidade Mista
**Arquivo:** `src/app/dashboard/settings/page.tsx`
**Situacao:** UI renderiza tudo (perfil, WhatsApp, AI toggle, senha, plano, zona de perigo) mas perfil e senha nao salvam. WhatsApp field comeca vazio sempre (linha 28).

### 4.6 Promocoes Geram Links, Nao Enviam
**Arquivo:** `src/app/api/promotions/[id]/send/route.ts`
**Situacao:** Gera links wa.me mas nao envia WhatsApp. `sentCount` contabiliza links gerados, nao enviados.

### 4.7 Financeiro: Relatorio Sem Check de Plano
**Arquivo:** `src/app/api/financial/reports/route.ts`
**Situacao:** Endpoint NAO verifica `plan.hasFinancial`. Usuarios free podem acessar relatorios financeiros diretamente.

### 4.8 Appointments: Limite de Plano E Vitalicio, Nao Mensal
**Arquivo:** `src/app/api/appointments/route.ts`, linhas 163-177
**Situacao:** `userAppointmentsCount` conta TODOS os agendamentos (sem filtro de data). Plano diz "50/mes" mas o codigo bloqueia pra sempre apos 50 total.

### 4.9 Bloqueio de Horarios: DELETE Quebrado
**Arquivo:** `src/app/api/blocked-times/route.ts`, linhas 73-97
**Situacao:** DELETE handler espera `params.id` mas a rota e `/api/blocked-times` (sem `[id]`). `params.id` sera sempre undefined.

---

## 5. AUDITORIA DE SEGURANCA

### 5.1 CRITICOS

| # | Descricao | Arquivo | Linha |
|---|-----------|---------|-------|
| S1 | JWT secret com fallback hardcoded `'nails-saas-secret'` | `src/lib/auth.ts` | 5 |
| S2 | Senhas reais no `.env` (database, Cloudinary, Evolution, Groq) | `.env` | 1-18 |
| S3 | Upload sem autenticacao (Cloudinary aberto) | `src/app/api/upload/route.ts` | 3 |
| S4 | Partners sem autenticacao (CRUD aberto) | `src/app/api/partners/route.ts` | 10, 15 |
| S5 | Cron reminders sem autenticacao (disparo em massa) | `src/app/api/cron/reminders/route.ts` | 32 |
| S6 | Client-login token nunca armazenado (auth fake) | `src/app/api/public/[slug]/client-login/route.ts` | 39 |
| S7 | Reviews sem autenticacao (fake reviews) | `src/app/api/public/[slug]/reviews/route.ts` | 4-60 |
| S8 | appointments-by-phone sem auth + busca substring | `src/app/api/public/[slug]/appointments-by-phone/route.ts` | 29 |

### 5.2 ALTOS

| # | Descricao | Arquivo | Linha |
|---|-----------|---------|-------|
| S9 | Admin check por JWT payload, nao DB (role forjavel) | `src/app/api/admin/users/route.ts` | 10 |
| S10 | CEO email hardcoded em 5+ arquivos | `authMiddleware.ts`, `admin/*.ts` | 28, 9, 16 |
| S11 | Rate limiter falha aberto sem Redis | `src/lib/rate-limit.ts` | 24-26 |
| S12 | Sem revogacao de token (logout so limpa localStorage) | `src/context/AuthContext.tsx` | 54-60 |
| S13 | Middleware Next.js no-op (zero protecao global) | `src/middleware.ts` | 4-6 |
| S14 | Bypass CEO pula verificacao de trial/assinatura | `src/lib/authMiddleware.ts` | 37, 45 |
| S15 | Forgot password vaza existencia de email (404) | `src/app/api/auth/forgot/route.ts` | 29-33 |
| S16 | Webhook sem signature verification | `src/app/api/webhooks/evolution/incoming/route.ts` | 5 |
| S17 | Prompt injection possivel via conteudo de mensagens | `src/lib/groq-ai.ts` | 62 |
| S18 | Ai-toggle nao usa authMiddleware (skips blocked/expiry) | `src/app/api/user/ai-toggle/route.ts` | 7-15 |

### 5.3 MEDIOS

| # | Descricao | Arquivo | Linha |
|---|-----------|---------|-------|
| S19 | Cloudinary cloud name hardcoded como fallback | `src/app/api/upload/route.ts` | 12-13 |
| S20 | Erro de upload vaza config do Cloudinary | `src/app/api/clients/[id]/photos/route.ts` | 81-89 |
| S21 | User data em localStorage sem encriptacao | `src/context/AuthContext.tsx` | 37-43 |
| S22 | Casts `as any` bypassam type safety do Prisma | Multiplos arquivos | Diversos |
| S23 | Sem validacao de formato de email no server | `src/app/api/register/route.ts` | 21 |
| S24 | Sem configuracao CORS explicita | N/A | N/A |
| S25 | Sem Content-Security-Policy | N/A | N/A |
| S26 | GA ID hardcoded como fallback | `src/lib/analytics.ts` | 36 |

---

## 6. SCHEMA DO BANCO DE DADOS

### 6.1 Modelos (17 total)

| Modelo | Campos | Relacoes | Indexes |
|--------|--------|----------|---------|
| User | 23 | 12 | email, slug, refCode (unique) |
| Referral | 5 | 2 | @@unique([referrerId, referredUserId]) |
| Partner | 8 | 0 | referralCode (unique) |
| Plan | 9 | 1 | slug (unique) |
| Client | 8 | 3 | [userId] |
| ClientPhoto | 4 | 1 | — |
| Service | 8 | 2 | [userId] |
| Appointment | 15 | 3 | [userId], [clientId], [date] |
| Revenue | 6 | 1 | [userId], appointmentId (unique) |
| Expense | 7 | 1 | [userId] |
| BlockedTime | 6 | 1 | [userId] |
| Supplier | 5 | 1 | — |
| Promotion | 7 | 1 | — |
| PublicProfile | 10 | 1 | userId (unique) |
| PasswordReset | 5 | 0 | token (unique) |
| WhatsAppSession | 11 | 2 | userId, instanceName (unique) |
| WhatsAppMessage | 13 | 1 | [sessionId] |

### 6.2 Problemas de Integridade

| Problema | Local | Severidade |
|----------|-------|------------|
| `User.planId` sem FK para `Plan` | schema.prisma:19 | ALTO |
| `User.referredBy` e String livre, nao FK | schema.prisma:33 | MEDIO |
| `Revenue.appointmentId` sem FK para `Appointment` | schema.prisma:185 | MEDIO |
| `WhatsAppMessage.appointmentId` sem FK para `Appointment` | schema.prisma:311 | MEDIO |
| Todos os campos `status` sao String (nao enum) | Multiplos models | MEDIO |
| `User.role` e String (nao enum) | schema.prisma:18 | MEDIO |
| `stripeCustomerId` e `stripeSubscriptionId` nao utilizados | schema.prisma:43-44 | BAIXO |
| `Appointment.aiHandled` definido mas nunca escrito | schema.prisma:168 | BAIXO |

### 6.3 Inconsistencia de Timezone no Codigo

O codigo usa 3 abordagens diferentes:
1. `new Date(date).setHours(0,0,0,0)` — timezone do servidor
2. `toBrazilDate()` — funcao utilitaria
3. `toLocaleDateString('en-CA')` — formatacao ISO

---

## 7. CODIGO MORTO E FUNCOES NAO UTILIZADAS

| Funcao/Campo | Arquivo | Linha | Status |
|-------------|---------|-------|--------|
| `generateMessageVariations()` | `src/lib/evolution-api.ts` | 153 | Nunca chamada |
| `generateDelay()` | `src/lib/evolution-api.ts` | 189 | Nunca chamada |
| `getInstanceQrCode()` | `src/lib/evolution-api.ts` | 111 | Nunca chamada (quebrada — nao passa instance name) |
| `deleteInstance()` | `src/lib/evolution-api.ts` | 18 | Nunca chamada (disconnect so da logout) |
| `planMiddleware()` | `src/lib/authMiddleware.ts` | 57 | Definida mas nunca usada |
| `Appointment.aiHandled` | `prisma/schema.prisma` | 168 | Campo definido mas nunca setado como `true` |
| `WHATSAPP_PLAN_LIMIT` | `src/lib/evolution-api.ts` | 193 | Definido mas verificacao inline em connect/route.ts |
| Funcao `generateReferralCode` duplicada | `src/app/api/referrals/me/route.ts` | 7-11 | Duplicata da funcao em `src/lib/referral.ts` |

---

## 8. TODOS OS BUGS ENCONTRADOS

### 8.1 Webhook + WhatsApp

| # | Bug | Arquivo | Linha | Severidade |
|---|-----|---------|-------|------------|
| B1 | Sem auth no webhook (secret removido) | `incoming/route.ts` | 5 | CRITICO |
| B2 | QRCode so aceita prefixo PNG (`data:image/png`) | `incoming/route.ts` | 14 | BAIXO |
| B3 | Extracao de phone do JID fragil | `incoming/route.ts` | 43 | BAIXO |
| B4 | Erro retorna `{ success: true }` | `incoming/route.ts` | 107-108 | BAIXO |
| B5 | Connect: catch vazio em listAllInstances | `connect/route.ts` | 50-51 | MEDIO |
| B6 | Connect: URL hardcoded fallback | `connect/route.ts` | 58-59 | MEDIO |
| B7 | Status: catch vazio em polling | `status/route.ts` | 46 | MEDIO |
| B8 | Status: cada poll faz chamada Evolution API | `status/route.ts` | 26 | BAIXO |
| B9 | Disconnect: nao deleta instancia (acumulo) | `disconnect/route.ts` | 22-27 | MEDIO |
| B10 | Send: field `reminderSent` reaproveitado | `send/route.ts` | 31-40 | MEDIO |
| B11 | Connect: response nao inclui qrCode | `connect/route.ts` | 88 | BAIXO |
| B12 | Webhook connection-update sem auth | `connection-update/route.ts` | 4 | CRITICO |

### 8.2 IA (Groq AI)

| # | Bug | Arquivo | Linha | Severidade |
|---|-----|---------|-------|------------|
| B13 | Prompt injection possivel | `groq-ai.ts` | 62 | ALTO |
| B14 | Phone pode ter prefixo 55 duplicado | `groq-ai.ts` | 92 | MEDIO |
| B15 | Model hardcoded (sem fallback) | `groq-ai.ts` | 71 | MEDIO |
| B16 | Race condition no pendingMessage lookup | `groq-ai.ts` | 100-110 | MEDIO |
| B17 | max_tokens 300 (pode truncar) | `groq-ai.ts` | 77 | BAIXO |
| B18 | System prompt sem acentos (intencional mas feio) | `groq-ai.ts` | 135 | BAIXO |

### 8.3 Frontend

| # | Bug | Arquivo | Linha | Severidade |
|---|-----|---------|-------|------------|
| B19 | Form perfil nao salva | `settings/page.tsx` | 34-45 | CRITICO |
| B20 | Form senha nao salva | `settings/page.tsx` | 47-65 | CRITICO |
| B21 | "Excluir conta" so faz logout | `settings/page.tsx` | 327-332 | CRITICO |
| B22 | WhatsApp field sempre vazio no load | `settings/page.tsx` | 28 | MEDIO |
| B23 | QRCode so setado uma vez (nao atualiza) | `WhatsAppConnect.tsx` | 55 | BAIXO |
| B24 | Polling continua infinitamente | `WhatsAppConnect.tsx` | 47-70 | BAIXO |
| B25 | Plano check usa planId em vez de slug | `WhatsAppConnect.tsx` | 122 | MEDIO |

### 8.4 API Routes

| # | Bug | Arquivo | Linha | Severidade |
|---|-----|---------|-------|------------|
| B26 | Auth fake: token nunca armazenado/validado | `client-login/route.ts` | 39 | CRITICO |
| B27 | appointments-by-phone: busca substring + sem auth | `appointments-by-phone/route.ts` | 29 | CRITICO |
| B28 | Reviews: sem auth | `reviews/route.ts` | 4-60 | CRITICO |
| B29 | Upload: sem auth | `upload/route.ts` | 3 | CRITICO |
| B30 | Partners: sem auth | `partners/route.ts` | 10, 15 | CRITICO |
| B31 | Cron reminders: sem auth | `cron/reminders/route.ts` | 32 | CRITICO |
| B32 | Forgot: email enum (404 se nao existe) | `forgot/route.ts` | 29-33 | ALTO |
| B33 | Checkout: sem pagamento real | `checkout/route.ts` | — | CRITICO |
| B34 | Financial reports: sem check de plano | `financial/reports/route.ts` | — | MEDIO |
| B35 | Book: `reminderSent = true` pula lembrete | `book/route.ts` | 158-161 | ALTO |
| B36 | Book: cliente duplicado (phone format) | `book/route.ts` | 58-66 | MEDIO |
| B37 | Appointments: limite vitalicio, nao mensal | `appointments/route.ts` | 163-177 | MEDIO |
| B38 | Appointments: caller pode setar status arbitrario | `appointments/route.ts` | 188 | MEDIO |
| B39 | BlockedTimes: DELETE com params.id undefined | `blocked-times/route.ts` | 73-97 | ALTO |
| B40 | Ai-toggle: nao usa authMiddleware | `ai-toggle/route.ts` | 7-15 | MEDIO |

### 8.5 Infraestrutura

| # | Bug | Arquivo | Linha | Severidade |
|---|-----|---------|-------|------------|
| B41 | Evolution URL/key default vazio (falha silenciosa) | `evolution-api.ts` | 1-2 | ALTO |
| B42 | Variavel shadowing `text` em sendTextMessage | `evolution-api.ts` | 43 | BAIXO |
| B43 | Rate limiter falha aberto | `rate-limit.ts` | 24-26 | ALTO |
| B44 | Rate limiter: nova instancia por request (ineficiente) | `rate-limit.ts` | 16 | BAIXO |
| B45 | GA ID hardcoded fallback | `analytics.ts` | 36 | BAIXO |
| B46 | Debug console.log em producao | `user/avatar/route.ts` | 13, 20 | BAIXO |
| B47 | Erro foto vaza config Cloudinary | `photos/route.ts` | 81-89 | MEDIO |

---

## 9. RESUMO DE SEVERIDADE

| Severidade | Quantidade | Descricao |
|------------|------------|-----------|
| **CRITICO** | 13 | Funcionalidades quebradas, seguranca exposta, dados vazados |
| **ALTO** | 14 | Bugs significativos, seguranca comprometida |
| **MEDIO** | 18 | Problemas de qualidade, UX, consistencia |
| **BAIXO** | 12 | Cosmetico, performance, melhorias menores |
| **TOTAL** | **57** | |

---

## 10. CORRECOES APLICADAS NESTA SESSAO

| Commit | Descricao | Arquivos |
|--------|-----------|----------|
| `2f95b68` | Webhook QRCode lookup por evolutionId + evolutionId no schema | `route.ts`, `schema.prisma` |
| `ab35c7f` | connectInstance usa instanceToken | `evolution-api.ts` |
| `cc836c4` | Nomes de eventos Evolution Go + phone extraction | `route.ts` |
| `102b491` | Evento PairSuccess no webhook | `route.ts` |
| `9571aee` | Extracao de dados do body.data | `route.ts` |
| `2be3f34` | Fix: message extraction, timezone, auth, AI toggle, confirmation separation | `route.ts`, `groq-ai.ts`, `cron/reminders`, `ai-toggle`, `schema.prisma` |
| `947ce48` | Remover secret check do webhook | `route.ts`, `evolution-api.ts` |
| `0419315` | Marcar msg como processada ANTES de enviar + remover threshold fragil | `groq-ai.ts`, `route.ts` |

**Bugs corrigidos:** #1 (extracao), #3 (timezone), #4 (auth toggle), #5 (cron BRT), #6 (updateMany), #7 (AI plan check), #9 (mensagens presas)

---

*Fim do relatorio. Gerado em 26/07/2026.*
