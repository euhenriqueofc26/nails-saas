# MAPA DE IMPLEMENTAÇÃO — ClubNailsBrasil

**Data:** 27/07/2026
**Objetivo:** Guia oficial de desenvolvimento — COMO cada funcionalidade deve ser implementada, mantida e evoluída
**Status:** Documentação apenas, nenhuma alteração foi feita
**Baseado em:** Leitura completa de todos os arquivos do projeto

---

# PARTE 1: MAPA DE IMPLEMENTAÇÃO

Para CADA funcionalidade da plataforma:

---

## FUNCIONALIDADE 1: AUTENTICAÇÃO

### 1) Objetivo
Controlar acesso, sessões, permissões e isolamento multi-tenant de todos os usuários da plataforma.

### 2) Módulos que utiliza
- Prisma ORM (tabela User, Plan)
- JWT (biblioteca jsonwebtoken)
- bcryptjs (hash de senhas)
- Upstash Redis (revogação de tokens via `/src/lib/token-revocation.ts`)
- authMiddleware (proteção de rotas)
- planMiddleware (verificação de plano)

### 3) Arquivos participantes
- `src/lib/auth.ts` — Funções core: hashPassword, verifyPassword, generateToken, verifyToken, authenticateUser, generateSlug
- `src/lib/authMiddleware.ts` — authMiddleware, planMiddleware, AuthRequest
- `src/lib/token-revocation.ts` — Revogação de tokens no Redis
- `src/app/api/register/route.ts` — Registro de novos usuários (POST + GET)
- `src/app/api/auth/login/route.ts` — Login (POST)
- `src/app/api/auth/logout/route.ts` — Logout (POST)
- `src/app/api/auth/forgot/route.ts` — Esqueci a senha (POST + PUT)
- `src/app/entrar/page.tsx` — Tela de login (frontend)
- `src/app/page.tsx` — Landing page com formulário de login/registro
- `src/app/ref/[code]/page.tsx` — Página de referência (define cookie ref_code)
- `src/components/Providers.tsx` — AuthContext provider
- `src/app/dashboard/layout.tsx` — Sidebar que usa useAuth() para menu

### 4) Tabelas do banco
- `User` — Tabela principal (id, email, password, slug, planId, role, isBlocked, aiEnabled, refCode, referredBy, etc.)
- `Plan` — Planos vinculados ao User via planId
- `Referral` — Criação automática quando cookie ref_code existe no registro
- `PublicProfile` — Criado via upsert no registro (`/api/register`)

### 5) APIs externas
- Nenhuma. Tudo é feito internamente.

### 6) Funcionalidades que dependem dela
**TUDO no sistema depende de Autenticação.** Se quebrar:
- Nenhum usuário consegue fazer login
- Todas as rotas autenticadas retornam 401
- Dashboard fica inacessível
- Clientes, Serviços, Agendamentos não funcionam
- WhatsApp não conecta
- IA não processa
- Configurações não carregam
- Admin não funciona

### 7) Do que ela depende
- Prisma/Neon PostgreSQL (busca de User)
- JWT_SECRET (variável de ambiente)
- bcryptjs (comparação de senhas)
- Redis (revogação de tokens)

### 8) Fluxo completo

**Registro:**
```
Browser → POST /api/register {email, password, name, studioName, slug, whatsapp}
  → Valida campos obrigatórios
  → Verifica se email já existe no banco
  → Verifica se slug já existe no banco
  → Hash da senha: bcryptjs.hash(password, 12)
  → Busca plano "free" no banco (prisma.plan.findFirst)
  → Cria User com: {email, password: hash, name, studioName, slug, whatsapp, planId: freePlan.id}
  → Gera refCode aleatório e salva no User
  → Se cookie ref_code existe:
    → Busca User pelo refCode
    → Cria Referral {referrerId, referredUserId, status: "pending"}
  → Busca ou cria PublicProfile (upsert) para o slug
  → Gera JWT: jwt.sign({userId: user.id, email, planId, planSlug, role}, JWT_SECRET, {expiresIn: "7d"})
  → Retorna {token, user: {id, name, email, slug, studioName, planId, planSlug, role}}
Browser → Salva token no localStorage → Redireciona para /dashboard
```

**Login:**
```
Browser → POST /api/auth/login {email, password}
  → Rate limit: 10 req/15min por IP
  → Busca User por email com Plan incluído
  → bcryptjs.compare(password, user.password)
  → Se falha: 401
  → Verifica isBlocked === true: 403
  → Verifica subscriptionEndsAt: se expirou e não é CEO
  → Gera JWT
  → Retorna {token, user: {id, name, email, slug, ...}}
Browser → Salva token no localStorage → Redireciona para /dashboard
```

**Proteção de Rotas:**
```
Toda requisição autenticada →
  → Extrai Bearer token do header Authorization
  → jwt.verify(token, JWT_SECRET) ou fallback 'nails-saas-secret'
  → Se inválido: 401
  → Busca user no Redis revocation list
  → Se revogado: 401
  → Retorna {userId, email, planId, planSlug, role}
  → Se CEO_EMAIL (euhenriqueofc26@gmail.com): bypass completo
```

**Logout:**
```
Browser → POST /api/auth/logout
  → Extrai token do header
  → Adiciona token na revocation list do Redis (TTL 7 dias)
  → Retorna {success: true}
Browser → Remove token do localStorage → Redireciona para /
```

**Esqueci a Senha:**
```
Browser → POST /api/auth/forgot {email}
  → Rate limit: 3 req/hora
  → Busca User por email
  → Gera token aleatório (crypto.randomBytes)
  → Cria PasswordReset {email, token, expiresAt: +1h}
  → NÃO ENVIA EMAIL ← BUG CONHECIDO
  → Retorna {success: true, message: "Se o email existir..."}
```

### 9) Impacto de modificar
**Módulos a revisar antes:** TODOS — qualquer alteração em auth impacta todo o sistema.
**Arquivos impactados:**
- `src/lib/auth.ts` — Core (hash, token, verify)
- `src/lib/authMiddleware.ts` — Middleware
- `src/lib/token-revocation.ts` — Redis
- Todas as rotas `src/app/api/**/route.ts` que usam authMiddleware
- Todos os componentes que usam `useAuth()`

**Funcionalidades a testar:**
- Login, Registro, Logout
- Todas as rotas autenticadas
- Revogação de token
- CEO bypass
- Verificação de plano
- Expiração de assinatura

### 10) Sintomas de falha
- Usuários não conseguem fazer login (mensagem "Credenciais inválidas")
- Token expira antes de 7 dias
- CEO perde acesso admin
- Rotas retornam 401 mesmo com token válido
- Usuários bloqueados conseguem acessar
- Token revogado continua funcionando

### 11) Nível de risco
**CRÍTICO.** Qualquer alteração pode bloquear TODOS os usuários do sistema.

### 12) Evolução futura
- Migrar de JWT para session-based auth (NextAuth.js ou similar)
- Implementar refresh token (token de curta duração + refresh de longa duração)
- Implementar autenticação por e-mail/SMS OTP
- Adicionar 2FA para admin
- Remover fallback hardcoded do JWT_SECRET
- Remover CEO bypass hardcoded (usar variável de ambiente)
- Implementar rate limiting mais granular
- Implementar account lockout após N tentativas
- Adicionar auditoria de login (log de tentativas)
- Implementar SSO/OAuth (Google, GitHub)

---

## FUNCIONALIDADE 2: DASHBOARD

### 1) Objetivo
Exibir visão geral do negócio: agendamentos de hoje, receita mensal, clientes ativos, analytics, e ações rápidas.

### 2) Módulos que utiliza
- Autenticação (authMiddleware)
- Prisma ORM ( Appointment, Client, Revenue, Service)
- Referral (/api/referrals/me)
- Avatar upload (/api/user/avatar)

### 3) Arquivos participantes
- `src/app/dashboard/page.tsx` — Página principal do dashboard
- `src/app/api/dashboard/route.ts` — API que retorna dados consolidados
- `src/app/api/dashboard/daily/route.ts` — Dados diários
- `src/components/DashboardCards.tsx` — Cards de estatísticas
- `src/components/QuickActions.tsx` — Ações rápidas
- `src/app/api/referrals/me/route.ts` — Dados de indicação
- `src/app/api/user/avatar/route.ts` — Upload de avatar

### 4) Tabelas do banco
- `Appointment` — Agendamentos (findMany, aggregate)
- `Client` — Clientes (com appointments incluídos)
- `Revenue` — Receitas
- `Service` — Serviços
- `User` — Dados do usuário logado

### 5) APIs externas
- Nenhuma

### 6) Funcionalidades que dependem dela
- Nenhuma funcionalidade depende do Dashboard em si (é ponto de entrada)
- Mas o Dashboard depende de TODAS as outras funcionalidades

### 7) Do que ela depende
- Autenticação (userId)
- Tabelas Appointment, Client, Revenue, Service (dados)

### 8) Fluxo completo
```
Dashboard carrega →
  → useAuth() obtém token
  → GET /api/dashboard (headers: Authorization Bearer token)
    → authMiddleware valida JWT
    → prisma.appointment.findMany() — TODOS os agendamentos do user
    → prisma.client.findMany({include: {appointments: true}}) — TODOS os clientes com agendamentos
    → Calcula em JavaScript (não no banco):
      - todayAppointments
      - monthlyRevenue (soma dos completed do mês)
      - totalClients
      - pendingAppointments
      - topServices (count de serviços mais usados)
      - busiestDays (count por dia da semana)
      - busiestHours (count por hora)
      - frequentClients (top 5)
      - cancellationRate
      - recurringClients
      - avgRating
    → Retorna objeto consolidado
  → Dashboard renderiza cards e listas
  → Polling: refetch a cada 5 segundos (setInterval)
```

### 9) Impacto de modificar
**Módulos a revisar:** Clientes, Serviços, Agendamentos, Financeiro (dependem das mesmas tabelas)
**Arquivos impactados:** `src/app/dashboard/page.tsx`, `src/app/api/dashboard/route.ts`
**Funcionalidades a testar:** Dashboard, Relatórios financeiros, Analytics

