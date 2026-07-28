# MAPA DA ARQUITETURA COMPLETO — ClubNailsBrasil

**Data:** 27/07/2026
**Objetivo:** Documentação definitiva da arquitetura antes de qualquer correção/implementação
**Autor:** Auditoria automática (opencode)
**Status:** 10/10 etapas concluídas

---

# ETAPA 1: MAPA DOS MÓDULOS

## 17 Módulos Identificados

| # | Módulo | Arquivo Principal | Owner | Camada |
|---|--------|-------------------|-------|--------|
| 1 | Autenticação | `src/lib/auth.ts`, `src/lib/authMiddleware.ts` | Backend (lib) | Core |
| 2 | Dashboard | `src/app/dashboard/page.tsx` | Frontend (page) | UI |
| 3 | Clientes | `src/components/ClientManager.tsx` | Frontend (component) | UI |
| 4 | Serviços | `src/components/ServiceManager.tsx` | Frontend (component) | UI |
| 5 | Agenda | `src/components/WeeklyCalendar.tsx`, `src/components/BookingModal.tsx` | Frontend (component) | UI |
| 6 | Bloqueio de Horários | `src/components/BlockedTimeManager.tsx` | Frontend (component) | UI |
| 7 | Financeiro | `src/components/FinancialDashboard.tsx` | Frontend (component) | UI |
| 8 | Página Pública | `src/app/p/[slug]/page.tsx` | Frontend (page) | UI |
| 9 | Agendamento Online | `src/app/api/public/[slug]/book/route.ts` | Backend (API) | API |
| 10 | WhatsApp Automatizado | `src/components/WhatsAppConnect.tsx`, `src/lib/evolution-api.ts` | Frontend + Backend | Full |
| 11 | IA Secretária | `src/components/AISecretary.tsx`, `src/lib/groq-ai.ts` | Frontend + Backend | Full |
| 12 | Lembretes | `src/app/api/cron/send-reminders/route.ts` | Backend (API) | Cron |
| 13 | Promoções/Marketing | `src/components/PromotionSender.tsx` | Frontend (component) | UI |
| 14 | Indicações (Referral) | `src/app/api/referral/track/route.ts` | Backend (API) | API |
| 15 | Fornecedores | `src/components/SupplierManager.tsx` | Frontend (component) | UI |
| 16 | Admin | `src/app/admin/page.tsx` | Frontend (page) | UI |
| 17 | Configurações | `src/app/dashboard/settings/page.tsx` | Frontend (page) | UI |

---

# ETAPA 2: MAPA DAS FUNCIONALIDADES

## MÓDULO 1: Autenticação

**Objetivo:** Controlar acesso, sessões e permissões dos usuários
**Quem usa:** Todos os usuários logados, CEO (admin), sistema (cron)
**Quando:** Login, registro, qualquer requisição autenticada

**Telas/Componentes:**
- `src/app/login/page.tsx` — Tela de login
- `src/app/register/page.tsx` — Tela de registro
- `src/components/Layout.tsx` — Sidebar com menus baseados no plano

**APIs:**
- `POST /api/register` — Criar conta
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout (revoga token no Redis)
- `POST /api/auth/forgot` — Solicitar reset (gera token)
- `POST /api/auth/reset` — Redefinir senha

**Tabelas:** User, PasswordReset
**Componentes:** Layout (sidebar), ProtectedRoute
**Páginas:** Login, Register
**Serviços externos:** Nenhum
**Automações:** Nenhuma
**Lógica interna:**
- JWT com fallback hardcoded `'nails-saas-secret'`
- CEO bypass hardcoded: `euhenriqueofc26@gmail.com`
- Verificação de plano e expiração
- Rate limiting por IP (Upstash Redis)

---

## MÓDULO 2: Dashboard

**Objetivo:** Visão geral do negócio (clientes, receita, agendamentos)
**Quem usa:** Nail designer logada
**Quando:** Após login, acesso principal

**Telas/Componentes:**
- `src/app/dashboard/page.tsx` — Dashboard principal com cards
- `src/components/QuickActions.tsx` — Ações rápidas

**APIs:**
- `GET /api/dashboard` — Dados consolidados
- `GET /api/dashboard/daily` — Dados diários

**Tabelas:** Appointment, Client, Revenue, Service
**Componentes:** DashboardCards
**Páginas:** Dashboard
**Serviços externos:** Nenhum
**Automações:** Nenhuma
**Lógica interna:**
- Carrega TODOS os registros em memória (`findMany({})`)
- Filtro por data no frontend
- Sem paginação

---

## MÓDULO 3: Clientes

**Objetivo:** Gerenciar cadastro de clientes
**Quem usa:** Nail designer logada
**Quando:** Cadastro manual, antes de agendar

**Telas/Componentes:**
- `src/components/ClientManager.tsx` — Lista, busca, CRUD
- `src/components/ClientProfileModal.tsx` — Perfil detalhado com fotos
- `src/components/AddClientModal.tsx` — Modal de criação

**APIs:**
- `GET /api/clients` — Listar clientes
- `POST /api/clients` — Criar cliente
- `PUT /api/clients/[id]` — Atualizar
- `DELETE /api/clients/[id]` — Excluir
- `GET /api/clients/[id]/profile` — Perfil completo com fotos
- `POST /api/clients/[id]/photos` — Upload de foto
- `DELETE /api/clients/[id]/photos/[photoId]` — Excluir foto

**Tabelas:** Client, ClientPhoto
**Componentes:** ClientManager, ClientProfileModal, AddClientModal
**Páginas:** Dashboard (aba)
**Serviços externos:** Cloudinary (upload)
**Automações:** Nenhuma
**Lógica interna:**
- Busca por nome/telefone
- Contagem de agendamentos por cliente
- Upload para Cloudinary com exclusão automática

---

## MÓDULO 4: Serviços

**Objetivo:** Gerenciar catálogo de serviços oferecidos
**Quem usa:** Nail designer logada
**Quando:** Cadastro antes de agendar

**Telas/Componentes:**
- `src/components/ServiceManager.tsx` — Lista, CRUD, busca

**APIs:**
- `GET /api/services` — Listar serviços
- `POST /api/services` — Criar serviço
- `PUT /api/services/[id]` — Atualizar
- `DELETE /api/services/[id]` — Excluir

**Tabelas:** Service
**Componentes:** ServiceManager
**Páginas:** Dashboard (aba)
**Serviços externos:** Cloudinary (imagem do serviço)
**Automações:** Nenhuma
**Lógica interna:**
- Contagem de agendamentos por serviço
- Filtro por isActive

---

## MÓDULO 5: Agenda

**Objetivo:** Visualizar e gerenciar agendamentos
**Quem usa:** Nail designer logada
**Quando:** Diariamente, ao gerenciar agenda

**Telas/Componentes:**
- `src/components/WeeklyCalendar.tsx` — Calendário semanal
- `src/components/BookingModal.tsx` — Modal de criação de agendamento
- `src/components/AppointmentCard.tsx` — Card individual do agendamento
- `src/components/CalendarView.tsx` — Visualização alternativa

**APIs:**
- `GET /api/appointments` — Listar agendamentos
- `POST /api/appointments` — Criar agendamento
- `PUT /api/appointments/[id]` — Atualizar (status, cancelamento)
- `DELETE /api/appointments/[id]` — Excluir

**Tabelas:** Appointment, Client, Service, BlockedTime
**Componentes:** WeeklyCalendar, BookingModal, AppointmentCard
**Páginas:** Dashboard (aba principal)
**Serviços externos:** WhatsApp (notificação automática)
**Automações:**
- Ao criar: envia WhatsApp de confirmação
- Ao criar: cria Revenue se status = completed
**Lógica interna:**
- Slots disponíveis: exclui horários bloqueados e ocupados
- Conflito de horário: verifica se nail já tem agendamento
- Validação de plano (limite de agendamentos)

---

## MÓDULO 6: Bloqueio de Horários

