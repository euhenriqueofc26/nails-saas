# ARQUITETURA REAL — ClubNailsBrasil

> Documento factual. Sem opiniões. Apenas fatos.

---

## 1. MÓDULOS DA PLATAFORMA

| Módulo | Arquivo(s) | Status | Depende de | Salva | Chamado por | Chama |
|--------|-----------|--------|------------|-------|-------------|-------|
| Auth (Login/Register) | `src/app/api/auth/*`, `src/lib/auth.ts` | ✅ Funcional | Neon DB, JWT | User session | Login/Register pages | Prisma |
| Dashboard | `src/app/dashboard/page.tsx` | ✅ Funcional | Auth | — | Navigation | API routes |
| Clients | `src/app/api/clients/*` | ✅ Funcional | Auth, Prisma | Client | Dashboard UI | Prisma |
| Services | `src/app/api/services/*` | ✅ Funcional | Auth, Prisma | Service | Dashboard UI | Prisma |
| Appointments | `src/app/api/appointments/*` | ⚠️ Parcial | Auth, Prisma, WhatsApp | Appointment | Dashboard UI | Prisma, WhatsApp Send |
| Financial | `src/app/api/financial/*` | ✅ Funcional | Auth, Prisma | Transaction | Dashboard UI | Prisma |
| Public Page /[slug] | `src/app/api/public/[slug]/*` | ✅ Funcional | Prisma | Booking | External visitors | Prisma, WhatsApp Send |
| Plans | `src/app/api/plans/*` | ✅ Funcional | Auth, Prisma | Plan | Admin UI | Prisma |
| Profile | `src/app/api/user/profile/*` | ✅ Funcional | Auth, Prisma | User | Dashboard UI | Prisma |

---

## 2. MÓDULOS WHATSAPP

| Módulo | Arquivo | Status | Depende de | Salva | Chamado por | Chama |
|--------|---------|--------|------------|-------|-------------|-------|
| WhatsApp Connect | `src/app/api/whatsapp/connect/route.ts` | ⚠️ Corrigido | Evolution Go API | WhatsAppSession | WhatsAppConnect.tsx | `evolution-api.ts` |
| WhatsApp Disconnect | `src/app/api/whatsapp/disconnect/route.ts` | ❓ Não testado | Evolution Go API | Deleta WhatsAppSession | WhatsAppConnect.tsx | `evolution-api.ts` |
| WhatsApp Status | `src/app/api/whatsapp/status/route.ts` | ❓ Não testado | Evolution Go API | — | WhatsAppConnect.tsx (polling) | `evolution-api.ts` |
| WhatsApp Send | `src/app/api/whatsapp/send/route.ts` | ❌ Não funciona | WhatsAppSession | — | Appointment confirm, Book, Manual | `evolution-api.ts` |
| Webhook Incoming | `src/app/api/webhooks/evolution/incoming/route.ts` | ⚠️ Corrigido | Evolution Go POST | WhatsAppMessage, WhatsAppSession | Evolution Go webhook | `groq-ai.ts` |
| Webhook Connection-Update | `src/app/api/webhooks/evolution/incoming/route.ts` | ⚠️ Unificado no incoming | Evolution Go POST | Atualiza WhatsAppSession | Evolution Go webhook | — |
| AI Toggle | `src/app/api/user/ai-toggle/route.ts` | ⚠️ Sem validação de plano | Auth, Prisma | User.aiEnabled | WhatsAppConnect.tsx | Prisma |
| Groq AI | `src/lib/groq-ai.ts` | ✅ Funcional (chave válida) | Groq API | WhatsAppMessage | Webhook Incoming | Groq API, `evolution-api.ts` |
| Evolution API Client | `src/lib/evolution-api.ts` | ✅ Chave corrigida | Evolution Go API | — | Todas as rotas WhatsApp | HTTP direto |

---

## 3. MÓDULOS AUTOMATIZADOS

| Módulo | Arquivo | Status | Depende de | Salva | Chamado por | Chama |
|--------|---------|--------|------------|-------|-------------|-------|
| Cron Reminders | `src/app/api/cron/reminders/route.ts` | ⚠️ Bug timezone | Prisma, WhatsAppSession | Atualiza Appointment | Vercel Cron (9h UTC) | `evolution-api.ts` |

---

## 4. DATABASE

| Tabela | Arquivo | Status | Relação |
|--------|---------|--------|---------|
| User | `prisma/schema.prisma:22` | ✅ | 1:N WhatsAppSession, 1:N Client, 1:N Service |
| WhatsAppSession | `prisma/schema.prisma:282` | ✅ schema | N:1 User |
| WhatsAppMessage | `prisma/schema.prisma:298` | ✅ schema | N:1 User |
| Client | `prisma/schema.prisma` | ✅ | N:1 User |
| Service | `prisma/schema.prisma` | ✅ | N:1 User |
| Appointment | `prisma/schema.prisma` | ✅ | N:1 User |

---

## 5. FLUXOS CRÍTICOS

### FLUXO 1: Conectar WhatsApp