### 10) Sintomas de falha
- Dashboard mostra zeros ou dados incorretos
- Cards carregam lentamente
- Dashboard trava (muitos dados em memória)
- Polling excessivo causa lentidão

### 11) Nível de risco
**MÉDIO.** É apenas leitura, não altera dados. Mas tem problema de performance.

### 12) Evolução futura
- Mover cálculos de analytics para o banco (aggregations)
- Implementar paginação e lazy loading
- Reduzir polling (usar SWR/React Query com staleTime)
- Cache de dados no banco (materialized views)
- Implementar filtros por período
- Adicionar exportação de relatórios (PDF/CSV)

---

## FUNCIONALIDADE 3: CLIENTES

### 1) Objetivo
Gerenciar cadastro de clientes: criar, listar, buscar, editar, excluir, ver perfil com fotos e histórico de agendamentos.

### 2) Módulos que utiliza
- Autenticação (authMiddleware)
- Prisma ORM (Client, ClientPhoto, Appointment)
- Cloudinary (upload de fotos)
- Plan limits (maxClients)

### 3) Arquivos participantes
- `src/components/ClientManager.tsx` — Componente principal (CRUD + busca)
- `src/components/ClientProfileModal.tsx` — Modal de perfil com fotos
- `src/components/AddClientModal.tsx` — Modal de criação
- `src/app/dashboard/clients/page.tsx` — Página que renderiza ClientManager
- `src/app/api/clients/route.ts` — GET (listar/buscar) + POST (criar)
- `src/app/api/clients/[id]/route.ts` — GET (perfil) + PUT (atualizar) + DELETE (excluir)
- `src/app/api/clients/[id]/photos/route.ts` — GET + POST (upload) + DELETE (excluir foto)
- `src/app/api/clients/[id]/appointments/route.ts` — GET (histórico)
- `src/components/ImageUpload.tsx` — Componente de upload
- `src/app/api/upload/route.ts` — Upload para Cloudinary

### 4) Tabelas do banco
- `Client` — Cadastro do cliente
- `ClientPhoto` — Fotos vinculadas ao cliente
- `Appointment` — Histórico de agendamentos
- `Service` — Dados do serviço no appointment
- `Plan` — Verificação de limite

### 5) APIs externas
- Cloudinary — Upload de fotos (via `/api/upload` ou direto)

### 6) Funcionalidades que dependem dela
- **Agendamentos** — Precisam de clientId
- **Página Pública** — Cria clientes automaticamente no booking
- **IA** — Usa dados do cliente para contexto
- **Promoções** — Usa lista de clientes para enviar
- **Dashboard** — Contagem de clientes
- **Financeiro** — Receitas vinculadas a appointments de clientes
- **Lembretes** — Usa whatsapp do cliente para enviar

### 7) Do que ela depende
- Autenticação (userId)
- Cloudinary (upload de fotos)
- Prisma/Neon (CRUD)

### 8) Fluxo completo
```
Navegar para aba "Clientes" →
  → GET /api/clients
    → authMiddleware valida JWT
    → prisma.client.findMany({where: {userId}, orderBy: {createdAt: desc}})
    → Retorna lista
  → Renderiza lista com busca por nome/whatsapp

Criar cliente:
  → Clica "Novo Cliente"
  → Preenche: nome, WhatsApp, observações
  → POST /api/clients {name, whatsapp, notes}
    → Valida campos obrigatórios
    → Verifica limite do plano (maxClients)
    → prisma.client.create({data: {userId, name, whatsapp, notes}})
    → Retorna novo cliente
  → Atualiza lista

Editar cliente:
  → Clica no card → abre modal de perfil
  → PUT /api/clients/[id] {name?, whatsapp?, notes?}
    → prisma.client.update({where: {id}, data: {...}})
    → Retorna cliente atualizado

Upload de foto:
  → Clica "Adicionar foto" → seleciona arquivo
  → POST /api/clients/[id]/photos (FormData com arquivo)
    → Upload para Cloudinary via fetch
    → prisma.clientPhoto.create({data: {clientId, url}})
    → Retorna nova foto

Excluir foto:
  → DELETE /api/clients/[id]/photos?photoId=xxx
    → Extrai publicId da URL (split)
    → Exclui do Cloudinary
    → prisma.clientPhoto.delete({where: {id}})

Excluir cliente:
  → DELETE /api/clients/[id]
    → prisma.client.delete({where: {id}})
    → CASCADE: ClientPhoto, Appointment ficam órfãos ← PROBLEMA
```

### 9) Impacto de modificar
**Módulos a revisar:** Agendamentos, Página Pública, IA, Promoções, Dashboard, Financeiro, Lembretes
**Arquivos impactados:** Qualquer arquivo que usa Client ou ClientPhoto
**Funcionalidades a testar:** Agendamento manual, Agendamento online, IA, Promoções, Dashboard

### 10) Sintomas de falha
- "Nenhum cliente encontrado"
- Upload de foto falha
- Lista de clientes carrega lentamente
- Excluir cliente quebra agendamentos existentes (FK violation)
- Limite de plano não é verificado corretamente

### 11) Nível de risco
**ALTO.** Clientes são referenciados por muitos módulos. Exclusão não cascadeia corretamente.

### 12) Evolução futura
- Implementar soft delete (campo isDeleted)
- Adicionar verificação de duplicatas (mesmo nome+whatsapp)
- Implementar paginação
- Adicionar importação em massa (CSV)
- Adicionar campos personalizados
- Integrar com WhatsApp (buscar foto do perfil)
- Implementar tags/categorias de clientes

---

## FUNCIONALIDADE 4: SERVIÇOS

### 1) Objetivo
Gerenciar catálogo de serviços oferecidos: criar, listar, editar, excluir, ativar/desativar.

### 2) Módulos que utiliza
- Autenticação (authMiddleware)
- Prisma ORM (Service)
- Cloudinary (imagem do serviço)
- Plan limits (maxServices)

### 3) Arquivos participantes
- `src/components/ServiceManager.tsx` — Componente principal
- `src/app/dashboard/services/page.tsx` — Página com ServiceManager
- `src/app/api/services/route.ts` — GET + POST
- `src/app/api/services/[id]/route.ts` — GET + PUT + DELETE
- `src/components/ImageUpload.tsx` — Upload de imagem
- `src/app/api/upload/route.ts` — Upload para Cloudinary

### 4) Tabelas do banco
- `Service` — Cadastro do serviço
- `Plan` — Verificação de limite (maxServices)

### 5) APIs externas
- Cloudinary (upload de imagem)

### 6) Funcionalidades que dependem dela
- **Agendamentos** — Precisam de serviceId
- **Página Pública** — Lista serviços ativos
- **IA** — Usa lista de serviços no system prompt
- **Dashboard** — Analytics de serviços mais usados
- **Financeiro** — Receitas vinculadas a serviços

### 7) Do que ela depende
- Autenticação (userId)
- Cloudinary (upload)
- Prisma/Neon (CRUD)

### 8) Fluxo completo
```
Navegar para aba "Serviços" →
  → GET /api/services
    → authMiddleware valida JWT
    → prisma.service.findMany({where: {userId}, orderBy: {createdAt: desc}})
    → Retorna lista

Criar serviço:
  → POST /api/services {name, price, duration?, description?, image?}
    → Valida campos obrigatórios
    → Verifica limite do plano (maxServices)
    → Se image: upload para Cloudinary
    → prisma.service.create({data: {userId, name, price, duration: 60, description, image}})
    → Retorna novo serviço
  → Na página de onboarding: cria serviço avança para step 3

Ativar/Desativar:
  → PUT /api/services/[id] {isActive: !current}
    → prisma.service.update({where: {id}, data: {isActive}})

Excluir:
  → DELETE /api/services/[id]
    → prisma.service.delete({where: {id}})
    → NÃO verifica se há agendamentos vinculados ← PROBLEMA
```

### 9) Impacto de modificar
**Módulos a revisar:** Agendamentos, Página Pública, IA, Dashboard
**Arquivos impactados:** ServiceManager, Service pages, PublicBooking, groq-ai.ts
**Funcionalidades a testar:** Agendamento online, IA responses, Página pública

### 10) Sintomas de falha
- Serviço não aparece na página pública
- Agendamento falha (serviceId inválido)
- IA não lista serviços corretamente
- Imagem não carrega

### 11) Nível de risco
**MÉDIO.** CRUD isolado, mas referenciado por vários módulos.

### 12) Evolução futura
- Adicionar categorias de serviços
- Adicionar duração variável
- Implementar pacotes/promoções de serviços
- Integrar com agenda (bloquear horários por serviço)
- Adicionar fotos múltiplas por serviço

---

## FUNCIONALIDADE 5: AGENDAMENTOS

### 1) Objetivo
Criar, gerenciar e acompanhar agendamentos: criação manual, status, cancelamento, confirmação automática.

### 2) Módulos que utiliza
- Autenticação (authMiddleware)
- Prisma ORM (Appointment, Client, Service, BlockedTime, WhatsAppSession, WhatsAppMessage)
- WhatsApp (confirmação automática)
- Plan limits (maxAppointments)

### 3) Arquivos participantes
- `src/components/WeeklyCalendar.tsx` — Calendário semanal
- `src/components/BookingModal.tsx` — Modal de criação
- `src/components/AppointmentCard.tsx` — Card individual
- `src/components/CalendarView.tsx` — Visualização alternativa
- `src/app/dashboard/appointments/page.tsx` — Página principal
- `src/app/api/appointments/route.ts` — GET + POST
- `src/app/api/appointments/[id]/route.ts` — GET + PUT + DELETE
- `src/lib/evolution-api.ts` — Envio de confirmação

### 4) Tabelas do banco
- `Appointment` — Agendamento principal
- `Client` — Cliente vinculado
- `Service` — Serviço vinculado
- `BlockedTime` — Horários bloqueados (verificação de conflito)
- `WhatsAppSession` — Para envio de confirmação
- `WhatsAppMessage` — Registro da mensagem enviada
- `Revenue` — Criado automaticamente ao concluir

### 5) APIs externas
- Evolution API (envio de confirmação WhatsApp)

### 6) Funcionalidades que dependem dela
- **Dashboard** — Lista de agendamentos e estatísticas
- **Financeiro** — Receitas derivadas de agendamentos concluídos
- **Lembretes** — Busca agendamentos para enviar lembretes
- **IA** — Cria agendamentos automaticamente
- **Página Pública** — Cria agendamentos online