**Objetivo:** Bloquear horários específicos (férias, feriados, pausas)
**Quem usa:** Nail designer logada
**Quando:** Quando não disponível em horário específico

**Telas/Componentes:**
- `src/components/BlockedTimeManager.tsx` — CRUD de bloqueios

**APIs:**
- `GET /api/blocked-times` — Listar bloqueios
- `POST /api/blocked-times` — Criar bloqueio
- `DELETE /api/blocked-times/[id]` — Excluir bloqueio

**Tabelas:** BlockedTime
**Componentes:** BlockedTimeManager
**Páginas:** Dashboard (aba)
**Serviços externos:** Nenhum
**Automações:** Nenhuma
**Lógica interna:**
- Slots disponíveis excluem horários bloqueados
- Conflito: não permite agendar em horário bloqueado

---

## MÓDULO 7: Financeiro

**Objetivo:** Controle de receitas e despesas
**Quem usa:** Nail designer logada (requer plano pago)
**Quando:** Consulta periódica

**Telas/Componentes:**
- `src/components/FinancialDashboard.tsx` — Resumo financeiro
- `src/components/ExpenseForm.tsx` — Formulário de despesas

**APIs:**
- `GET /api/financial` — Listar receitas e despesas
- `POST /api/financial` — Criar despesa
- `GET /api/financial/summary` — Resumo consolidado

**Tabelas:** Revenue, Expense
**Componentes:** FinancialDashboard, ExpenseForm
**Páginas:** Dashboard (aba, condicional ao plano)
**Serviços externos:** Nenhum
**Automações:**
- Revenue criado automaticamente ao concluir agendamento
**Lógica interna:**
- Bloqueado para plano Free
- Revenue = soma de agendamentos concluídos
- Expense = cadastrado manualmente

---

## MÓDULO 8: Página Pública

**Objetivo:** Página pública do estúdio para clientes agendarem
**Quem usa:** Clientes finais (público)
**Quando:** Acesso via link `/p/[slug]`

**Telas/Componentes:**
- `src/app/p/[slug]/page.tsx` — Página pública
- `src/components/PublicBooking.tsx` — Componente de agendamento

**APIs:**
- `GET /api/public/[slug]` — Dados do estúdio
- `POST /api/public/[slug]/book` — Criar agendamento online

**Tabelas:** User, PublicProfile, Service, Appointment, Client, BlockedTime
**Componentes:** PublicBooking
**Páginas:** `/p/[slug]`
**Serviços externos:** WhatsApp (notificação)
**Automações:**
- Ao agendar: cria Client (se novo) + Appointment + WhatsApp notification
**Lógica interna:**
- Sem autenticação (público)
- Cria cliente automaticamente se não existe
- Verifica conflito de horário
- Slots disponíveis excluem bloqueios

---

## MÓDULO 9: Agendamento Online

**Objetivo:** Permitir que clientes agendem sem login
**Quem usa:** Clientes finais
**Quando:** Via link público do estúdio

**Telas/Componentes:** (integrado ao Módulo 8)
**APIs:** (integrado ao Módulo 8)
**Tabelas:** Client, Appointment, Revenue
**Componentes:** PublicBooking
**Páginas:** `/p/[slug]`
**Serviços externos:** WhatsApp
**Automações:**
- Criação de cliente automática
- Notificação para nail designer
**Lógica interna:**
- Verificação de disponibilidade
- Criação de Revenue automática

---

## MÓDULO 10: WhatsApp Automatizado

**Objetivo:** Gerenciar conexão WhatsApp e envio de mensagens
**Quem usa:** Nail designer (conectar) + Sistema (enviar)
**Quando:** Conexão inicial, envio de mensagens

**Telas/Componentes:**
- `src/components/WhatsAppConnect.tsx` — QR Code e status
- `src/components/WhatsAppButton.tsx` — Botão de envio

**APIs:**
- `GET /api/whatsapp` — Status da sessão
- `POST /api/whatsapp/connect` — Conectar (cria instância)
- `POST /api/whatsapp/send` — Enviar mensagem
- `POST /api/whatsapp/send-reminder` — Enviar lembrete
- `POST /api/whatsapp/send-ai-message` — Enviar via IA
- `POST /api/whatsapp/disconnect` — Desconectar
- `POST /api/whatsapp/send-invitation` — Enviar convite
- `POST /api/whatsapp/send-promotion` — Enviar promoção
- `GET /api/whatsapp/status` — Status detalhado
- `POST /api/whatsapp/sync-history` — Sincronizar histórico

**Tabelas:** WhatsAppSession, WhatsAppMessage
**Componentes:** WhatsAppConnect, WhatsAppButton
**Páginas:** Dashboard (aba)
**Serviços externos:** Evolution Go API (VPS)
**Automações:**
- Reconexão automática (até 3 tentativas)
- Webhook de recebimento de mensagens
**Lógica interna:**
- Instância criada com nome `user-${userId}`
- QR Code exibido em tempo real
- Status: INITIALIZING → CONNECTED → DISCONNECTED
- Reconexão automática no webhook

---

## MÓDULO 11: IA Secretária

**Objetivo:** Responder automaticamente mensagens WhatsApp via IA
**Quem usa:** Clientes (mensagens) + Nail designer (configura)
**Quando:** Mensagem recebida + AI habilitada

**Telas/Componentes:**
- `src/components/AISecretary.tsx` — Toggle e configuração

**APIs:**
- POST via WhatsApp webhook (processamento)
- POST `/api/whatsapp/send-ai-message` (envio)

**Tabelas:** WhatsAppMessage, User, Service, PublicProfile
**Componentes:** AISecretary
**Páginas:** Dashboard (configurações)
**Serviços externos:** Groq API (LLaMA 3.3-70B)
**Automações:**
- Processa cada mensagem INBOUND automaticamente
**Lógica interna:**
- System prompt inclui: serviços, perfil, contexto
- Busca histórico de conversa (mensagens anteriores)
- Resposta automática via `sendMessage`
- Marca `aiProcessed=true` **antes** do envio real (bug)

---

## MÓDULO 12: Lembretes

**Objetivo:** Enviar lembretes automáticos por WhatsApp
**Quem usa:** Sistema (cron)
**Quando:** Diariamente às 9h BRT

**Telas/Componentes:** Nenhum (backend only)
**APIs:**
- `GET /api/cron/send-reminders` (cron Vercel)

**Tabelas:** Appointment, WhatsAppSession
**Componentes:** Nenhum
**Páginas:** Nenhuma
**Serviços externos:** WhatsApp (Evolution API)
**Automações:**
- Lembrete 30min antes do agendamento
- Lembrete para agendamentos de amanhã
**Lógica interna:**
- Filtra agendamentos de amanhã e de 30min
- Verifica se lembrete já foi enviado
- Usa `confirmationSentAt` **que não existe no schema** (bug)
- Marca `reminderSent = true`

---

## MÓDULO 13: Promoções/Marketing

**Objetivo:** Criar e enviar promoções para clientes
**Quem usa:** Nail designer logada
**Quando:** Quando quer divulgar promoção

**Telas/Componentes:**
- `src/components/PromotionSender.tsx` — Criação e envio

**APIs:**
- `GET /api/promotions` — Listar promoções
- `POST /api/promotions` — Criar promoção
- `DELETE /api/promotions/[id]` — Excluir

**Tabelas:** Promotion, Client
**Componentes:** PromotionSender
**Páginas:** Dashboard (aba)
**Serviços externos:** WhatsApp (links wa.me)
**Automações:**
- Gera links wa.me para cada cliente
**Lógica interna:**
- Substitui variáveis `{clientName}`, `{discount}` na mensagem
- Não envia diretamente — gera links

---

## MÓDULO 14: Indicações (Referral)

**Objetivo:** Sistema de indicações entre usuários
**Quem usa:** Nail designers (indicadoras e indicadas)
**Quando:** No registro (via cookie ref_code)

**Telas/Componentes:** Nenhum (backend only)
**APIs:**
- `POST /api/referral/track` — Registrar indicação