```
User → WhatsAppConnect.tsx → POST /api/whatsapp/connect
  → evolution-api.ts createInstance(instanceName=user.slug)
  → Evolution Go POST /instance/create
  → Salva WhatsAppSession(instanceToken)
  → Evolution Go POST /instance/connect/{instanceToken}
  → Retorna status INITIALIZING (sem QR code)

Evolution Go → POST /api/webhooks/evolution/incoming (evento QRCode)
  → Busca WhatsAppSession(instanceId)
  → Salva WhatsAppSession(qrCode)

User → WhatsAppConnect.tsx (polling a cada 3s)
  → GET /api/whatsapp/status
  → Retorna session.qrCode do banco
  → Frontend renderiza QR Code

User → Escaneia QR Code no WhatsApp
  → Evolution Go webhook POST /api/webhooks/evolution/incoming (evento CONNECTION)
  → Atualiza WhatsAppSession(status=CONNECTED)
```

### FLUXO 2: Confirmar agendamento

```
POST /api/appointments/{id} (status=CONFIRMED)
  → Busca Appointment + Client + User
  → Busca WhatsAppSession(userId=user.id)
  → evolution-api.ts sendTextMessage(session.instanceToken, phone, msg)
  → Evolution Go POST /message/sendText/{instanceToken}
```

### FLUXO 3: Agendamento público

```
POST /api/public/[slug]/book
  → Busca User(slug) + Service
  → Cria Appointment
  → Busca WhatsAppSession(userId=user.id)
  → evolution-api.ts sendTextMessage → notification ao nail
```

### FLUXO 4: Receber mensagem + IA

```
Evolution Go → POST /api/webhooks/evolution/incoming
  → Busca WhatsAppSession(instanceName)
  → Busca User + Services + PublicProfile
  → groq-ai.ts → buildSystemPrompt() → Groq API
  → evolution-api.ts sendTextMessage → resposta automática
  → Salva WhatsAppMessage
```

### FLUXO 5: Lembrete (cron)

```
Vercel Cron → GET /api/cron/reminders (9h UTC)
  → Busca Appointments para amanhã + hoje (status=PENDING)
  → Para cada: busca User + WhatsAppSession
  → evolution-api.ts sendTextMessage → lembrete
  → Atualiza Appointment(reminderSent=true)
```

---

## 6. BUGS CONHECIDOS

| # | Bug | Arquivo:Linha | Severidade | Status |
|---|-----|---------------|------------|--------|
| 1 | ~~API Key errada no .env~~ | `.env` → `EVOLUTION_API_KEY` | 🔴 Crítico | ✅ Corrigido |
| 2 | ~~QR Code não aparece (REST vs Webhook)~~ | `connect/route.ts`, `incoming/route.ts` | 🔴 Crítico | ✅ Corrigido |
| 3 | reminderSent reutilizado para 3 finalidades | `book/route.ts:158`, `appointments/[id]/route.ts:115`, `cron/reminders/route.ts:54` | 🟡 Alto | Pendente |
| 4 | Timezone bug no cron (UTC vs BRT) | `cron/reminders/route.ts:131` | 🟡 Alto | Pendente |
| 5 | Webhook sem autenticação | `webhooks/evolution/incoming/route.ts` | 🟡 Alto | Pendente |
| 6 | Catch blocks vazios | `connect/route.ts:45,58` | 🟠 Médio | Pendente |
| 7 | updateMany marca todas as msgs | `groq-ai.ts:101-104` | 🟠 Médio | Pendente |
| 8 | AI-toggle sem validação de plano | `ai-toggle/route.ts` | 🟠 Médio | Pendente |

---

## 7. DEPENDÊNCIAS EXTERNAS

| Serviço | Variável | Status | Uso |
|---------|----------|--------|-----|
| Evolution Go API | `EVOLUTION_API_KEY` + `EVOLUTION_API_URL` | ✅ Chave corrigida + Webhook QR Code | WhatsApp |
| Groq API | `GROQ_API_KEY` | ✅ Funcional | IA |
| Neon PostgreSQL | `DATABASE_URL` | ✅ Funcional | Database |
| Vercel | Hosting + Cron | ✅ Funcional | Deploy + Lembretes |

---

## 8. ARQUITETURA MULTI-TENANT

Cada nail designer opera com:

- **Instância Evolution Go própria**: nome = `user.slug`
- **Token de instância único**: gerado em `connect/route.ts:38,80-89`, salvo em `WhatsAppSession`
- **IA própria**: prompt construído com serviços + perfil da nail específica
- **Banco de dados compartilhado**: mesmo PostgreSQL, filtrado por `userId`

### Regra de isolamento

Todas as chamadas à Evolution Go API usam `session.instanceToken` (não o `GLOBAL_API_KEY`), garantindo que cada nail só acessa sua própria instância WhatsApp.

---

## 9. VARIÁVEIS DE AMBIENTE

| Variável | Arquivo | Descrição |
|----------|---------|-----------|
| `DATABASE_URL` | `.env:1` | Neon PostgreSQL (cloud) |
| `JWT_SECRET` | `.env:2` | Chave JWT para autenticação |
| `NEXT_PUBLIC_APP_URL` | `.env:3` | `https://www.clubnailsbrasil.com.br` |
| `CLOUDINARY_CLOUD_NAME` | `.env:6` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `.env:7` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `.env:8` | Cloudinary API secret |
| `EVOLUTION_API_URL` | `.env:11` | `http://77.37.41.176:4000` |
| `EVOLUTION_API_KEY` | `.env:12` | Evolution Go global API key |
| `GROQ_API_KEY` | `.env:15` | Groq API key para IA |

---

*Documento gerado em: 25/07/2026*
*Última atualização: Chave Evolution Go corrigida + QR Code via Webhook + Status Connection via Webhook*