### 7) Do que ela depende
- Autenticação (userId)
- Clientes (clientId)
- Serviços (serviceId)
- BlockedTime (verificação de conflito)
- WhatsApp (confirmação)
- Prisma/Neon (CRUD)

### 8) Fluxo completo
```
Criar agendamento manual:
  → Selecionar data no calendário → Clica em horário disponível
  → Modal abre → Seleciona cliente + serviço
  → POST /api/appointments {clientId, serviceId, date, time}
    → authMiddleware valida JWT
    → Verifica se cliente e serviço pertencem ao user
    → Verifica conflito de horário ( BlockedTime + Appointment existente)
    → Verifica limite do plano (maxAppointments)
    → Busca Service para obter preço
    → prisma.appointment.create({
        userId, clientId, serviceId, date, time,
        startTime: time, endTime: calculado,
        price: service.price, status: "pending"
      })
    → Busca WhatsAppSession do user
    → Se WhatsApp conectado:
      → evolutionApi.sendTextMessage(token, phone, "Agendamento confirmado...")
      → prisma.whatsAppMessage.create({sessionId, direction: "OUTBOUND", ...})
      → prisma.appointment.update({confirmationSent: true, confirmationSentAt: now})
    → Retorna appointment

Criar agendamento público (booking online):
  → POST /api/public/[slug]/book {serviceId, date, time, clientName, clientWhatsapp}
    → Busca User por slug
    → Busca Service
    → Verifica conflito (appointments + blockedTimes)
    → Busca ou cria Client (se não existe pelo whatsapp)
    → prisma.appointment.create({status: "confirmed"})
    → prisma.revenue.create({appointmentId, amount: price})
    → Envia WhatsApp para nail: "Novo agendamento online..."
    → Retorna {success, appointmentId}

Atualizar status:
  → PUT /api/appointments/[id] {status: "completed"}
    → prisma.appointment.update({status})
    → Se status = "completed":
      → prisma.revenue.create({userId, appointmentId, amount, description, date})
    → Se status mudou para "confirmed":
      → Envia WhatsApp de confirmação
```

### 9) Impacto de modificar
**Módulos a revisar:** Dashboard, Financeiro, Lembretes, IA, Página Pública
**Arquivos impactados:** Todas as rotas de appointments, WeeklyCalendar, BookingModal
**Funcionalidades a testar:** Agendamento manual, Online, Confirmação, Lembretes, Financeiro

### 10) Sintomas de falha
- Agendamento não cria (erro de validação)
- Horário duplicado (dois agendamentos no mesmo horário)
- Confirmação WhatsApp não envia
- Revenue não cria ao concluir
- Calendário mostra dados incorretos
- Lembrete não envia (appointment não encontrado)

### 11) Nível de risco
**CRÍTICO.** É a funcionalidade central do sistema. Qualquer falha afeta diretamente o negócio.

### 12) Evolução futura
- Implementar recorrência (agendamentos semanais)
- Adicionar lista de espera
- Implementar cancelamento pelo cliente
- Adicionar horário de almoço automático
- Implementar buffer entre agendamentos
- Adicionar notificação por e-mail
- Implementar check-in/check-out

---

## FUNCIONALIDADE 6: BLOQUEIO DE HORÁRIOS

### 1) Objetivo
Permitir que a nail designer bloqueie horários específicos (férias, feriados, pausas).

### 2) Módulos que utiliza
- Autenticação (authMiddleware)
- Prisma ORM (BlockedTime)

### 3) Arquivos participantes
- `src/components/BlockedTimeManager.tsx` — CRUD de bloqueios
- `src/app/api/blocked-times/route.ts` — GET + POST
- `src/app/api/blocked-times/[id]/route.ts` — DELETE
- `src/app/api/public/[slug]/slots/route.ts` — Usa BlockedTime para calcular slots

### 4) Tabelas do banco
- `BlockedTime` — Bloqueios

### 5) APIs externas
- Nenhuma

### 6) Funcionalidades que dependem dela
- **Agendamentos** — Verificação de conflito
- **Página Pública** — Slots disponíveis excluem bloqueios
- **Agendamento Online** — Não permite agendar em horário bloqueado

### 7) Do que ela depende
- Autenticação (userId)
- Prisma/Neon (CRUD)

### 8) Fluxo completo
```
Criar bloqueio:
  → POST /api/blocked-times {date, startTime, endTime, reason?}
    → authMiddleware valida JWT
    → prisma.blockedTime.create({userId, date, startTime, endTime, reason})

Slots disponíveis (página pública):
  → GET /api/public/[slug]/slots?date=2026-07-28&dayOfWeek=2&duration=60
    → Busca blockedTimes do user para a data
    → Busca appointments existentes para a data
    → Gera slots de 30 em 30 minutos (09:00-19:00)
    → Exclui slots que conflitam com bloqueios
    → Exclui slots que conflitam com appointments
    → Retorna slots disponíveis

Excluir bloqueio:
  → DELETE /api/blocked-times/[id]
    → prisma.blockedTime.delete({where: {id}})
```

### 9) Impacto de modificar
**Módulos a revisar:** Agendamentos, Página Pública, Slots
**Funcionalidades a testar:** Agendamento manual, Booking online, Slots

### 10) Sintomas de falha
- Horário bloqueado ainda aparece disponível
- Bloqueio não salva
- Slots mostram horários que conflitam

### 11) Nível de risco
**BAIXO.** CRUD isolado, sem relações complexas.

### 12) Evolução futura
- Bloqueios recorrentes (toda segunda, etc.)
- Bloqueios por período (férias de 01/08 a 15/08)
- Integração com Google Calendar
- Bloqueios automáticos por feriados nacionais

---

## FUNCIONALIDADE 7: FINANCEIRO

### 1) Objetivo
Controle de receitas (automáticas de agendamentos + manuais) e despesas.

### 2) Módulos que utiliza
- Autenticação (authMiddleware)
- Prisma ORM (Revenue, Expense, Appointment, User)
- Plan limits (hasFinancial)

### 3) Arquivos participantes
- `src/components/FinancialDashboard.tsx` — Dashboard financeiro
- `src/components/ExpenseForm.tsx` — Formulário de despesas
- `src/app/dashboard/financial/page.tsx` — Página principal
- `src/app/api/financial/route.ts` — GET + POST
- `src/app/api/financial/reports/route.ts` — GET (relatórios)

### 4) Tabelas do banco
- `Revenue` — Receitas (criadas automaticamente + manuais)
- `Expense` — Despesas (manuais)
- `Appointment` — Fonte de receitas automáticas
- `User` — Verificação de plano

### 5) APIs externas
- Nenhuma

### 6) Funcionalidades que dependem dela
- **Dashboard** — Faturamento mensal
- **Relatórios** — Análise financeira

### 7) Do que ela depende
- Autenticação (userId)
- Agendamentos (fonte de receitas)
- Prisma/Neon (CRUD)

### 8) Fluxo completo
```
Receita automática (ao concluir agendamento):
  → PUT /api/appointments/[id] {status: "completed"}
    → prisma.revenue.create({
        userId, appointmentId: appointment.id,
        amount: appointment.price,
        description: "Agendamento - [serviceName] - [clientName]",
        date: appointment.date
      })

Receita manual:
  → POST /api/financial {amount, description, date, type: "revenue"}
    → authMiddleware valida JWT
    → Verifica hasFinancial do plano
    → prisma.revenue.create({userId, amount, description, date})

Despesa:
  → POST /api/financial {amount, description, category, date, type: "expense"}
    → prisma.expense.create({userId, amount, description, category, date})

Relatório:
  → GET /api/financial/reports?month=7&year=2026
    → Busca appointments do mês
    → Busca revenues manuais
    → Busca expenses
    → Retorna dados consolidados
```

### 9) Impacto de modificar
**Módulos a revisar:** Dashboard, Agendamentos
**Funcionalidades a testar:** Dashboard, Agendamento (criação de Revenue)

### 10) Sintomas de falha
- Faturamento mostra zeros
- Receitas duplicadas
- Despesas não salvam
- Relatório mostra dados incorretos (anual ignora receitas manuais)

### 11) Nível de risco
**MÉDIO.** CRUD relativamente isolado, mas com impacto visual.

### 12) Evolução futura
- Implementar exportação CSV/PDF
- Adicionar gráficos de tendência
- Implementar categorias de receita
- Adicionar metas financeiras
- Integrar com contabilidade
- Implementar DRE simplificado

---

## FUNCIONALIDADE 8: PÁGINA PÚBLICA

### 1) Objetivo
Exibir página pública do estúdio para que clientes finais possam ver serviços, perfil e agendar online.

### 2) Módulos que utiliza
- Prisma ORM (User, PublicProfile, Service, Appointment, BlockedTime, Plan)
- WhatsApp (notificação)

### 3) Arquivos participantes
- `src/app/[slug]/page.tsx` — Página pública (Server Component)
- `src/app/[slug]/PublicBookingClient.tsx` — Componente client-side
- `src/app/[slug]/BookingModal.tsx` — Modal de agendamento
- `src/components/public/HeroSection.tsx` — Hero
- `src/components/public/AboutSection.tsx` — Sobre
- `src/components/public/ServicesSection.tsx` — Serviços
- `src/components/public/ReviewsSection.tsx` — Avaliações
- `src/components/public/GallerySection.tsx` — Galeria
- `src/components/public/ClientArea.tsx` — Área do cliente
- `src/components/public/Footer.tsx` — Rodapé
- `src/components/public/WhatsAppFloatButton.tsx` — Botão flutuante
- `src/app/api/public/[slug]/route.ts` — GET (dados do estúdio)
- `src/app/api/public/[slug]/slots/route.ts` — GET (slots disponíveis)
- `src/app/api/public/[slug]/book/route.ts` — POST (agendar)
- `src/app/api/public/[slug]/reviews/route.ts` — GET + POST (avaliações)
- `src/app/api/public/[slug]/client-login/route.ts` — POST (login do cliente)
- `src/app/api/public/[slug]/appointments-by-phone/route.ts` — GET (agendamentos por telefone)
- `src/app/api/public/[slug]/client-appointments/route.ts` — GET (agendamentos do cliente)