**Tabelas:** Referral, User
**Componentes:** Nenhum
**Páginas:** Nenhuma
**Serviços externos:** Nenhum
**Automações:**
- Cria Referral ao registrar com ref_code
**Lógica interna:**
- Cookie `ref_code` setado na URL `/register?ref=CÓDIGO`
- Não calcula comissão nem recompensa

---

## MÓDULO 15: Fornecedores

**Objetivo:** Lista de fornecedores (links úteis)
**Quem usa:** Nail designer logada
**Quando:** Cadastro manual

**Telas/Componentes:**
- `src/components/SupplierManager.tsx` — CRUD

**APIs:**
- `GET /api/suppliers` — Listar
- `POST /api/suppliers` — Criar
- `DELETE /api/suppliers/[id]` — Excluir

**Tabelas:** Supplier
**Componentes:** SupplierManager
**Páginas:** Dashboard (aba)
**Serviços externos:** Nenhum
**Automações:** Nenhuma
**Lógica interna:** CRUD simples, sem relações

---

## MÓDULO 16: Admin

**Objetivo:** Painel administrativo para gestão de usuários
**Quem usa:** CEO (admin)
**Quando:** Consulta e gerenciamento

**Telas/Componentes:**
- `src/app/admin/page.tsx` — Painel admin

**APIs:**
- `GET /api/admin/users` — Listar usuários
- `PUT /api/admin/users/[id]` — Alterar usuário
- `GET /api/admin/referrals` — Listar indicações
- `GET /api/admin/analytics` — Métricas

**Tabelas:** User, Plan, Client, Appointment, Referral
**Componentes:** AdminPanel
**Páginas:** `/admin`
**Serviços externos:** Nenhum
**Automações:** Nenhuma
**Lógica interna:**
- Acesso restrito a `role === 'admin'` ou email do CEO
- Pode bloquear/desbloquear usuários
- Pode alterar plano de usuários
- Vê métricas gerais

---

## MÓDULO 17: Configurações

**Objetivo:** Configurar perfil, WhatsApp, IA e conta
**Quem usa:** Nail designer logada
**Quando:** Setup inicial e conforme necessário

**Telas/Componentes:**
- `src/app/dashboard/settings/page.tsx` — Página de configurações

**APIs:**
- `GET /api/profile` — Buscar perfil
- `PUT /api/profile` — Atualizar perfil

**Tabelas:** User, PublicProfile, WhatsAppSession
**Componentes:** SettingsPage
**Páginas:** `/dashboard/settings`
**Serviços externos:** Cloudinary (upload de avatar/capa)
**Automações:**
- Toggle de AI (ativa/desativa IA)
- Conexão WhatsApp (integra com Módulo 10)
**Lógica interna:**
- **Muitas configurações são stubs** (não salvam de verdade)
- Botão "Excluir conta" não funciona
- Botão "Alterar senha" não funciona
- Toggle AI funciona (salva no banco)

---

# ETAPA 3: MAPA DOS FLUXOS

## FLUXO 1: Registro de Usuário

```
USUÁRIO
  → Acessa /register
  → Preenche: email, senha, nome, nome do estúdio, slug, WhatsApp
  → Clica "Criar Conta"

BACKEND (/api/register)
  → Valida dados (campos obrigatórios)
  → Verifica se email já existe
  → Verifica se slug já existe
  → Hash da senha (bcrypt)
  → Cria User no banco (com refCode aleatório)
  → Se cookie ref_code existe: cria Referral
  → Gera JWT token
  → Retorna {token, user}

FRONTEND
  → Salva token no localStorage
  → Redireciona para /dashboard
  → Cria Stripe Customer (stub — não funciona)
```

**Entry:** `/register` (formulário)
**Exit:** `/dashboard` (redirecionamento)
**Serviços:** Prisma (User), bcrypt, JWT

---

## FLUXO 2: Login

```
USUÁRIO
  → Acessa /login
  → Preenche: email, senha
  → Clica "Entrar"

BACKEND (/api/auth/login)
  → Busca User por email
  → Compara senha (bcrypt)
  → Verifica se blocked === true
  → Verifica se plano expirou
  → Gera JWT token
  → Retorna {token, user}

FRONTEND
  → Salva token no localStorage
  → Redireciona para /dashboard
```

**Entry:** `/login` (formulário)
**Exit:** `/dashboard` (redirecionamento)

---

## FLUXO 3: Criação de Cliente (Manual)

```
NAIL DESIGNER
  → Clica "Novo Cliente"
  → Preenche: nome, WhatsApp, observações
  → Clica "Salvar"

FRONTEND
  → POST /api/clients {name, whatsapp, notes}
  → Token no header Authorization

BACKEND (/api/clients)
  → authMiddleware: valida JWT
  → Valida dados
  → Cria Client no banco
  → Retorna {id, name, ...}

FRONTEND
  → Atualiza lista de clientes
  → Fecha modal
```

**Entry:** Botão "Novo Cliente"
**Exit:** Lista atualizada

---

## FLUXO 4: Criação de Serviço

```
NAIL DESIGNER
  → Clica "Novo Serviço"
  → Preenche: nome, preço, duração, descrição, imagem
  → Clica "Salvar"

FRONTEND
  → POST /api/services {name, price, duration, description}
  → Se imagem: upload para Cloudinary → URL

BACKEND (/api/services)
  → authMiddleware: valida JWT
  → Valida dados
  → Cria Service no banco
  → Retorna {id, name, ...}

FRONTEND
  → Atualiza lista de serviços
```

**Entry:** Botão "Novo Serviço"
**Exit:** Lista atualizada

---

## FLUXO 5: Agendamento Manual

```
NAIL DESIGNER
  → Acessa aba "Agenda"
  → Seleciona data
  → Clica em horário disponível
  → Modal abre:
    → Seleciona cliente
    → Seleciona serviço
    → Confirma

FRONTEND
  → POST /api/appointments {clientId, serviceId, date, time}
  → Token no header

BACKEND (/api/appointments)
  → authMiddleware: valida JWT
  → Verifica conflito de horário
  → Verifica limite de plano
  → Cria Appointment no banco
  → Busca dados do cliente e serviço
  → Busca WhatsAppSession
  → Se WhatsApp conectado:
    → evolutionApi.sendMessage(whatsapp, confirmação)
    → Confirma appointment (confirmationSent = true)
  → Retorna {id, ...}

FRONTEND
  → Atualiza calendário
```

**Entry:** Clique no horário
**Exit:** Agendamento criado, WhatsApp enviado

---

## FLUXO 6: Agendamento Online (Público)

```
CLIENTE
  → Acessa /p/[slug] do estúdio
  → Vê lista de serviços e perfil
  → Seleciona serviço
  → Escolhe data e horário
  → Preenche: nome, WhatsApp
  → Confirma

BACKEND (/api/public/[slug]/book)
  → Busca User por slug
  → Busca serviço
  → Verifica disponibilidade (conflitos + bloqueios)
  → Busca ou cria Client
  → Cria Appointment (status: confirmed)
  → Cria Revenue (price)
  → Busca WhatsAppSession
  → Se WhatsApp conectado:
    → evolutionApi.sendMessage(whatsapp, "Novo agendamento online...")
  → Retorna {success, appointmentId}

CLIENTE
  → Vê confirmação na tela
```

**Entry:** `/p/[slug]` (link público)
**Exit:** Confirmação na tela + WhatsApp para nail

---

## FLUXO 7: Confirmação Automática de Agendamento

```
TRIGGER: Novo appointment criado (via manual ou público)

BACKEND
  → Após criar Appointment
  → Busca WhatsAppSession do user
  → Se conectado:
    → evolutionApi.sendMessage(whatsapp number, mensagem)
    → Atualiza appointment: confirmationSent = true, confirmationSentAt = now
  → Se não conectado:
    → appointment fica pendente de confirmação
```

**Entry:** Criação de appointment
**Exit:** WhatsApp enviado (ou não)

---

## FLUXO 8: Recebimento de Mensagem WhatsApp + IA

```
CLIENTE
  → Envia mensagem via WhatsApp

EVOLUTION API
  → POST /api/webhooks/evolution/incoming

BACKEND
  → Busca WhatsAppSession por instanceName
  → Se não encontrada: retorna 200 (ignora)
  → Verifica dedup (hash = from + content + timestamp)
  → Se já processada: retorna 200
  → Salva WhatsAppMessage (direction: INBOUND)
  → Se user.aiEnabled:
    → Busca histórico de conversa (últimas 10 mensagens)
    → Busca serviços e perfil do user
    → Monta system_prompt
    → Groq.chat.completions.create (LLaMA 3.3-70B)
    → Salva resposta no banco
    → evolutionApi.sendMessage(from, resposta)
    → Marca aiProcessed = true ← BUG: marca antes do envio
  → Retorna 200
```

**Entry:** Mensagem WhatsApp
**Exit:** Resposta automática (se AI habilitada)

---

## FLUXO 9: Lembrete Automático (Cron)

```
VERCEL CRON
  → GET /api/cron/send-reminders (9h BRT diariamente)

BACKEND
  → Busca todos os Users
  → Para cada User:
    → Busca WhatsAppSession
    → Se não conectada: pula
    → Busca agendamentos de AMANHÃ (confirmationSent = false)
    → Para cada agendamento:
      → Busca client e service
      → evolutionApi.sendMessage(client.whatsapp, lembrete)
      → Atualiza: confirmationSent = true, confirmationSentAt = now
    → Busca agendamentos de 30min (reminderSent = false)
    → Para cada agendamento:
      → evolutionApi.sendMessage(client.whatsapp, lembrete 30min)
      → Atualiza: reminderSent = true, reminderSentAt = now
```

**Entry:** Cron (9h BRT)
**Exit:** Lembretes enviados

---

## FLUXO 10: Health Check (Cron)

```
VERCEL CRON
  → GET /api/health (3h BRT diariamente)

BACKEND
  → Busca todos os Users
  → Para cada User:
    → Busca WhatsAppSession
    → Se não existe: pula
    → Se status !== CONNECTED:
      → Tenta reconectar via evolutionApi
      → Atualiza status
  → Limpa cache Redis expirado
  → Retorna {status, timestamp}
```

**Entry:** Cron (3h BRT)
**Exit:** Sessões reconectadas

---

## FLUXO 11: Checkout (Simulado)

```
USUÁRIO
  → Acessa /register ou /dashboard
  → Clica em plano
  → Botão "Assinar" (stub)

FRONTEND
  → redireciona para /dashboard
  → NÃO cria sessão Stripe
  → NÃO cobra nada
```

**Entry:** Botão de assinatura
**Exit:** Nenhum (stub)

---

## FLUXO 12: Upload de Imagem

```
USUÁRIO
  → Seleciona imagem (avatar, capa, foto de serviço)
  → Frontend faz upload

FRONTEND
  → POST /api/upload (multipart/form-data)
  → Retorna {url}

OU

  → Upload direto para Cloudinary via unsigned preset
  → URL salva no banco via PUT /api/profile ou POST /api/services

BACKEND
  → Se via API: recebe arquivo, salva no Cloudinary
  → Retorna URL pública
```

**Entry:** Seleção de arquivo
**Exit:** URL da imagem

---

## FLUXO 13: Promoção via WhatsApp

```
NAIL DESIGNER
  → Acessa aba "Marketing"
  → Cria promoção: título, mensagem, desconto
  → Clica "Enviar"

FRONTEND
  → POST /api/promotions {title, message, discount}
  → Retorna promoção com links wa.me gerados
  → Nail clica nos links e envia manualmente
```

**Entry:** Formulário de promoção
**Exit:** Links wa.me gerados

---

## FLUXO 14: Indicação (Referral)

```
INDICADORA
  → Compartilha link: /register?ref=CÓDIGO

INDICADA
  → Acessa link
  → Cookie ref_code é setado
  → Registra conta

BACKEND (/api/register)
  → Lê cookie ref_code
  → Busca User pelo refCode
  → Cria Referral (referrerId, referredUserId, status: pending)
```

**Entry:** Link de indicação
**Exit:** Referral criado no banco

---

# ETAPA 4: MAPA DAS DEPENDÊNCIAS

## Relações de Dependência (quem depende de quem)

```
AUTENTICAÇÃO
├── depende de: Prisma (User), bcrypt, JWT, Redis (revocation)
└── é dependência de: TODOS os outros módulos (exceto Página Pública)

DASHBOARD
├── depende de: Autenticação
├── depende de: Prisma (Appointment, Client, Revenue, Service)
└── é dependência de: Ninguém (ponto de entrada)

CLIENTES
├── depende de: Autenticação
├── depende de: Prisma (Client, ClientPhoto)
├── depende de: Cloudinary (upload de fotos)
└── é dependência de: Agendamentos, Página Pública, Promoções

SERVIÇOS
├── depende de: Autenticação
├── depende de: Prisma (Service)
├── depende de: Cloudinary (imagem do serviço)
└── é dependência de: Agendamentos, Página Pública, IA (prompt)

AGENDAMENTOS
├── depende de: Autenticação
├── depende de: Clientes (Client)
├── depende de: Serviços (Service)
├── depende de: Bloqueio de Horários (BlockedTime)
├── depende de: WhatsApp (confirmação automática)
└── é dependência de: Dashboard, Financeiro, Lembretes

BLOQUEIO DE HORÁRIOS
├── depende de: Autenticação
├── depende de: Prisma (BlockedTime)
└── é dependência de: Agendamentos, Slots disponíveis

FINANCEIRO
├── depende de: Autenticação
├── depende de: Agendamentos (Revenue = conclusões)
└── é dependência de: Dashboard (faturamento)

PÁGINA PÚBLICA
├── depende de: Prisma (User, PublicProfile, Service)
├── depende de: BlockedTime (slots)
├── depende de: Appointments (conflitos)
├── depende de: WhatsApp (notificação para nail)
└── NÃO depende de: Autenticação (é pública)

AGENDAMENTO ONLINE
├── depende de: Página Pública (dados do estúdio)
├── depende de: Slots (horários disponíveis)
├── depende de: Clientes (criação automática)
├── depende de: Agendamentos (criação)
├── depende de: WhatsApp (notificação)
└── NÃO depende de: Autenticação (é público)

WHATSAPP
├── depende de: Evolution API (VPS externa)
├── depende de: Prisma (WhatsAppSession)
├── depende de: Autenticação (conectar/desconectar)
└── é dependência de: Agendamentos (confirmação), Lembretes, IA, Promoções

IA SECRETÁRIA
├── depende de: Groq API (LLaMA)
├── depende de: WhatsApp (envio de resposta)
├── depende de: Prisma (User, Service, PublicProfile, WhatsAppMessage)
├── depende de: Autenticação (toggle)
└── NÃO é dependência de ninguém (módulo autônomo)

LEMBRETES
├── depende de: WhatsApp (envio)
├── depende de: Prisma (Appointment, WhatsAppSession)
└── depende de: Autenticação (dispersão manual)

PROMOÇÕES
├── depende de: Autenticação
├── depende de: Clientes (lista de clientes)
├── depende de: WhatsApp (links wa.me)
└── depende de: Prisma (Promotion)

INDICAÇÕES
├── depende de: Autenticação
├── depende de: Prisma (User, Referral)
└── NÃO é dependência de ninguém (módulo autônomo)

FORNECEDORES
├── depende de: Autenticação
├── depende de: Prisma (Supplier)
└── NÃO é dependência de ninguém (módulo isolado)

ADMIN
├── depende de: Autenticação (CEO check)
├── depende de: Prisma (User, Plan, Client, Appointment)
└── é dependência de: Ninguém (módulo de gestão)

SETTINGS
├── depende de: Autenticação
├── depende de: WhatsApp (conexão)
├── depende de: IA (toggle)
└── depende de: Prisma (User)
```

## Fluxo de Dados entre Módulos