### 4) Tabelas do banco
- `User` — Dados do estúdio
- `PublicProfile` — Perfil público
- `Service` — Serviços ativos
- `Appointment` — Agendamentos existentes (verificação de conflito + avaliações)
- `BlockedTime` — Bloqueios (cálculo de slots)
- `Plan` — Verificação de hasPublicPage
- `Client` — Criação automática no booking

### 5) APIs externas
- Nenhuma (tudo interno)

### 6) Funcionalidades que dependem dela
- **Agendamento Online** — É a interface do booking
- **Reviews** — Avaliações são públicas

### 7) Do que ela depende
- PublicProfile (deve existir e estar ativo)
- Serviços (pelo menos um ativo)
- Plan hasPublicPage (deve ser true)
- WhatsApp (para notificação ao nail)

### 8) Fluxo completo
```
Acessar /[slug] (ex: /studio-nails) →
  → src/app/[slug]/page.tsx (Server Component)
    → prisma.user.findUnique({where: {slug}, include: {Plan, PublicProfile}})
    → Se não existe: notFound()
    → Se plano não tem hasPublicPage: notFound()
    → Se PublicProfile.isActive = false: notFound()
    → prisma.service.findMany({where: {userId, isActive: true}})
    → Passa dados para PublicBookingClient

PublicBookingClient renderiza:
  → HeroSection (nome, capa)
  → AboutSection (bio, endereço, horários)
  → ServicesSection (lista de serviços)
  → ReviewsSection (avaliações)
  → GallerySection (galeria — HARDCODED, não dinâmica)
  → ClientArea (login do cliente)
  → WhatsAppFloatButton
  → Footer

Booking (modal):
  → Seleciona serviço
  → GET /api/public/[slug]/slots?date=...&duration=...
    → Calcula slots disponíveis
  → Seleciona horário
  → Preenche: nome, WhatsApp
  → POST /api/public/[slug]/book
    → Cria Client se não existe
    → Cria Appointment
    → Cria Revenue
    → Envia WhatsApp para nail
  → Abre WhatsApp com mensagem pré-preenchida
```

### 9) Impacto de modificar
**Módulos a revisar:** Clientes, Serviços, Agendamentos, WhatsApp, Bloqueio de Horários
**Funcionalidades a testar:** Booking online, Slots, Reviews, Client Area

### 10) Sintomas de falha
- Página 404 (slug inválido ou plano sem hasPublicPage)
- Serviços não aparecem
- Slots mostram horários indisponíveis
- Booking falha (erro ao criar)
- WhatsApp não notifica

### 11) Nível de risco
**ALTO.** É a face pública do negócio. Qualquer falha afeta diretamente a receita.

### 12) Evolução futura
- Implementar galeria dinâmica (fotos do nail)
- Adicionar mapa/google maps
- Implementar chat ao vivo
- Adicionar seção de depoimentos
- Implementar SEO otimizado (meta tags)
- Adicionar analytics de conversão
- Implementar A/B testing

---

## FUNCIONALIDADE 9: AGENDAMENTO ONLINE

### 1) Objetivo
Permitir que clientes agendem sem login, via link público do estúdio.

### 2) Módulos que utiliza
- (Integrado à Página Pública — vê FUNCIONALIDADE 8)

### 3) Arquivos participantes
- `src/app/[slug]/BookingModal.tsx` — Modal de agendamento
- `src/app/api/public/[slug]/book/route.ts` — POST (criar booking)
- `src/app/api/public/[slug]/slots/route.ts` — GET (slots disponíveis)
- `src/lib/evolution-api.ts` — Notificação WhatsApp

### 4) Tabelas do banco
- `Client` — Criação automática
- `Appointment` — Criação do agendamento
- `Revenue` — Criação automática
- `Service` — Dados do serviço
- `User` — Dados do estúdio
- `WhatsAppSession` — Para notificação
- `BlockedTime` — Verificação de conflito

### 5) APIs externas
- Evolution API (notificação WhatsApp)

### 6) Funcionalidades que dependem dela
- Página Pública (é a funcionalidade de booking)

### 7) Do que ela depende
- Página Pública (dados do estúdio)
- Serviços (pelo menos um ativo)
- WhatsApp (notificação)
- Slots disponíveis

### 8) Fluxo completo
```
(vê fluxo de Booking na FUNCIONALIDADE 8)
```

### 9) Impacto de modificar
**Módulos a revisar:** Página Pública, Clientes, Agendamentos, WhatsApp
**Funcionalidades a testar:** Booking online completo

### 10) Sintomas de falha
- Booking não cria
- Cliente não recebe confirmação
- Nail não recebe notificação
- Horário fica duplicado

### 11) Nível de risco
**ALTO.** Funcionalidade de receita direta.

### 12) Evolução futura
- Implementar pagamento antecipado
- Adicionar cancelamento pelo cliente
- Implementar reagendamento
- Adicionar lista de espera
- Enviar confirmação por e-mail também

---

## FUNCIONALIDADE 10: WHATSAPP AUTOMATIZADO

### 1) Objetivo
Gerenciar conexão WhatsApp via Evolution Go API: conectar, enviar mensagens, receber mensagens, manter sessão ativa.

### 2) Módulos que utiliza
- Autenticação (authMiddleware)
- Prisma ORM (WhatsAppSession, WhatsAppMessage)
- Evolution Go API (VPS 77.37.41.176:4000)
- Plan limits (WHATSAPP_PLAN_LIMIT = "premium")

### 3) Arquivos participantes
- `src/components/WhatsAppConnect.tsx` — QR Code e status
- `src/components/WhatsAppButton.tsx` — Botão de envio
- `src/lib/evolution-api.ts` — Wrapper da Evolution API
- `src/app/api/whatsapp/connect/route.ts` — POST (conectar)
- `src/app/api/whatsapp/disconnect/route.ts` — POST (desconectar)
- `src/app/api/whatsapp/send/route.ts` — POST (enviar mensagem)
- `src/app/api/whatsapp/status/route.ts` — GET (status)
- `src/app/api/whatsapp/send-reminder/route.ts` — POST (enviar lembrete)
- `src/app/api/whatsapp/send-ai-message/route.ts` — POST (enviar via IA)
- `src/app/api/whatsapp/send-invitation/route.ts` — POST (enviar convite)
- `src/app/api/whatsapp/send-promotion/route.ts` — POST (enviar promoção)
- `src/app/api/whatsapp/sync-history/route.ts` — POST (sincronizar histórico)
- `src/app/api/webhooks/evolution/incoming/route.ts` — POST (webhook de mensagens)
- `src/app/api/webhooks/evolution/connection-update/route.ts` — POST (webhook de status)

### 4) Tabelas do banco
- `WhatsAppSession` — Sessão conectada
- `WhatsAppMessage` — Mensagens enviadas/recebidas
- `User` — Verificação de plano

### 5) APIs externas
- Evolution Go API (VPS 77.37.41.176:4000)

### 6) Funcionalidades que dependem dela
- **IA Secretária** — Envia respostas via WhatsApp
- **Lembretes** — Envia lembretes via WhatsApp
- **Confirmações** — Envia confirmação de agendamento
- **Agendamento Online** — Notifica nail de novo booking
- **Promoções** — Envia promoções (via wa.me links)
- **Página Pública** — Notificação de booking

### 7) Do que ela depende
- Autenticação (userId)
- Evolution Go API (VPS externa)
- Prisma/Neon (CRUD)

### 8) Fluxo completo
```
Conectar WhatsApp:
  → Clica "Conectar" no WhatsAppConnect
  → POST /api/whatsapp/connect
    → Verifica plano (premium only)
    → Busca ou cria WhatsAppSession
    → evolutionApi.createInstance(instanceName, token, webhookUrl)
    → evolutionApi.connectInstance(instanceName, webhookUrl)
    → Retorna {status: "INITIALIZING"}

Receber QR Code:
  → Evolution envia webhook POST /api/webhooks/evolution/incoming
    → event = "QRCode"
    → Busca session por instanceId
    → Salva qrCode (base64) e status INITIALIZING
    → WhatsAppConnect faz polling a cada 3s para verificar status

WhatsApp conecta:
  → Evolution envia webhook com event = "Connected"
    → Atualiza session para CONNECTED
    → Extrai phoneNumber do JID

Enviar mensagem:
  → POST /api/whatsapp/send {phone, message}
    → evolutionApi.sendTextMessage(token, formattedPhone, message)
    → Registra WhatsAppMessage (direction: OUTBOUND)

Receber mensagem:
  → Evolution envia webhook com event = "messages.upsert"
    → Busca session por instanceName
    → Verifica dedup (10s)
    → Salva WhatsAppMessage (direction: INBOUND)
    → Se user.aiEnabled:
      → processIncomingMessage() do groq-ai.ts
      → Groq API processa e gera resposta
      → evolutionApi.sendTextMessage(resposta)
      → Marca aiProcessed = true

Reconexão automática:
  → Cron /api/cron/whatsapp-health (3h BRT)
    → Busca sessions CONNECTED
    → Para cada: verifica estado real via listAllInstancesWithState
    → Se não está "open": tenta reconectar (até 3 tentativas)
    → Se falha: marca DISCONNECTED
```

### 9) Impacto de modificar
**Módulos a revisar:** IA, Lembretes, Confirmações, Agendamentos, Página Pública
**Arquivos impactados:** evolution-api.ts, todas as rotas de WhatsApp, webhook
**Funcionalidades a testar:** Conexão, Envio, Recebimento, IA, Lembretes

### 10) Sintomas de falha
- QR Code não aparece
- WhatsApp não conecta
- Mensagens não enviam
- Mensagens não chegam
- IA não responde
- Lembretes não enviam
- Sessão cai e não reconecta

### 11) Nível de risco
**CRÍTICO.** WhatsApp é canal principal de comunicação. Falha afeta todos os módulos que dependem dele.

### 12) Evolução futura
- Implementar fila de mensagens (Redis/Upstash Queue)
- Adicionar retry automático com backoff
- Implementar fallback (se WhatsApp falha, envia e-mail)
- Adicionar métricas de entrega
- Implementar webhook signature verification
- Adicionar suporte a múltiplos números
- Implementar template messages (WhatsApp Business API)