| Dado | Módulo Origem | Módulo Destino | Como Chega |
|------|--------------|----------------|------------|
| `Client` | Clientes | Agendamentos | Referência por `clientId` |
| `Client` | Clientes | Página Pública | Criação automática no booking |
| `Service` | Serviços | Agendamentos | Referência por `serviceId` |
| `Service` | Serviços | IA | System prompt com lista de serviços |
| `Service` | Serviços | Página Pública | Exibição na listagem |
| `Appointment` | Agendamentos | Dashboard | Cards de resumo |
| `Appointment` | Agendamentos | Financeiro | Revenue automático |
| `Appointment` | Agendamentos | Lembretes | Cron diário |
| `BlockedTime` | Bloqueio | Slots | Exclusão de horários |
| `BlockedTime` | Bloqueio | Agendamentos | Verificação de conflito |
| `WhatsAppSession` | WhatsApp | Webhooks | Lookup por instanceName |
| `WhatsAppSession` | WhatsApp | Lembretes | Envio de mensagens |
| `WhatsAppSession` | WhatsApp | IA | Envio de resposta |
| `WhatsAppMessage` | WhatsApp | IA | Histórico de conversa |
| `PublicProfile` | Página Pública | IA | Contexto do estúdio |
| `Revenue` | Financeiro | Dashboard | Faturamento do mês |
| `Promotion` | Promoções | WhatsApp | Links wa.me |

---

# ETAPA 5: MAPA DO BANCO

## Modelo de Dados (17 tabelas)

### Tabela: User

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| email | String | Sim | Único |
| password | String | Sim | Hash bcrypt |
| name | String | Sim | Nome completo |
| studioName | String | Sim | Nome do estúdio |
| slug | String | Sim | Único, URL da página pública |
| whatsapp | String | Sim | Telefone |
| instagram | String | Não | Perfil Instagram |
| avatar | String | Não | URL da foto |
| role | String | Sim | "user" ou "admin" |
| blocked | Boolean | Sim | Default false |
| planId | String | Sim | FK → Plan (sem constraint) |
| subscriptionExpiresAt | DateTime | Não | Data de expiração da assinatura |
| trialEndsAt | DateTime | Não | **Nunca preenchido** |
| onboardingStep | Int | Sim | Default 1 |
| onboardingCompleted | Boolean | Sim | Default false |
| refCode | String | Sim | Código de indicação único |
| referredBy | String | Não | Código de quem indicou |
| aiEnabled | Boolean | Sim | Default false |
| stripeCustomerId | String | Não | **Não utilizado** |
| stripeSubscriptionId | String | Não | **Não utilizado** |
| createdAt | DateTime | Sim | Auto |
| updatedAt | DateTime | Sim | Auto |

**Quem cria:** `/api/register`
**Quem altera:** Settings (parcial), Admin
**Quem consulta:** Auth, Dashboard, Admin, Public, WhatsApp, IA
**Quem exclui:** Ninguém (soft delete não implementado)

---

### Tabela: Plan

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| name | String | Sim | "Free", "Pro", "Premium" |
| slug | String | Sim | Único: "free", "pro", "premium" |
| price | Float | Sim | Preço mensal |
| maxClients | Int | Sim | Limite de clientes |
| maxAppointments | Int | Sim | Limite de agendamentos |
| maxServices | Int | Sim | Limite de serviços |
| hasFinancial | Boolean | Sim | Acesso ao financeiro |
| hasAnalytics | Boolean | Sim | Acesso a analytics |

**Quem cria:** Seed (`prisma/seed.ts`) — 3 planos fixos
**Quem altera:** Ninguém em runtime
**Quem consulta:** Auth (limites), Admin (gerenciamento), Settings (exibição)

---

### Tabela: Client

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| userId | String | Sim | FK → User (multi-tenant) |
| name | String | Sim | Nome do cliente |
| whatsapp | String | Sim | Telefone |
| notes | String | Não | Observações |
| lastServiceDate | DateTime | Não | **Escrito mas nunca lido** |
| createdAt | DateTime | Sim | Auto |
| updatedAt | DateTime | Sim | Auto |

**Quem cria:** `/api/clients` (manual), `/api/public/[slug]/book` (automático)
**Quem altera:** `/api/clients/[id]`
**Quem consulta:** Agendamentos, Dashboard, Promoções, Página Pública
**Quem exclui:** `/api/clients/[id]` (cascade delete)

---

### Tabela: ClientPhoto

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| clientId | String | Sim | FK → Client (cascade delete) |
| url | String | Sim | URL do Cloudinary |
| createdAt | DateTime | Sim | Auto |

**Quem cria:** `/api/clients/[id]/photos`
**Quem consulta:** ClientProfileModal
**Quem exclui:** `/api/clients/[id]/photos` (banco + Cloudinary)

---

### Tabela: Service

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| userId | String | Sim | FK → User |
| name | String | Sim | Nome do serviço |
| price | Float | Sim | Preço em R$ |
| duration | Int | Sim | Duração em minutos (default 60) |
| description | String | Não | Descrição |
| image | String | Não | URL da imagem |
| isActive | Boolean | Sim | Default true |
| createdAt | DateTime | Sim | Auto |
| updatedAt | DateTime | Sim | Auto |

**Quem cria:** `/api/services`
**Quem altera:** `/api/services/[id]`
**Quem consulta:** Agendamentos, Página Pública, IA (prompt), Dashboard

---

### Tabela: Appointment

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| userId | String | Sim | FK → User |
| clientId | String | Sim | FK → Client |
| serviceId | String | Sim | FK → Service |
| date | DateTime | Sim | Data do agendamento |
| time | String | Sim | Horário (HH:MM) |
| price | Float | Sim | Preço cobrado |
| status | String | Sim | pending/confirmed/completed/cancelled |
| notes | String | Não | Observações |
| reminderSent | Boolean | Sim | Default false |
| reminderSentAt | DateTime | Não | Quando lembrete foi enviado |
| confirmationSent | Boolean | Sim | Default false |
| confirmationSentAt | DateTime | Não | Quando confirmação foi enviada |
| aiHandled | Boolean | Sim | Default false, **nunca setado como true** |
| createdAt | DateTime | Sim | Auto |
| updatedAt | DateTime | Sim | Auto |

**Quem cria:** `/api/appointments` (manual), `/api/public/[slug]/book` (público)
**Quem altera:** `/api/appointments/[id]` (status, cancelamento)
**Quem consulta:** Dashboard, Financeiro, Lembretes, ClientProfileModal
**Quem exclui:** `/api/appointments/[id]`

---

### Tabela: Revenue

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| userId | String | Sim | FK → User |
| amount | Float | Sim | Valor |
| description | String | Sim | Descrição |
| date | DateTime | Sim | Data |
| appointmentId | String | Sim | Único, FK → Appointment (sem constraint) |

**Quem cria:** `/api/appointments/[id]` (automático ao marcar "concluído")
**Quem consulta:** Dashboard, Financeiro

---

### Tabela: Expense

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| userId | String | Sim | FK → User |
| amount | Float | Sim | Valor |
| description | String | Sim | Descrição |
| category | String | Sim | material/equipamento/aluguel/luz/agua/internet/marketing/outros |
| date | DateTime | Sim | Data |
| createdAt | DateTime | Sim | Auto |

**Quem cria:** `/api/financial`
**Quem consulta:** Dashboard, Financeiro

---

### Tabela: BlockedTime

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| userId | String | Sim | FK → User |
| date | DateTime | Sim | Data do bloqueio |
| startTime | String | Sim | Hora início (HH:MM) |
| endTime | String | Sim | Hora fim (HH:MM) |
| reason | String | Não | Motivo |

**Quem cria:** `/api/blocked-times`
**Quem consulta:** Slots, Agendamentos
**Quem exclui:** `/api/blocked-times/[id]`

---

### Tabela: Supplier

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| userId | String | Sim | FK → User |
| name | String | Sim | Nome |
| link | String | Sim | URL |

**Quem cria:** `/api/suppliers`
**Quem consulta:** Dashboard (suppliers page)
**Quem exclui:** `/api/suppliers/[id]`

---

### Tabela: Promotion

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| userId | String | Sim | FK → User |
| title | String | Sim | Título |
| message | String | Sim | Mensagem com variáveis |
| discount | Float | Não | Percentual de desconto |
| sentCount | Int | Sim | Default 0 (links gerados) |
| createdAt | DateTime | Sim | Auto |

**Quem cria:** `/api/promotions`
**Quem consulta:** Marketing page
**Quem exclui:** `/api/promotions/[id]`

---

### Tabela: PublicProfile

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| userId | String | Sim | Único, FK → User |
| bio | String | Não | Descrição do estúdio |
| coverImage | String | Não | URL da imagem de capa |
| address | String | Não | Endereço |
| instagram | String | Não | Link Instagram |
| facebook | String | Não | Link Facebook |
| workingHours | String | Não | Horários de funcionamento |
| isActive | Boolean | Sim | Default true |

**Quem cria:** `/api/profile` (upsert)
**Quem altera:** `/api/profile`
**Quem consulta:** Página Pública, IA (contexto)

---

### Tabela: PasswordReset

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| email | String | Sim | Email do usuário |
| token | String | Sim | Único, token aleatório |
| expiresAt | DateTime | Sim | Expiração |

**Quem cria:** `/api/auth/forgot`
**Quem consulta:** (não existe rota de reset)

---

### Tabela: WhatsAppSession

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| userId | String | Sim | FK → User |
| instanceName | String | Sim | Único (user-${userId}) |
| instanceToken | String | Não | Token da instância Evolution |
| evolutionId | String | Não | ID na Evolution API |
| status | String | Sim | INITIALIZING/CONNECTED/DISCONNECTED |
| phoneNumber | String | Não | Número conectado |
| qrCode | String | Não | QR Code base64 |
| lastHeartbeat | DateTime | Não | Última verificação |
| createdAt | DateTime | Sim | Auto |
| updatedAt | DateTime | Sim | Auto |

**Quem cria:** `/api/whatsapp/connect`
**Quem altera:** Webhooks (status), Health check, Disconnect
**Quem consulta:** WhatsApp (envio), Lembretes, IA, Agendamentos

---

### Tabela: WhatsAppMessage

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| sessionId | String | Sim | FK → WhatsAppSession |
| direction | String | Sim | INBOUND/OUTBOUND |
| from | String | Sim | Telefone do remetente |
| to | String | Não | Telefone do destinatário |
| content | String | Sim | Texto da mensagem |
| messageType | String | Sim | text/image/video/audio/sticker |
| status | String | Sim | RECEIVED/SENT/FAILED |
| timestamp | DateTime | Sim | Auto |
| aiProcessed | Boolean | Sim | Default false |
| aiResponse | String | Não | Resposta da IA |
| appointmentId | String | Não | FK → Appointment (sem constraint) |
| createdAt | DateTime | Sim | Auto |

**Quem cria:** Webhook incoming (INBOUND), `/api/whatsapp/send` (OUTBOUND)
**Quem altera:** IA (aiProcessed, aiResponse), Timeout cleanup
**Quem consulta:** IA (histórico de conversa), Dedup

---

### Tabela: Referral

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| referrerId | String | Sim | FK → User |
| referredUserId | String | Sim | FK → User |
| status | String | Sim | pending/completed |
| createdAt | DateTime | Sim | Auto |

**Quem cria:** `/api/register` (quando cookie ref_code existe)
**Quem consulta:** Admin referrals

---

### Tabela: Partner

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | String (cuid) | Sim | PK |
| name | String | Sim | Nome |
| email | String | Não | Email |
| referralCode | String | Sim | Único |
| commissionRate | Float | Sim | Taxa de comissão |
| createdAt | DateTime | Sim | Auto |

**Quem cria:** `/api/partners` (sem auth)
**Quem consulta:** `/api/partners` (sem auth)

---

# ETAPA 6: MAPA DAS APIs

## Rotas Autenticadas (requerem token JWT)

| Método | Rota | Módulo | Body/Params | Response |
|--------|------|--------|-------------|----------|
| POST | `/api/register` | Auth | `{email, password, name, studioName, slug, whatsapp, instagram?, refCode?}` | `{token, user}` |
| POST | `/api/auth/login` | Auth | `{email, password}` | `{token, user}` |
| POST | `/api/auth/logout` | Auth | — | `{success: true}` |
| POST | `/api/auth/forgot` | Auth | `{email}` | `{success, message}` |
| POST | `/api/auth/reset` | Auth | `{token, password}` | `{success, message}` |
| GET | `/api/dashboard` | Dashboard | — | `{totalClients, totalRevenue, ...}` |
| GET | `/api/dashboard/daily` | Dashboard | — | `{date, revenue, appointments, ...}` |
| GET | `/api/clients` | Clients | — | `[{id, name, ...}]` |
| POST | `/api/clients` | Clients | `{name, whatsapp, notes?}` | `{id, ...}` |
| PUT | `/api/clients/[id]` | Clients | `{name?, whatsapp?, notes?}` | `{...}` |
| DELETE | `/api/clients/[id]` | Clients | — | `{success}` |
| GET | `/api/clients/[id]/profile` | Clients | — | `{name, whatsapp, notes, photos[], stats}` |
| POST | `/api/clients/[id]/photos` | Clients | `multipart/form-data` (file) | `{url}` |
| DELETE | `/api/clients/[id]/photos/[photoId]` | Clients | — | `{success}` |
| GET | `/api/services` | Services | — | `[{id, name, ...}]` |
| POST | `/api/services` | Services | `{name, price, duration, description?}` | `{...}` |
| PUT | `/api/services/[id]` | Services | `{name?, price?, ...}` | `{...}` |
| DELETE | `/api/services/[id]` | Services | — | `{success}` |
| GET | `/api/appointments` | Appointments | — | `[{id, client, service, ...}]` |
| POST | `/api/appointments` | Appointments | `{clientId, serviceId, date, time}` | `{...}` |
| PUT | `/api/appointments/[id]` | Appointments | `{status?, notes?}` | `{...}` |
| DELETE | `/api/appointments/[id]` | Appointments | — | `{success}` |
| GET | `/api/blocked-times` | BlockedTimes | — | `[{id, date, ...}]` |
| POST | `/api/blocked-times` | BlockedTimes | `{date, startTime, endTime, reason?}` | `{...}` |
| DELETE | `/api/blocked-times/[id]` | BlockedTimes | — | `{success}` |
| GET | `/api/financial` | Financial | — | `{revenue[], expenses[], total}` |
| POST | `/api/financial` | Financial | `{amount, description, category, date}` | `{...}` |
| GET | `/api/financial/summary` | Financial | — | `{revenue, expenses, profit, ...}` |
| GET | `/api/suppliers` | Suppliers | — | `[{id, name, link}]` |
| POST | `/api/suppliers` | Suppliers | `{name, link}` | `{...}` |
| DELETE | `/api/suppliers/[id]` | Suppliers | — | `{success}` |
| GET | `/api/promotions` | Promotions | — | `[{id, title, ...}]` |
| POST | `/api/promotions` | Promotions | `{title, message, discount?}` | `{...}` |
| DELETE | `/api/promotions/[id]` | Promotions | — | `{success}` |
| GET | `/api/profile` | Settings | — | `{bio, coverImage, ...}` |
| PUT | `/api/profile` | Settings | `{bio?, coverImage?, ...}` | `{...}` |
| GET | `/api/whatsapp` | WhatsApp | — | `{status, session}` |
| POST | `/api/whatsapp/connect` | WhatsApp | — | `{qrCode, status}` |
| POST | `/api/whatsapp/send` | WhatsApp | `{phone, message}` | `{success, messageId}` |
| POST | `/api/whatsapp/send-reminder` | WhatsApp | `{appointmentId, message}` | `{success}` |
| POST | `/api/whatsapp/send-ai-message` | WhatsApp | `{phone, message, userId}` | `{success, aiResponse}` |
| POST | `/api/whatsapp/disconnect` | WhatsApp | — | `{success}` |
| POST | `/api/whatsapp/send-invitation` | WhatsApp | `{phone, message}` | `{success}` |
| POST | `/api/whatsapp/send-promotion` | WhatsApp | `{phone, message}` | `{success}` |
| GET | `/api/whatsapp/status` | WhatsApp | — | `{status, connected, ...}` |
| POST | `/api/whatsapp/sync-history` | WhatsApp | `{sessionId?}` | `{synced: number}` |
| GET | `/api/admin/users` | Admin | — | `[{id, email, ...}]` |
| PUT | `/api/admin/users/[id]` | Admin | `{blocked?, role?, planId?}` | `{...}` |
| GET | `/api/admin/referrals` | Admin | — | `[{referrer, referred, ...}]` |
| GET | `/api/admin/analytics` | Admin | — | `{revenue, users, ...}` |
| POST | `/api/referral/track` | Referral | — | `{success}` |