---

## FUNCIONALIDADE 11: IA SECRETÁRIA

### 1) Objetivo
Processar mensagens WhatsApp recebidas e gerar respostas automáticas usando IA (Groq LLaMA 3.3-70B).

### 2) Módulos que utiliza
- Groq API (LLaMA 3.3-70B-versatile)
- WhatsApp (envio de resposta via Evolution API)
- Prisma ORM (WhatsAppMessage, User, Service, PublicProfile)
- Autenticação (toggle aiEnabled)

### 3) Arquivos participantes
- `src/components/AISecretary.tsx` — Toggle de ativação
- `src/lib/groq-ai.ts` — Core da IA: processIncomingMessage
- `src/app/api/user/ai-toggle/route.ts` — POST (ativar/desativar)
- `src/app/api/webhooks/evolution/incoming/route.ts` — Chama processIncomingMessage
- `src/app/dashboard/settings/page.tsx` — Toggle na configuração

### 4) Tabelas do banco
- `WhatsAppMessage` — Histórico de conversa
- `User` — aiEnabled flag
- `Service` — Lista de serviços (system prompt)
- `PublicProfile` — Perfil do estúdio (system prompt)
- `WhatsAppSession` — Para enviar resposta

### 5) APIs externas
- Groq API (https://api.groq.com/openai/v1/chat/completions)
- Evolution API (envio de resposta)

### 6) Funcionalidades que dependem dela
- Nenhuma funcionalidade depende da IA (é autônoma)

### 7) Do que ela depende
- WhatsApp (receber mensagens e enviar respostas)
- Groq API (processamento)
- Serviços (para o system prompt)
- PublicProfile (para o system prompt)

### 8) Fluxo completo
```
Mensagem WhatsApp chega →
  → Webhook /api/webhooks/evolution/incoming
    → Salva WhatsAppMessage (INBOUND)
    → Se user.aiEnabled:
      → processIncomingMessage(sessionId, from, content, instanceName)
        → Busca sessão WhatsApp
        → Busca user com serviços e perfil
        → Verifica se é premium (só premium usa IA)
        → Busca histórico de conversa (5 mensagens recentes)
        → Monta system_prompt com:
          - Nome do estúdio
          - Serviços oferecidos (nome, preço, duração)
          - Perfil (bio, endereço, horários)
          - Instruções de comportamento
        → Monta messages array:
          - system: prompt
          - history: mensagens anteriores
          - user: mensagem atual (truncada em 500 chars)
        → Groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.7,
            max_tokens: 300
          })
        → Extrai resposta
        → evolutionApi.sendTextMessage(token, from, resposta)
        → Retorna {replied: true, response}
```

### 9) Impacto de modificar
**Módulos a revisar:** WhatsApp (envio/recebimento), Serviços (prompt), PublicProfile (prompt)
**Arquivos impactados:** groq-ai.ts, settings page, webhook
**Funcionalidades a testar:** Mensagem WhatsApp + resposta automática

### 10) Sintomas de falha
- IA não responde mensagens
- IA responde com dados incorretos
- IA responde em outro idioma
- Resposta demora muito
- Groq API cai (erro 500/503)
- Sanitização remove acentos PT-BR

### 11) Nível de risco
**MÉDIO.** É autônoma — se quebra, o resto funciona. Mas afeta experiência do cliente.

### 12) Evolução futura
- Migrar para OpenAI GPT-4o ou Claude
- Adicionar memória de longo prazo (histórico completo)
- Implementar handoff para humano
- Adicionar suporte a imagens
- Implementar fluxos conversacionais
- Adicionar analytics de conversas
- Implementar sentiment analysis
- Adicionar suporte a múltiplos idiomas

---

## FUNCIONALIDADE 12: LEMBRETES

### 1) Objetivo
Enviar lembretes automáticos por WhatsApp para clientes com agendamentos próximos.

### 2) Módulos que utiliza
- Prisma ORM (Appointment, Client, Service, User, WhatsAppSession, WhatsAppMessage)
- Evolution API (envio)
- Vercel Cron (agendamento)

### 3) Arquivos participantes
- `src/app/api/cron/reminders/route.ts` — Cron principal
- `src/lib/evolution-api.ts` — Envio de mensagens
- `src/app/api/reminders/route.ts` — Rota legada (gera links, não envia)
- `vercel.json` — Configuração do cron (0 9 * * *)

### 4) Tabelas do banco
- `Appointment` — Agendamentos para verificar
- `Client` — WhatsApp do cliente
- `Service` — Nome do serviço
- `User` — Nome do estúdio
- `WhatsAppSession` — Para enviar
- `WhatsAppMessage` — Registro do envio

### 5) APIs externas
- Evolution API (envio)

### 6) Funcionalidades que dependem dela
- Nenhuma (é isolada)

### 7) Do que ela depende
- WhatsApp (sessão conectada)
- Agendamentos (fonte de dados)
- Vercel Cron (execução automática)

### 8) Fluxo completo
```
Cron executa diariamente às 9h BRT (0 9 * * *) →

1. Lembrete de amanhã:
   → Busca appointments para AMANHÃ
   → Filtro: status in [pending, confirmed], reminderSent = false
   → Para cada appointment:
     → Busca WhatsAppSession do user
     → Se não conectada: skip
     → Formata mensagem com template aleatório
     → evolutionApi.sendTextMessage(token, client.whatsapp, message)
     → Salva WhatsAppMessage (OUTBOUND)
     → Atualiza appointment: reminderSent = true, reminderSentAt = now

2. Lembrete do mesmo dia (janela de 1.5h):
   → Calcula hora atual em BRT
   → Busca appointments para HOJE
   → Para cada: calcula diferença em horas
   → Se diferença entre 0 e 1.5 horas e reminderSent = false:
     → Envia lembrete do mesmo dia
```

### 9) Impacto de modificar
**Módulos a revisar:** Agendamentos, WhatsApp
**Funcionalidades a testar:** Lembretes (envio manual via curl)

### 10) Sintomas de falha
- Lembretes não enviam
- Lembretes enviam para agendamentos errados
- Lembretes duplicados
- Cron não executa (Vercel)

### 11) Nível de risco
**BAIXO.** Cron isolado, apenas leitura + envio.

### 12) Evolução futura
- Implementar fila de envio (não bloquear o cron)
- Adicionar retry automático
- Adicionar templates personalizáveis
- Enviar lembrete por e-mail também
- Adicionar confirmação de presença (resposta SIM/NÃO)
- Implementar lembretes em horário customizável

---

## FUNCIONALIDADE 13: PROMOÇÕES/MARKETING

### 1) Objetivo
Criar e enviar promoções para clientes via WhatsApp.

### 2) Módulos que utiliza
- Autenticação (authMiddleware)
- Prisma ORM (Promotion, Client)
- WhatsApp (links wa.me)

### 3) Arquivos participantes
- `src/components/PromotionSender.tsx` — Componente de criação
- `src/app/dashboard/marketing/page.tsx` — Página principal
- `src/app/api/promotions/route.ts` — GET + POST
- `src/app/api/promotions/[id]/route.ts` — DELETE
- `src/app/api/promotions/[id]/send/route.ts` — POST (gera links)

### 4) Tabelas do banco
- `Promotion` — Promoções criadas
- `Client` — Lista de clientes para enviar

### 5) APIs externas
- Nenhuma (gera links wa.me, não envia via API)

### 6) Funcionalidades que dependem dela
- Nenhuma (é isolada)

### 7) Do que ela depende
- Autenticação (userId)
- Clientes (lista de destinatários)
- WhatsApp (wa.me links)

### 8) Fluxo completo
```
Criar promoção:
  → POST /api/promotions {title, message, discount?}
    → prisma.promotion.create({userId, title, message, discount})

Enviar promoção:
  → POST /api/promotions/[id]/send
    → Busca todos os clientes do user
    → Para cada cliente:
      → Substitui variáveis na mensagem: {nome}, {estudio}, {desconto}
      → Gera link wa.me: https://wa.me/55${whatsapp}?text=${encodedMessage}
    → Retorna array de links
  → Nail clica nos links e envia manualmente
```

### 9) Impacto de modificar
**Módulos a revisar:** Clientes
**Funcionalidades a testar:** Criação e envio de promoções

### 10) Sintomas de falha
- Promoção não salva
- Variáveis não substituem
- Links wa.me não funcionam
- Lista de clientes vazia

### 11) Nível de risco
**BAIXO.** CRUD isolado, sem impacto em outros módulos.

### 12) Evolução futura
- Enviar via API do WhatsApp (não apenas links)
- Adicionar agendamento de envio
- Implementar segmentação de clientes
- Adicionar analytics de conversão
- Implementar templates de promoção
- Adicionar promoções automáticas (ex: aniversário do cliente)

---

## FUNCIONALIDADE 14: INDICAÇÕES (REFERRAL)

### 1) Objetivo
Sistema de indicações entre usuários: indicar outras nail designers e rastrear indicações.

### 2) Módulos que utiliza
- Autenticação (authMiddleware)
- Prisma ORM (User, Referral)
- Cookie (ref_code)

### 3) Arquivos participantes
- `src/app/ref/[code]/page.tsx` — Define cookie ref_code
- `src/app/api/register/route.ts` — Cria Referral no registro
- `src/app/api/referral/track/route.ts` — POST (rastrear)
- `src/app/api/referrals/me/route.ts` — GET (dados do user)
- `src/app/dashboard/indicacoes/page.tsx` — Painel admin

### 4) Tabelas do banco
- `Referral` — Registro de indicações
- `User` — refCode, referredBy

### 5) APIs externas
- Nenhuma

### 6) Funcionalidades que dependem dela
- Nenhuma (é isolada)

### 7) Do que ela depende
- Autenticação (registro de novos users)
- Cookie ref_code (rastreamento)

### 8) Fluxo completo
```
Indicadora compartilha: /ref/CODIGO →
  → src/app/ref/[code]/page.tsx
    → useEffect: document.cookie = "ref_code=CODE; max-age=31536000"
    → Redireciona para /entrar

Indicada se registra:
  → POST /api/register (cookie ref_code existe)
    → Busca User pelo refCode
    → Cria Referral {referrerId, referredUserId, status: "pending"}

Ver indicações:
  → GET /api/referrals/me
    → Busca User pelo id
    → Conta referrals criados
    → Retorna {count, refCode, referralLink}
```

### 9) Impacto de modificar
**Módulos a revisar:** Auth (registro)
**Funcionalidades a testar:** Fluxo completo de indicação

### 10) Sintomas de falha
- Cookie não salva
- Referral não cria no registro
- Contagem incorreta

### 11) Nível de risco
**BAIXO.** Funcionalidade isolada, sem impacto em outros módulos.

### 12) Evolução futura
- Implementar recompensas (créditos, descontos)
- Adicionar dashboard de indicações para a indicadora
- Implementar ranking de indicadoras
- Adicionar notificação quando indicar se cadastra
- Implementar sistema de comissão

---

## FUNCIONALIDADE 15: FORNECEDORES

### 1) Objetivo
Lista de fornecedores (links úteis) para a nail designer.

### 2) Módulos que utiliza
- Autenticação (authMiddleware)
- Prisma ORM (Supplier)

### 3) Arquivos participantes
- `src/components/SupplierManager.tsx` — CRUD
- `src/app/dashboard/suppliers/page.tsx` — Página
- `src/app/api/suppliers/route.ts` — GET + POST
- `src/app/api/suppliers/[id]/route.ts` — DELETE

### 4) Tabelas do banco
- `Supplier` — Lista de fornecedores

### 5) APIs externas
- Nenhuma

### 6) Funcionalidades que dependem dela
- Nenhuma (é isolada)

### 7) Do que ela depende
- Autenticação (userId)

### 8) Fluxo completo
```
Criar fornecedor:
  → POST /api/suppliers {name, link}
    → prisma.supplier.create({userId, name, link})

Listar:
  → GET /api/suppliers
    → prisma.supplier.findMany({where: {userId}})

Excluir:
  → DELETE /api/suppliers/[id]
    → prisma.supplier.delete({where: {id}})
```

### 9) Impacto de modificar
**Módulos a revisar:** Nenhum
**Funcionalidades a testar:** CRUD de fornecedores

### 10) Sintomas de falha
- Fornecedor não salva
- Lista não carrega

### 11) Nível de risco
**BAIXO.** CRUD completamente isolado.

### 12) Evolução futura
- Adicionar categorias
- Adicionar avaliações
- Implementar busca
- Adicionar favoritos

---

## FUNCIONALIDADE 16: ADMIN

### 1) Objetivo
Painel administrativo para gestão de usuários, planos e métricas.

### 2) Módulos que utiliza
- Autenticação (CEO bypass)
- Prisma ORM (User, Plan, Referral)

### 3) Arquivos participantes
- `src/app/dashboard/admin/page.tsx` — Painel admin
- `src/app/admin/page.tsx` — Rota admin alternativa
- `src/app/api/admin/users/route.ts` — GET
- `src/app/api/admin/users/[id]/route.ts` — GET + PUT
- `src/app/api/admin/referrals/route.ts` — GET

### 4) Tabelas do banco
- `User` — Gerenciamento
- `Plan` — Planos disponíveis
- `Referral` — Indicações

### 5) APIs externas
- Nenhuma

### 6) Funcionalidades que dependem dela
- Nenhuma funcionalidade depende do admin

### 7) Do que ela depende
- Autenticação (CEO bypass ou role admin)

### 8) Fluxo completo
```
Acessar /dashboard/admin →
  → Verifica role === "admin" ou email === CEO_EMAIL
  → GET /api/admin/users
    → Busca todos os users com contagens
    → Retorna lista paginada

Alterar usuário:
  → PUT /api/admin/users/[id] {blocked?, planId?, role?}
    → Atualiza user
    → Se planId muda: auto-seta subscriptionEndsAt (+30 dias)
```

### 9) Impacto de modificar
**Módulos a revisar:** Auth (verificação de acesso)
**Funcionalidades a testar:** Gerenciamento de usuários

### 10) Sintomas de falha
- Admin não acessa (verificação de acesso falha)
- Alterações não salvam
- CEO perde acesso

### 11) Nível de risco
**MÉDIO.** Pode afetar outros usuários se mal implementado.

### 12) Evolução futura
- Implementar dashboard de métricas
- Adicionar logs de auditoria
- Implementar gerenciamento de planos
- Adicionar suporte a múltiplos admin

---

## FUNCIONALIDADE 17: CONFIGURAÇÕES

### 1) Objetivo
Configurar perfil, WhatsApp, IA e conta do usuário.

### 2) Módulos que utiliza
- Autenticação (authMiddleware)
- WhatsApp (conexão)
- IA (toggle)
- Prisma ORM (User, PublicProfile)

### 3) Arquivos participantes
- `src/app/dashboard/settings/page.tsx` — Página principal
- `src/app/dashboard/settings/termos/page.tsx` — Termos de uso
- `src/app/dashboard/settings/politicas/page.tsx` — Política de privacidade
- `src/app/api/profile/route.ts` — GET + PUT (perfil)
- `src/app/api/user/ai-toggle/route.ts` — POST (toggle IA)
- `src/components/WhatsAppConnect.tsx` — Conexão WhatsApp

### 4) Tabelas do banco
- `User` — Dados do perfil
- `PublicProfile` — Perfil público
- `WhatsAppSession` — Status da conexão

### 5) APIs externas
- Cloudinary (upload de avatar/capa)

### 6) Funcionalidades que dependem dela
- Página Pública (usa PublicProfile)
- WhatsApp (conexão)
- IA (toggle)

### 7) Do que ela depende
- Autenticação
- WhatsApp (para toggle)
- Prisma/Neon

### 8) Fluxo completo
```
Perfil (STUB — NÃO FUNCIONA):
  → Preenche formulário
  → Clica "Salvar"
  → Mostra toast "Perfil atualizado!" ← BUG: não chama API
  → Nenhuma alteração é feita no banco

Alterar senha (STUB — NÃO FUNCIONA):
  → Preenche formulário
  → Clica "Alterar"
  → Mostra toast "Senha alterada!" ← BUG: não chama API

Excluir conta (STUB — NÃO FUNCIONA):
  → Clica "Excluir"
  → Chama logout() ← BUG: não exclui a conta

AI Toggle:
  → POST /api/user/ai-toggle
    → Verifica plano (premium only)
    → Atualiza user.aiEnabled
    → Retorna {aiEnabled}

WhatsApp:
  → (Funcional — vê FUNCIONALIDADE 10)
```

### 9) Impacto de modificar
**Módulos a revisar:** WhatsApp, IA, Página Pública
**Funcionalidades a testar:** Toggle AI, Conexão WhatsApp, Perfil público

### 10) Sintomas de falha
- Perfil não salva (STUB)
- Senha não altera (STUB)
- Conta não exclui (STUB)
- Toggle AI não funciona
- WhatsApp não conecta

### 11) Nível de risco
**MÉDIO.** Muitas funcionalidades stub, mas WhatsApp e AI são funcionais.

### 12) Evolução futura
- Implementar formulários stub (perfil, senha, exclusão)
- Adicionar 2FA
- Implementar exportação de dados (LGPD)
- Adicionar histórico de alterações
- Implementar preferências de notificação

---

## FUNCIONALIDADE 18: CHECKOUT

### 1) Objetivo
Permitir que usuários assinem planos pagos.

### 2) Módulos que utiliza
- Prisma ORM (Plan, User)
- Nenhum gateway de pagamento real

### 3) Arquivos participantes
- `src/app/checkout/page.tsx` — Página de checkout
- `src/app/api/checkout/route.ts` — POST (gera URL)
- `src/app/dashboard/plans/page.tsx` — Página de planos

### 4) Tabelas do banco
- `Plan` — Planos disponíveis
- `User` — Atualização de plano

### 5) APIs externas
- NENHUMA (checkout é 100% simulado)

### 6) Funcionalidades que dependem dela
- Nenhuma (é stub)

### 7) Do que ela depende
- Planos cadastrados no banco

### 8) Fluxo completo
```
Usuário clica "Assinar" →
  → Redireciona para /checkout?plan=pro|premium
  → Exibe preço (hardcoded: pro=R$49.9, premium=R$99.9)
  → Seleciona método de pagamento (card/pix/boleto)
  → Clica "Finalizar"
  → setTimeout(2000) ← SIMULAÇÃO
  → Redireciona para /dashboard
  → NENHUMA alteração no banco
```

### 9) Impacto de modificar
**Módulos a revisar:** Plan limits, Auth
**Funcionalidades a testar:** Fluxo completo de checkout

### 10) Sintomas de falha
- Checkout não redireciona
- Preço não aparece
- Pagamento "processa" mas plano não muda

### 11) Nível de risco
**BAIXO.** É stub — não afeta nada.

### 12) Evolução futura
- Integrar Stripe (checkout real)
- Implementar webhook de pagamento
- Adicionar assinatura recorrente
- Implementar trial gratuito
- Adicionar cupons de desconto
- Implementar upgrade/downgrade

---

## FUNCIONALIDADE 19: UPLOAD

### 1) Objetivo
Upload de imagens para Cloudinary.

### 2) Módulos que utiliza
- Cloudinary (upload)

### 3) Arquivos participantes
- `src/app/api/upload/route.ts` — POST (upload)
- `src/components/ImageUpload.tsx` — Componente de upload

### 4) Tabelas do banco
- Nenhuma

### 5) APIs externas
- Cloudinary

### 6) Funcionalidades que dependem dela
- Clientes (fotos)
- Serviços (imagem)
- Página Pública (capa)
- Configurações (avatar)

### 7) Do que ela depende
- Cloudinary (credenciais)

### 8) Fluxo completo
```
Usuário seleciona imagem →
  → ImageUpload converte para base64
  → POST /api/upload {image: base64}
    → Cria FormData com base64
    → Envia para Cloudinary API
    → Retorna {url, publicId}
  → URL salva no banco via rota específica
```

### 9) Impacto de modificar
**Módulos a revisar:** Clientes, Serviços, Página Pública, Configurações
**Funcionalidades a testar:** Upload de foto, avatar, capa, imagem de serviço

### 10) Sintomas de falha
- Upload falha (Cloudinary error)
- Imagem não aparece
- Upload sem autenticação (SECURITY BUG)

### 11) Nível de risco
**MÉDIO.** É isolado, mas sem auth (bug de segurança).

### 12) Evolução futura
- Adicionar autenticação
- Implementar compressão de imagem
- Adicionar thumbnails
- Implementar galeria de imagens
- Adicionar drag-and-drop

---

## FUNCIONALIDADE 20: RATE LIMITING

### 1) Objetivo
Limitar taxa de requisições para prevenir abuso.

### 2) Módulos que utiliza
- Upstash Redis
- @upstash/ratelimit

### 3) Arquivos participantes
- `src/app/api/auth/login/route.ts` — 10 req/15min
- `src/app/api/auth/forgot/route.ts` — 3 req/hora
- `src/app/api/register/route.ts` — 5 req/hora
- `src/app/api/public/[slug]/book/route.ts` — 10 req/hora

### 4) Tabelas do banco
- Nenhuma

### 5) APIs externas
- Upstash Redis

### 6) Funcionalidades que dependem dela
- Login, Registro, Forgot Password, Booking público

### 7) Do que ela depende
- Upstash Redis (credenciais)

### 8) Fluxo completo
```
Requisição autenticada →
  → Verifica rate limit no Redis
  → Se excedido: 429 Too Many Requests
  → Se OK: processa normalmente
```

### 9) Impacto de modificar
**Módulos a revisar:** Auth, Booking
**Funcionalidades a testar:** Login, Registro, Booking

### 10) Sintomas de falha
- Usuários bloqueados indevidamente
- Rate limit não funciona (Redis down)
- Limite muito alto/baixo

### 11) Nível de risco
**BAIXO.** Infraestrutura isolada.

### 12) Evolução futura
- Implementar rate limiting mais granular
- Adicionar rate limiting por endpoint
- Implementar blacklist de IPs
- Adicionar CAPTCHA

---

## FUNCIONALIDADE 21: ONBOARDING

### 1) Objetivo
Guia o novo usuário pelos primeiros passos: avatar → criar serviço → configurar página pública.

### 2) Módulos que utiliza
- Autenticação (useAuth)
- Prisma ORM (User, Service, PublicProfile)

### 3) Arquivos participantes
- `src/components/OnboardingOverlay.tsx` — Overlay de onboarding
- `src/app/api/user/onboarding/route.ts` — GET + PUT
- `src/app/api/user/onboarding-complete/route.ts` — POST
- `src/app/dashboard/services/page.tsx` — Step 2
- `src/app/dashboard/public/page.tsx` — Step 3

### 4) Tabelas do banco
- `User` — onboardingStep, onboardingCompleted
- `Service` — verificação de existência
- `PublicProfile` — verificação de existência

### 5) APIs externas
- Nenhuma

### 6) Funcionalidades que dependem dela
- Nenhuma (é isolada)

### 7) Do que ela depende
- Auth (userId)
- Serviços (verificação)
- PublicProfile (verificação)

### 8) Fluxo completo
```
Novo usuário faz login →
  → OnboardingOverlay verifica: !onboardingCompleted && step <= 3
  → Step 1: "Adicione seu avatar" (modal de avatar)
  → Step 2: "Crie seu primeiro serviço" (redireciona para /dashboard/services)
  → Step 3: "Configure sua página pública" (redireciona para /dashboard/public)
  → Após step 3: POST /api/user/onboarding-complete
    → Atualiza onboardingCompleted = true
```

### 9) Impacto de modificar
**Módulos a revisar:** Serviços, Página Pública
**Funcionalidades a testar:** Fluxo completo de onboarding

### 10) Sintomas de falha
- Onboarding não aparece
- Steps não avançam
- Onboarding não completa

### 11) Nível de risco
**BAIXO.** Isolado, apenas UI.

### 12) Evolução futura
- Adicionar mais steps
- Implementar skip de onboarding
- Adicionar analytics de conclusão
- Implementar tour interativo

---

## FUNCIONALIDADE 22: GOOGLE ANALYTICS

### 1) Objetivo
Rastrear visitas e eventos na plataforma.

### 2) Módulos que utiliza
- Google Analytics 4 (gtag.js)

### 3) Arquivos participantes
- `src/components/GoogleAnalytics.tsx` — Script GA
- `src/lib/analytics.ts` — Funções trackEvent, trackPageView
- `src/app/layout.tsx` — Inclui GoogleAnalytics

### 4) Tabelas do banco
- Nenhuma

### 5) APIs externas
- Google Analytics (GA4)

### 6) Funcionalidades que dependem dela
- Nenhuma (é observacional)

### 7) Do que ela depende
- NEXT_PUBLIC_GA_ID (variável de ambiente)

### 8) Fluxo completo
```
Página carrega →
  → GoogleAnalytics renderiza scripts gtag.js
  → GA ID: G-LBXSR68S0X (hardcoded fallback)
  → trackPageView registra visualização
  → trackEvent registra eventos customizados
```

### 9) Impacto de modificar
**Módulos a revisar:** Nenhum
**Funcionalidades a testar:** Verificar no dashboard do GA

### 10) Sintomas de falha
- Dados não aparecem no GA
- GA ID incorreto
- Ad blockers bloqueiam

### 11) Nível de risco
**BAIXO.** Observacional, não afeta funcionalidade.

### 12) Evolução futura
- Implementar server-side tracking
- Adicionar eventos customizados
- Implementar conversion tracking
- Adicionar heatmaps (Hotjar/Microsoft Clarity)

---

## FUNCIONALIDADE 23: SEO

### 1) Objetivo
Otimização para mecanismos de busca.

### 2) Módulos que utiliza
- Next.js metadata API
- Structured data (JSON-LD)

### 3) Arquivos participantes
- `src/app/layout.tsx` — Metadata global
- `src/app/[slug]/page.tsx` — Metadata da página pública

### 4) Tabelas do banco
- Nenhuma

### 5) APIs externas
- Nenhuma

### 6) Funcionalidades que dependem dela
- Página Pública (rankings de busca)

### 7) Do que ela depende
- Dados do estúdio (nome, descrição)

### 8) Fluxo completo
```
Página renderiza →
  → Next.js gera <head> com metadata
  → Structured data JSON-LD para rich snippets
```

### 9) Impacto de modificar
**Módulos a revisar:** Página Pública
**Funcionalidades a testar:** Google Search Console

### 10) Sintomas de falha
- Página não indexa
- Dados incorretos no Google

### 11) Nível de risco
**BAIXO.** Apenas meta tags.

### 12) Evolução futura
- Adicionar sitemap.xml
- Implementar robots.txt dinâmico
- Adicionar Open Graph tags
- Implementar breadcrumbs

---

## FUNCIONALIDADE 24: CRON JOBS

### 1) Objetivo
Tarefas automáticas agendadas: lembretes e health check.

### 2) Módulos que utiliza
- Vercel Cron
- Prisma ORM
- Evolution API

### 3) Arquivos participantes
- `src/app/api/cron/reminders/route.ts` — Lembretes
- `src/app/api/cron/whatsapp-health/route.ts` — Health check
- `vercel.json` — Configuração de crons

### 4) Tabelas do banco
- Appointment, Client, Service, User, WhatsAppSession, WhatsAppMessage

### 5) APIs externas
- Evolution API

### 6) Funcionalidades que dependem dela
- Lembretes (envio automático)
- WhatsApp (manutenção de sessão)

### 7) Do que ela depende
- Vercel Cron (execução)
- WhatsApp (sessão conectada)
- Neon PostgreSQL (dados)

### 8) Fluxo completo
```
reminders (9h BRT):
  → (vê FUNCIONALIDADE 12)

whatsapp-health (3h BRT):
  → (vê FUNCIONALIDADE 10 — reconexão automática)
```

### 9) Impacto de modificar
**Módulos a revisar:** Agendamentos, WhatsApp
**Funcionalidades a testar:** Lembretes, Health check

### 10) Sintomas de falha
- Cron não executa
- Lembretes não enviam
- WhatsApp não reconecta

### 11) Nível de risco
**MÉDIO.** Afeta automações críticas.

### 12) Evolução futura
- Adicionar mais crons (limpeza de cache, relatórios)
- Implementar fila de processamento
- Adicionar monitoramento de execução
- Implementar retry automático

---

## FUNCIONALIDADE 25: PARCEIROS

### 1) Objetivo
Sistema de parceiros/comissionistas.

### 2) Módulos que utiliza
- Prisma ORM (Partner)
- NENHUMA autenticação

### 3) Arquivos participantes
- `src/app/api/partners/route.ts` — GET + POST (SEM AUTH)
- `src/app/parcerias/page.tsx` — Página stub

### 4) Tabelas do banco
- `Partner`

### 5) APIs externas
- Nenhuma

### 6) Funcionalidades que dependem dela
- Nenhuma

### 7) Do que ela depende
- Nada (completamente isolada e incompleta)

### 8) Fluxo completo
```
POST /api/partners {name, email?, referralCode}
  → NÃO VALIDA AUTENTICAÇÃO ← BUG
  → Gera código único (5 tentativas)
  → prisma.partner.create({...})

GET /api/partners
  → NÃO VALIDA AUTENTICAÇÃO ← BUG
  → Retorna todos os parceiros
```

### 9) Impacto de modificar
**Módulos a revisar:** Nenhum
**Funcionalidades a testar:** Nenhuma (incompleta)

### 10) Sintomas de falha
- Qualquer pessoa cria parceiros
- Dados expostos publicamente

### 11) Nível de risco
**BAIXO.** Incompleta e isolada, mas com bug de segurança.

### 12) Evolução futura
- Adicionar autenticação
- Implementar cálculo de comissão
- Implementar pagamento de comissões
- Adicionar dashboard de parceiros

---

## FUNCIONALIDADE 26: REVIEWS/AVALIAÇÕES

### 1) Objetivo
Permitir que clientes avaliem serviços prestados.

### 2) Módulos que utiliza
- Prisma ORM (Appointment com rating/review)
- Página Pública

### 3) Arquivos participantes
- `src/components/public/ReviewsSection.tsx` — Exibição e submissão
- `src/app/api/public/[slug]/reviews/route.ts` — GET + POST
- `src/app/api/public/[slug]/appointments-by-phone/route.ts` — GET (lookup)

### 4) Tabelas do banco
- `Appointment` — Campos rating, review, reviewedAt
- `Client` — Lookup por telefone

### 5) APIs externas
- Nenhuma

### 6) Funcionalidades que dependem dela
- Página Pública (seção de avaliações)

### 7) Do que ela depende
- Página Pública (slug)
- Agendamentos (para lookup)

### 8) Fluxo completo
```
Cliente acessa /slug →
  → ReviewsSection
  → Digita telefone
  → GET /appointments-by-phone?phone=xxx
    → Busca client por whatsapp
    → Retorna appointments completados
  → Seleciona appointment
  → Avalia (rating + review)
  → POST /reviews {appointmentId, rating, review}
    → Atualiza appointment com rating/review
  → Recarrega página inteira ← BUG
```

### 9) Impacto de modificar
**Módulos a revisar:** Página Pública, Agendamentos
**Funcionalidades a testar:** Fluxo de avaliação

### 10) Sintomas de falha
- Avaliação não salva
- Lookup por telefone retorna dados errados
- Página recarrega inteira

### 11) Nível de risco
**BAIXO.** Isolada, apenas leitura/escrita de rating.

### 12) Evolução futura
- Adicionar autenticação do avaliador
- Implementar moderação
- Adicionar rating médio no perfil
- Implementar resposta do nail
- Adicionar fotos nas avaliações

---

# PARTE 2: MAPA DE EVOLUÇÃO

## Ordem Segura de Evolução

### Prioridade 1 — CORRIGIR Bases Quebradas (Sem isso nada funciona direito)

| # | Funcionalidade | Por quê |
|---|---------------|---------|
| 1 | **Autenticação** | JWT_SECRET hardcoded, CEO bypass hardcoded. Sem isso, segurança zero. |
| 2 | **Checkout** | 100% simulado. Sem pagamento real, não há receita. |
| 3 | **Configurações (stubs)** | Perfil, senha e exclusão não funcionam. Usuário não consegue gerenciar conta. |

### Prioridade 2 — CORRIGIR Segurança (Vulnerabilidades críticas)

| # | Funcionalidade | Por quê |
|---|---------------|---------|
| 4 | **Upload** | Sem autenticação — qualquer pessoa faz upload. |
| 5 | **Partners** | Sem autenticação — qualquer pessoa cria parceiros. |
| 6 | **Webhooks** | Sem verificação de assinatura — qualquer pessoa envia eventos falsos. |
| 7 | **Cron Jobs** | Sem autenticação — qualquer pessoa pode acionar envio em massa. |
| 8 | **Reviews** | Sem rate limiting — spam de avaliações. |
| 9 | **Client Login** | Token nunca validado — autenticação falsa. |

### Prioridade 3 — CORRIGIR Funcionalidades Incompletas

| # | Funcionalidade | Por quê |
|---|---------------|---------|
| 10 | **Esqueci a Senha** | Token criado mas nunca enviado por e-mail. |
| 11 | **Galeria (Página Pública)** | Imagens hardcoded — todos os estúdios mostram as mesmas fotos. |
| 12 | **Dashboard** | Carrega tudo em memória — problema de performance. |
| 13 | **Financeiro** | Relatório anual ignora receitas manuais. |

### Prioridade 4 — OTIMIZAR Performance

| # | Funcionalidade | Por quê |
|---|---------------|---------|
| 14 | **Dashboard** | Polling a cada 5s é excessivo. Usar SWR/React Query. |
| 15 | **WhatsApp** | N+1 API calls em listAllInstancesWithState. |
| 16 | **Agendamentos** | Sem paginação — carrega tudo. |

### Prioridade 5 — EVOLUIR Funcionalidades Existentes

| # | Funcionalidade | Por quê |
|---|---------------|---------|
| 17 | **WhatsApp** | Fila de mensagens, retry, fallback |
| 18 | **IA** | Migrar modelo, memória de longo prazo, handoff |
| 19 | **Lembretes** | Templates customizáveis, envio por e-mail |
| 20 | **Promoções** | Envio via API (não apenas links) |
| 21 | **Clientes** | Soft delete, importação, categorias |
| 22 | **Agendamentos** | Recorrência, lista de espera, buffer |

### Prioridade 6 — ADICIONAR Novas Features

| # | Funcionalidade | Por quê |
|---|---------------|---------|
| 23 | **Stripe Integration** | Pagamento real |
| 24 | **E-mail Notifications** | Lembretes por e-mail |
| 25 | **Google Calendar Sync** | Integração com agenda externa |
| 26 | **Multi-idioma** | Internacionalização |
| 27 | **App Mobile** | PWA ou React Native |

---

# PARTE 3: MATRIZ DE IMPACTO

Para cada módulo, o que pode quebrar se for modificado:

## Autenticação
↓ Pode quebrar
- **TODOS os módulos** — qualquer rota autenticada
- Login, Registro, Logout
- Todas as rotas `/api/*`
- Todos os componentes que usam `useAuth()`
- Dashboard, Clientes, Serviços, Agendamentos, Financeiro, WhatsApp, IA, Admin, Configurações

## Clientes
↓ Pode quebrar
- Agendamentos (clientId)
- Página Pública (criação automática no booking)
- IA (contexto do cliente)
- Promoções (lista de destinatários)
- Dashboard (contagem)
- Financeiro (receitas vinculadas)
- Lembretes (whatsapp do cliente)
- Reviews (lookup por telefone)
- Client Area (login)

## Serviços
↓ Pode quebrar
- Agendamentos (serviceId)
- Página Pública (lista de serviços)
- IA (system prompt com serviços)
- Dashboard (analytics de serviços)
- Financeiro (receitas vinculadas)
- Booking online (seleção de serviço)

## Agendamentos
↓ Pode quebrar
- Dashboard (cards e estatísticas)
- Financeiro (criação de Revenue)
- Lembretes (fonte de dados)
- IA (criação automática)
- Página Pública (verificação de conflito)
- Reviews (lookup de appointments)

## WhatsApp
↓ Pode quebrar
- IA (envio de respostas)
- Lembretes (envio)
- Confirmações (envio)
- Agendamento Online (notificação)
- Página Pública (notificação de booking)
- Promoções (envio)
- Health check
- Configurações (toggle)

## IA
↓ Pode quebrar
- Nenhum módulo depende da IA
- Mas: experiência do cliente final é afetada

## Financeiro
↓ Pode quebrar
- Dashboard (faturamento)
- Relatórios

## Configurações
↓ Pode quebrar
- WhatsApp (conexão)
- IA (toggle)
- Página Pública (perfil)
- Perfil do usuário

## Dashboard
↓ Pode quebrar
- Nenhum módulo depende do Dashboard

## Página Pública
↓ Pode quebrar
- Agendamento Online
- Reviews
- Client Area
- SEO

## Bloqueio de Horários
↓ Pode quebrar
- Agendamentos (verificação de conflito)
- Slots disponíveis
- Booking online

## Admin
↓ Pode quebrar
- Nenhum módulo depende do Admin

## Upload
↓ Pode quebrar
- Clientes (fotos)
- Serviços (imagem)
- Página Pública (capa)
- Configurações (avatar)

---

# PARTE 4: ORDEM SEGURA DE IMPLEMENTAÇÃO DE NOVAS FEATURES

## Processo Formal (8 etapas)

### Etapa 1: Entender o Requisito
- O que o usuário quer?
- Qual problema isso resolve?
- É funcionalidade nova ou correção?
- Quem é o usuário afetado?

### Etapa 2: Mapear Módulos Afetados
- Consultar MAPA DE IMPLEMENTAÇÃO (Parte 1)
- Identificar TODOS os módulos que serão tocados
- Consultar MATRIZ DE IMPACTO (Parte 3)
- Listar todos os arquivos que precisarão ser modificados

### Etapa 3: Mapear Dependências
- Consultar MAPA DE IMPLEMENTAÇÃO — seção "Do que ela depende"
- Consultar seção "Funcionalidades que dependem dela"
- Identificar cadeia completa de impacto
- Verificar se alguma dependência está quebrada

### Etapa 4: Mapear Tabelas
- Quais tabelas serão criadas/modificadas?
- Quais relações serão afetadas?
- Precisa de migration?
- Há risco de perda de dados?

### Etapa 5: Mapear APIs
- Quais APIs externas serão chamadas?
- Precisa de novas credenciais?
- Há rate limits?
- Há custo associado?

### Etapa 6: Mapear Riscos
- Qual o nível de risco? (Baixo/Médio/Alto/Crítico)
- O que pode quebrar?
- Como mitigar?
- Precisa de feature flag?
- Precisa de rollback?

### Etapa 7: Planejar Alterações
- Criar lista de arquivos a modificar
- Definir ordem de implementação
- Definir testes necessários
- Definir critérios de aceitação
- Revisar código existente similar (seguir padrões)

### Etapa 8: Implementar
- Seguir padrões do código existente
- Não comentar código desnecessariamente
- Não assumir que libs estão disponíveis (verificar package.json)
- Rodar lint e typecheck após alterações
- Testar manualmente
- Só commitar quando aprovado

## Checklist de Implementação

Antes de escrever qualquer código:

- [ ] Li o MAPA DE IMPLEMENTAÇÃO do módulo afetado?
- [ ] Li a MATRIZ DE IMPACTO?
- [ ] Identifiquei TODOS os arquivos que serão modificados?
- [ ] Identifiquei TODAS as funcionalidades que precisarei testar?
- [ ] Verifiquei se as dependências estão funcionando?
- [ ] Verifiquei se há migration de banco necessária?
- [ ] Verifiquei se há variáveis de ambiente novas?
- [ ] Defini como fazer rollback se der errado?
- [ ] Sigo os padrões de código existente?
- [ ] Não vou quebrar funcionalidade existente?

---

**FIM DO MAPA DE IMPLEMENTAÇÃO**

*Documento gerado em 27/07/2026. Baseado exclusivamente na leitura completa do código fonte do projeto.*
*Todas as informações foram verificadas pela leitura dos arquivos. Nenhuma suposição foi feita.*