---

## Rotas Públicas (sem autenticação)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/public/[slug]` | Dados do estúdio (perfil + serviços) |
| POST | `/api/public/[slug]/book` | Criar agendamento online |
| POST | `/api/invite` | Enviar convite por WhatsApp |
| POST | `/api/partners` | Criar parceiro |
| GET | `/api/partners` | Listar parceiros |

---

## Rotas de Webhook (sem autenticação)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/webhooks/evolution/incoming` | Receber mensagens WhatsApp |
| POST | `/api/cron/send-reminders` | Lembretes automáticos (cron Vercel) |
| GET | `/api/health` | Health check (cron Vercel) |

---

# ETAPA 7: MAPA DAS AUTOMAÇÕES

## Crons (Vercel)

| Cron | Frequência | Rota | Descrição | Bug? |
|------|------------|------|-----------|------|
| `send-reminders` | Diário 9h BRT | `/api/cron/send-reminders` | Envia lembretes para agendamentos de amanhã e de 30min | Falha se Evolution não conectada |
| `health` | Diário 3h BRT | `/api/health` | Verifica conexão WhatsApp, limpa cache expirado | Verifica apenas o primeiro user |

---

## Webhooks (inbound)

| Webhook | Trigger | O que faz | Bug? |
|---------|---------|-----------|------|
| `/api/webhooks/evolution/incoming` | Mensagem WhatsApp recebida | Dedup → Armazena → Se AI habilitada: Groq → Resposta automática | Sem autenticação; marca `aiProcessed=true` antes do envio real |

---

## Automações Inbound (reactive)

| Gatilho | O que faz | Onde |
|---------|-----------|------|
| Booking público (`/api/public/[slug]/book`) | Cria Client (se novo) + Appointment + Revenue + WhatsApp notification | `src/app/api/public/[slug]/book/route.ts` |
| Marcar "concluído" | Cria Revenue automático | `src/app/api/appointments/[id]/route.ts` |
| Registrar com ref_code | Cria Referral | `src/app/api/register/route.ts` |
| Conectar WhatsApp | Cria instância Evolution + QR Code | `src/app/api/whatsapp/connect/route.ts` |
| WhatsApp desconectado | Reconexão automática (até 3 tentativas) | `src/app/api/webhooks/evolution/incoming/route.ts` |

---

## Automações Outbound (proactive)

| Automação | Trigger | O que faz |
|-----------|---------|-----------|
| Confirmação automática | Novo agendamento criado | Envia WhatsApp: "Agendamento confirmado..." |
| Lembrete 30min | Cron 9h BRT | Envia WhatsApp: "Lembrete: seu agendamento em 30min..." |
| Lembrete amanhã | Cron 9h BRT | Envia WhatsApp: "Lembrete: amanhã às..." |
| Resposta IA | Mensagem recebida + AI enabled | Groq → Resposta automática |
| Notificação para nail (booking) | Booking público | WhatsApp: "Novo agendamento online..." |

---

## Fluxos de Automação com Bugs

| Fluxo | Problema |
|-------|----------|
| Lembrete | `confirmationSentAt` setado mas campo não existe no schema |
| IA | Marca `aiProcessed=true` antes do `sendMessage` retornar sucesso |
| Reconexão | Reconecta a primeira sessão desconhecida, não a específica |
| Confirmação | `confirmationSent` é boolean mas schema define como DateTime |
| Health check | Itera apenas `prisma.user.findMany()` — não verifica todas as sessões |

---

# ETAPA 8: MAPA DA INFRAESTRUTURA

## Stack

| Camada | Tecnologia | Serviço |
|--------|-----------|---------|
| Frontend | Next.js 14 (App Router) + React + Tailwind | Vercel |
| Backend | Next.js API Routes | Vercel |
| Banco | PostgreSQL + Prisma ORM | Neon (serverless) |
| Cache | Upstash Redis | Upstash |
| Auth | JWT (jose) | — |
| WhatsApp | Evolution Go v0.7.2 API | VPS 77.37.41.176:4000 |
| IA | Groq API (LLaMA 3.3-70B) | Groq Cloud |
| Upload | Cloudinary | Cloudinary |
| Deploy | Git push → Vercel auto-deploy | Vercel |
| Cron | Vercel Cron Jobs | Vercel |

---

## Arquitetura de Rede

```
USUÁRIO (Browser)
    │
    ├── HTTPS → Vercel (Next.js)
    │              ├── Pages/Components
    │              ├── API Routes (backend)
    │              ├── Cron Jobs
    │              └── Prisma → Neon PostgreSQL
    │
    ├── HTTPS → Evolution Go API (VPS)
    │              └── WhatsApp Web
    │
    ├── HTTPS → Groq API (Cloud)
    │              └── LLaMA 3.3-70B
    │
    └── HTTPS → Cloudinary (Upload)

NAIL DESIGNER (WhatsApp)
    │
    └── WhatsApp → Evolution Go → Webhook → Vercel API
```

---

## Variáveis de Ambiente (Requeridas)

| Variável | Onde Usada | Status |
|----------|-----------|--------|
| `DATABASE_URL` | Prisma | Configurada |
| `NEXTAUTH_SECRET` | JWT auth | Configurada (mas fallback hardcoded) |
| `UPSTASH_REDIS_REST_URL` | Rate limiting, cache | Configurada |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting, cache | Configurada |
| `GROQ_API_KEY` | IA Secretária | Configurada |
| `EVOLUTION_API_URL` | WhatsApp | Configurada (77.37.41.176:4000) |
| `EVOLUTION_API_KEY` | WhatsApp | Configurada |
| `CLOUDINARY_CLOUD_NAME` | Upload de fotos | Configurada |
| `CLOUDINARY_API_KEY` | Upload de fotos | Configurada |
| `CLOUDINARY_API_SECRET` | Upload de fotos | Configurada |

---

## Cron Jobs (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 12 * * *"
    },
    {
      "path": "/api/health",
      "schedule": "0 6 * * *"
    }
  ]
}
```

---

## Segurança (Headers - vercel.json)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

---

# ETAPA 9: MAPA DOS ACOPLOAMENTOS

## Acoplamento por Nível

### 🔴 ALTO ACOPLOAMENTO (mudar um quebra o outro)

| Par | Tipo de Acoplamento | Evidência |
|-----|---------------------|-----------|
| WhatsApp ↔ IA | Dados compartilhados | IA depende de `WhatsAppSession`, `WhatsAppMessage`; lê histórico; escreve resposta via `sendMessage` |
| WhatsApp ↔ Agendamentos | Ação direta | Agendamentos criam Revenue e enviam WhatsApp no mesmo handler |
| Clientes ↔ Agendamentos | Foreign key | `Appointment.clientId` → `Client.id`; sem Client não existe Agendamento |
| Service ↔ Agendamentos | Foreign key | `Appointment.serviceId` → `Service.id` |
| Auth ↔ Tudo | Interceptação | `authMiddleware.ts` intercepta TODAS as rotas autenticadas |
| Revenue ↔ Appointment | Criação acoplada | Revenue é criado DENTRO do handler de Appointment |
| PublicProfile ↔ Página Pública | Dados | Página Pública falha sem PublicProfile |
| Auth ↔ JWT | Implementação | `auth.ts` é importado em TODA rota autenticada; fallback hardcoded |

---

### 🟡 MÉDIO ACOPLOAMENTO (compartilham dados, mas com margem)

| Par | Tipo de Acoplamento | Evidência |
|-----|---------------------|-----------|
| Dashboard ↔ Clients, Services, Appointments, Revenue | Leitura múltipla | Dashboard carrega tudo em uma query gigante |
| Settings ↔ WhatsApp, IA | Configuração | Settings altera toggle de AI e conexão WhatsApp |
| Promoções ↔ Clientes | Leitura | Promoções carrega lista de clientes |
| Promoções ↔ WhatsApp | Envio | Links gerados usam wa.me |
| Bloqueio ↔ Slots | Leitura | Slots leem BlockedTime para excluir horários |
| Lembretes ↔ WhatsApp, Appointments | Envio | Lembretes leem Appointment e enviam via WhatsApp |
| Admin ↔ Tudo | Leitura/escrita | Admin altera planos, bloqueia users, vê dados |

---

### 🟢 BAIXO ACOPLOAMENTO (independentes)

| Módulo | Por que é baixo |
|--------|----------------|
| Fornecedores | Tabela isolada, CRUD simples, não afeta ninguém |
| Indicações | Tabela isolada, criada no registro, não afeta fluxos |
| Suppliers | Tabela isolada, sem relações |
| Partners | Rota pública, tabela isolada |

---

## Matriz de Acoplamento

```
           Auth  Client  Service  Appt  WhatsApp  IA  Revenue  Dashboard  Settings  Public
Auth         -     🔴       🔴      🔴      🔴      🔴     🔴        🔴         🔴       🟢
Client      🔴      -       🟢      🔴      🟡      🟢     🟡        🟡         🟢       🟡
Service     🔴     🟢        -      🔴      🟢      🟡     🟢        🟡         🟢       🟡
Appt        🔴     🔴       🔴       -      🔴      🟡     🔴        🟡         🟢       🟢
WhatsApp    🔴     🟡       🟢      🔴       -      🔴     🟢        🟢         🔴       🟡
IA          🔴     🟢       🟡      🟡      🔴       -     🟢        🟢         🔴       🟡
Revenue     🔴     🟡       🟢      🔴      🟢      🟢      -        🟡         🟢       🟢
Dashboard   🔴     🟡       🟡      🟡      🟢      🟢     🟡         -         🟢       🟢
Settings    🔴     🟢       🟢      🟢      🔴      🔴     🟢        🟢          -       🟢
Public      🟢     🟡       🟡      🟢      🟡      🟡     🟢        🟢         🟢        -
```

🔴 = Alto | 🟡 = Médio | 🟢 = Baixo

---

# ETAPA 10: MAPA DOS RISCOS

## Risco de Cascata de Falhas

### Cenário 1: WhatsApp Evolution API cai

```
Evolution API offline
  → WhatsApp conectado: true (stale cache)
  → Mensagens não chegam
  → IA não processa
  → Agendamentos online: notification falha
  → Lembretes não enviam
  → Confirmações não enviam
  → Usuário não sabe que tem agendamento
  → Perda de clientes
```

**Severidade:** 🔴 CRÍTICA
**Mitigação atual:** Nenhuma (não há fallback nem fila)

---

### Cenário 2: Neon PostgreSQL cai

```
Banco offline
  → TODAS as rotas falham (Prisma erro)
  → Login impossível
  → Dashboard branco
  → Agendamentos não criam
  → Webhook WhatsApp falha (não salva mensagem)
  → IA falha (não lê dados)
  → Cron reminders falha
  → Health check falha
  → Usuário vê tela de erro
```

**Severidade:** 🔴 CRÍTICA
**Mitigação atual:** Upstash Redis (cache de rate limiting apenas, não de dados)

---

### Cenário 3: Groq API cai

```
Groq offline
  → IA desabilitada (não responde)
  → Mensagens WhatsApp ficam sem resposta
  → Usuário não vê notificação de falha
  → Dedup funciona (evita loops)
  → Resto do sistema funciona normalmente
```

**Severidade:** 🟡 MÉDIA
**Mitigação atual:** Dedup previne loops

---

### Cenário 4: Cloudinary cai

```
Cloudinary offline
  → Upload de fotos falha
  → Upload de capa falha
  → Upload de imagem de serviço falha
  → Resto do sistema funciona
  → Usuário não consegue adicionar fotos
```

**Severidade:** 🟢 BAIXA
**Mitigação atual:** Upload bloqueado graceful

---

### Cenário 5: Vercel cai

```
Vercel offline
  → Sistema 100% inacessível
  → Crons não executam
  → Webhooks não chegam
  → WhatsApp continua conectado (Evolution VPS)
  → Mensagens se acumulam sem processar
```

**Severidade:** 🔴 CRÍTICA
**Mitigação atual:** Nenhuma

---

## Riscos de Segurança

| Risco | Severidade | Status |
|-------|-----------|--------|
| JWT secret hardcoded fallback | 🔴 CRÍTICA | Aberto |
| Webhook WhatsApp sem auth | 🔴 CRÍTICA | Aberto |
| `/api/partners` sem auth | 🔴 CRÍTICA | Aberto |
| `/api/invite` sem auth | 🟡 MÉDIO | Aberto |
| CEO bypass hardcoded | 🟡 MÉDIO | Aberto |
| Rate limiting não efetivo | 🟡 MÉDIO | Aberto |
| `NEXTAUTH_SECRET` em vez de `JWT_SECRET` | 🟡 MÉDIO | Aberto |

---

## Riscos de Performance

| Risco | Severidade | Evidência |
|-------|-----------|-----------|
| Dashboard carrega tudo em memória | 🔴 CRÍTICA | `findMany({})` sem filtro userId |
| N+1 queries em appointments | 🟡 MÉDIO | `findMany` + `include` sem paginação |
| Sem paginação em endpoints | 🟡 MÉDIO | Todos os `findMany` carregam tudo |
| Cache do Upstash não expira bem | 🟡 MÉDIO | `getMany` sem TTL |
| IA busca histórico completo | 🟡 MÉDIO | `findFirst` sem limite de mensagens |
| Imagens não usam CDN de thumbnails | 🟢 BAIXA | Cloudinary serve full size |

---

## Riscos de Negócio

| Risco | Severidade | Impacto |
|-------|-----------|---------|
| Checkout simulado | 🔴 CRÍTICA | Não gera receita real |
| Settings não salvam | 🔴 CRÍTICA | Usuário não consegue configurar |
| Plano não bloqueia features | 🔴 CRÍTICA | Free users usam tudo |
| Lembrete usa campo inexistente | 🟡 MÉDIO | `confirmationSentAt` nunca preenchido |
| AI nunca marca `aiHandled=true` | 🟡 MÉDIO | Não saberá quantos foram atendidos |
| Trial nunca expira | 🟡 MÉDIO | Usuários ficam para sempre no trial |
| Partner não calcula comissão | 🟡 MÉDIO | Partner system inútil |

---

## Matriz Risco vs Impacto

```
IMPACTO ↑
  ALTO  │  🟡 Trial    │  🔴 Checkout  │  🔴 Banco cai
        │  🟡 Settings  │  🔴 Auth      │  🔴 Vercel cai
        │  🡡 Planos    │  🔴 WhatsApp  │
  MEDIO │  🟢 Cloudinary│  🟡 Groq      │  🟡 Segurança
        │  🟢 Suppliers │  🟡 Performance│
  BAIXO │  🟢 Partners  │  🟢 Referrals │
        └──────────────┼───────────────┼───────────────
           BAIXA        │    MÉDIA      │    ALTA
                         PROBABILIDADE →
```
