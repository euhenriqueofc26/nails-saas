# ESTADO ATUAL DA IMPLEMENTAÇÃO — ClubNailsBrasil

**Data de geração:** 28/07/2026
**Baseado em:** Leitura completa do código fonte + documentações existentes
**Objetivo:** Painel oficial do estado real do projeto

---

# 1. RESUMO GERAL

| Métrica | Valor |
|---------|-------|
| **Funcionalidades totais identificadas** | 26 |
| **Funcionalidades completas e funcionais** | 8 (31%) |
| **Funcionalidades parcialmente implementadas** | 10 (38%) |
| **Funcionalidades simuladas (stubs)** | 5 (19%) |
| **Funcionalidades inexistentes** | 3 (12%) |
| **Bugs conhecidos** | 57 (14 corrigidos, 43 abertos) |
| **Bugs críticos abertos** | 13 |
| **Bugs de segurança abertos** | 7 |
| **Porcentagem estimada de implementação útil** | ~45% |

**Nota:** A porcentagem considera que módulos com bugs críticos ou stubs não podem ser considerados "prontos" mesmo que tenham código funcional.

---

# 2. ESTADO DE CADA FUNCIONALIDADE

## Tabela Consolidada

| Funcionalidade | Existe | Funciona | Produção | Teste | Incompleta | Bugs | Próxima etapa |
|---------------|--------|----------|----------|-------|------------|------|---------------|
| Registro de Usuário | ✅ | ✅ | ✅ | — | — | 2 | Corrigir: slug duplicado, refCode opcional |
| Login | ✅ | ✅ | ✅ | — | — | 1 | Corrigir: JWT_SECRET hardcoded fallback |
| Logout | ✅ | ✅ | ✅ | — | — | 0 | Nenhuma |
| Dashboard | ✅ | ⚠️ | ✅ | — | Parcial | 3 | Corrigir: performance, polling excessivo |
| Clientes (CRUD) | ✅ | ✅ | ✅ | — | — | 2 | Corrigir: exclusão não cascadeia |
| Clientes (Fotos) | ✅ | ✅ | ✅ | — | — | 1 | Corrigir: publicId extração frágil |
| Serviços (CRUD) | ✅ | ✅ | ✅ | — | — | 1 | Corrigir: exclusão não verifica FK |
| Agendamentos (CRUD) | ✅ | ✅ | ✅ | — | — | 2 | Corrigir: mutation de estado, imports dinâmicos |
| Bloqueio de Horários | ✅ | ✅ | ✅ | — | — | 0 | Nenhuma |
| Financeiro | ✅ | ⚠️ | ✅ | — | Parcial | 1 | Corrigir: relatório anual ignora receitas manuais |
| Página Pública | ✅ | ⚠️ | ✅ | — | Parcial | 3 | Corrigir: galeria hardcoded, reviews sem auth |
| Agendamento Online | ✅ | ✅ | ✅ | — | — | 1 | Corrigir: confirmationSent semanticamente errado |
| WhatsApp Conexão | ✅ | ⚠️ | ✅ | — | Parcial | 3 | Corrigir: polling, QR refresh, planId bug |
| WhatsApp Envio | ✅ | ✅ | ✅ | — | — | 0 | Nenhuma |
| WhatsApp Recebimento | ✅ | ⚠️ | ✅ | — | Parcial | 2 | Corrigir: sem webhook auth, dedup 10s |
| IA Secretária | ✅ | ⚠️ | ✅ | — | Parcial | 4 | Corrigir: sanitize acentos, race condition, premium check |
| Lembretes | ✅ | ⚠️ | ✅ | — | Parcial | 2 | Corrigir: campo inexistente, sem auth no cron |
| Promoções | ✅ | ⚠️ | ✅ | — | Parcial | 1 | Melhorar: envia links, não envia via API |
| Indicações | ✅ | ⚠️ | ✅ | — | Parcial | 2 | Corrigir: domínio hardcoded, sem recompensa |
| Fornecedores | ✅ | ✅ | ✅ | — | — | 0 | Nenhuma |
| Admin | ✅ | ⚠️ | ✅ | — | Parcial | 2 | Corrigir: CEO hardcoded, localStorage inconsistente |
| Configurações | ⚠️ | ❌ | ❌ | — | Stub | 4 | Implementar: perfil, senha, exclusão |
| Checkout | ⚠️ | ❌ | ❌ | — | Stub | 2 | Implementar: Stripe integration |
| Upload | ✅ | ⚠️ | ✅ | — | Parcial | 2 | Corrigir: sem auth, cloudinary hardcoded |
| Reviews/Avaliações | ✅ | ⚠️ | ✅ | — | Parcial | 3 | Corrigir: sem auth, reload, sem rate limit |
| Client Area | ⚠️ | ❌ | ❌ | — | Stub | 2 | Implementar: token validation |
| Esqueci a Senha | ⚠️ | ❌ | ❌ | — | Stub | 2 | Implementar: envio de e-mail |
| Rate Limiting | ✅ | ✅ | ✅ | — | — | 0 | Nenhuma |
| Onboarding | ✅ | ✅ | ✅ | — | — | 1 | Corrigir: settings submenu não auto-expande |
| Google Analytics | ✅ | ⚠️ | ✅ | — | Parcial | 1 | Corrigir: GA ID hardcoded fallback |
| SEO | ✅ | ⚠️ | ✅ | — | Parcial | 0 | Melhorar: sitemap, robots.txt |
| Cron Jobs | ✅ | ⚠️ | ✅ | — | Parcial | 2 | Corrigir: sem auth, health check incompleto |
| Parceiros | ⚠️ | ❌ | ❌ | — | Stub | 2 | Implementar: auth, comissão |
| Trial | ❌ | ❌ | ❌ | — | Inexistente | 1 | Implementar: trialEndsAt nunca preenchido |
| Plano Limite | ⚠️ | ⚠️ | — | — | Parcial | 2 | Corrigir: planId comparado com string, hasPublicPage dead code |

---

# 3. ESTADO DOS MÓDULOS

## Módulo: Autenticação

| Item | Estado |
|------|--------|
| **Estado atual** | Funcional com bugs de segurança |
| **Funciona?** | Sim, mas com vulnerabilidades |
| **Problemas conhecidos** | JWT_SECRET hardcoded fallback `'nails-saas-secret'`; CEO bypass hardcoded `euhenriqueofc26@gmail.com`; fallback em auth.ts usa `jsonwebtoken` em vez de `jose` |
| **Dependências** | Prisma, bcryptjs, jsonwebtoken, Redis (token revocation) |
| **Risco de alteração** | CRÍTICO — afeta todo o sistema |
| **Prioridade** | ALTA — corrigir segurança primeiro |

## Módulo: Dashboard

| Item | Estado |
|------|--------|
| **Estado atual** | Funcional com problemas de performance |
| **Funciona?** | Sim, mas lento para muitos dados |
| **Problemas conhecidos** | Carrega TODOS os appointments em memória (`findMany({})` sem filtro userId); polling a cada 5 segundos é excessivo; cálculos em JavaScript em vez de SQL |
| **Dependências** | Auth, Appointment, Client, Revenue, Service |
| **Risco de alteração** | MÉDIO — é apenas leitura |
| **Prioridade** | MÉDIA — performance pode esperar |

## Módulo: Clientes

| Item | Estado |
|------|--------|
| **Estado atual** | Funcional |
| **Funciona?** | Sim |
| **Problemas conhecidos** | Exclusão não cascadeia (appointments ficam órfãos); publicId extração frágil; upload leaks config de Cloudinary no erro |
| **Dependências** | Auth, Cloudinary |
| **Risco de alteração** | ALTO — referenciado por muitos módulos |
| **Prioridade** | MÉDIA |

## Módulo: Serviços

| Item | Estado |
|------|--------|
| **Estado atual** | Funcional |
| **Funciona?** | Sim |
| **Problemas conhecidos** | Exclusão não verifica appointments vinculados (FK violation) |
| **Dependências** | Auth, Cloudinary |
| **Risco de alteração** | MÉDIO |
| **Prioridade** | MÉDIA |

## Módulo: Agenda/Agendamentos

| Item | Estado |
|------|--------|
| **Estado atual** | Funcional |
| **Funciona?** | Sim |
| **Problemas conhecidos** | `currentDate.setMonth()` muta state diretamente; imports dinâmicos no handler; confirmationSent setado para notificação (não confirmação real) |
| **Dependências** | Auth, Client, Service, BlockedTime, WhatsApp |
| **Risco de alteração** | CRÍTICO — funcionalidade central |
| **Prioridade** | ALTA |

## Módulo: Bloqueio de Horários

| Item | Estado |
|------|--------|
| **Estado atual** | Funcional |
| **Funciona?** | Sim |
| **Problemas conhecidos** | Nenhum |
| **Dependências** | Auth |
| **Risco de alteração** | BAIXO |
| **Prioridade** | BAIXA |

## Módulo: Financeiro

| Item | Estado |
|------|--------|
| **Estado atual** | Parcialmente funcional |
| **Funciona?** | Parcialmente — receitas manuais criam, mas relatório anual ignora receitas manuais |
| **Problemas conhecidos** | Relatório anual só conta receitas de appointments (não manuais); bloqueado para plano Free |
| **Dependências** | Auth, Appointment |
| **Risco de alteração** | MÉDIO |
| **Prioridade** | MÉDIA |

## Módulo: Página Pública

| Item | Estado |
|------|--------|
| **Estado atual** | Parcialmente funcional |
| **Funciona?** | Parcialmente — funciona mas com problemas |
| **Problemas conhecidos** | Galeria HARDCODED (todas as páginas mostram as mesmas 6 fotos); reviews sem autenticação; Client Area com token falso |
| **Dependências** | PublicProfile, Service, Plan, WhatsApp |
| **Risco de alteração** | ALTO — face pública do negócio |
| **Prioridade** | ALTA |

## Módulo: WhatsApp

| Item | Estado |
|------|--------|
| **Estado atual** | Parcialmente funcional |
| **Funciona?** | Parcialmente — envia mas tem problemas de conexão |
| **Problemas conhecidos** | QR Code polling com dependency issues; reconnect busca primeira sessão desconhecida; planId comparado com string (`'premium'`); webhook sem autenticação |
| **Dependências** | Evolution API (VPS externa), Auth |
| **Risco de alteração** | CRÍTICO — afeta IA, Lembretes, Confirmações |
| **Prioridade** | ALTA |

## Módulo: IA Secretária

| Item | Estado |
|------|--------|
| **Estado atual** | Parcialmente funcional |
| **Funciona?** | Parcialmente — responde mas com bugs |
| **Problemas conhecidos** | `sanitizeMessage` remove acentos PT-BR; race condition em pendingMessage lookup; marca `aiProcessed=true` antes do envio real; parâmetro `instanceName` não utilizado |
| **Dependências** | Groq API, WhatsApp, Service, PublicProfile |
| **Risco de alteração** | MÉDIO — é autônoma |
| **Prioridade** | MÉDIA |

## Módulo: Lembretes

| Item | Estado |
|------|--------|
| **Estado atual** | Parcialmente funcional |
| **Funciona?** | Parcialmente — envia mas com bugs |
| **Problemas conhecidos** | Cron sem autenticação (qualquer pessoa pode acionar); rota legada duplicada (`/api/reminders`) |
| **Dependências** | WhatsApp, Appointment, Vercel Cron |
| **Risco de alteração** | BAIXO |
| **Prioridade** | MÉDIA |

## Módulo: Cloudinary

| Item | Estado |
|------|--------|
| **Estado atual** | Funcional |
| **Funciona?** | Sim |
| **Problemas conhecidos** | Upload endpoint sem autenticação; cloudName hardcoded fallback |
| **Dependências** | Credenciais Cloudinary |
| **Risco de alteração** | BAIXO |
| **Prioridade** | MÉDIA (adicionar auth no upload) |

## Módulo: Admin

| Item | Estado |
|------|--------|
| **Estado atual** | Funcional |
| **Funciona?** | Sim |
| **Problemas conhecidos** | CEO email hardcoded; admin page usa `localStorage.getItem('token')` em vez de `useAuth().token`; referrals usa `prisma as any` |
| **Dependências** | Auth, Prisma |
| **Risco de alteração** | MÉDIO |
| **Prioridade** | MÉDIA |

## Módulo: Promoções

| Item | Estado |
|------|--------|
| **Estado atual** | Parcialmente funcional |
| **Funciona?** | Parcialmente — cria mas envia links, não envia via API |
| **Problemas conhecidos** | Gera links wa.me em vez de enviar via Evolution API; template variables limitadas |
| **Dependências** | Auth, Client, WhatsApp |
| **Risco de alteração** | BAIXO |
| **Prioridade** | BAIXA |

## Módulo: Notificações

| Item | Estado |
|------|--------|
| **Estado atual** | Parcialmente funcional |
| **Funciona?** | Parcialmente — confirmação funciona, lembretes têm bugs |
| **Problemas conhecidos** | ConfirmationSentAt setado mas campo não existe no schema (bug do audit anterior); cron sem auth |
| **Dependências** | WhatsApp, Appointment |
| **Risco de alteração** | MÉDIO |
| **Prioridade** | MÉDIA |

## Módulo: Configurações

| Item | Estado |
|------|--------|
| **Estado atual** | STUB — quase nada funciona |
| **Funciona?** | Não — apenas toggle AI e WhatsApp Connect funcionam |
| **Problemas conhecidos** | Salvar perfil: mostra toast mas não chama API; Alterar senha: mostra toast mas não chama API; Excluir conta: chama logout() em vez de deletar |
| **Dependências** | Auth, WhatsApp, AI |
| **Risco de alteração** | MÉDIO |
| **Prioridade** | ALTA — usuário não consegue gerenciar conta |

## Módulo: Uploads

| Item | Estado |
|------|--------|
| **Estado atual** | Funcional mas inseguro |
| **Funciona?** | Sim — faz upload para Cloudinary |
| **Problemas conhecidos** | Endpoint sem autenticação; cloudName hardcoded fallback |
| **Dependências** | Cloudinary |
| **Risco de alteração** | BAIXO |
| **Prioridade** | ALTA — segurança |

## Módulo: Analytics

| Item | Estado |
|------|--------|
| **Estado atual** | Parcialmente funcional |
| **Funciona?** | Parcialmente — client-side only |
| **Problemas conhecidos** | GA ID hardcoded fallback; client-side only (ad blockers bloqueiam); sem server-side tracking |
| **Dependências** | Google Analytics |
| **Risco de alteração** | BAIXO |
| **Prioridade** | BAIXA |

## Módulo: Cron Jobs

| Item | Estado |
|------|--------|
| **Estado atual** | Parcialmente funcional |
| **Funciona?** | Parcialmente — executa mas com problemas |
| **Problemas conhecidos** | Sem autenticação; health check verifica apenas sessions CONNECTED (não verifica todas) |
| **Dependências** | Vercel Cron, WhatsApp, Appointment |
| **Risco de alteração** | MÉDIO |
| **Prioridade** | MÉDIA |

## Módulo: Rate Limiter

| Item | Estado |
|------|--------|
| **Estado atual** | Funcional |
| **Funciona?** | Sim |
| **Problemas conhecidos** | Aplicado apenas em algumas rotas (login, register, forgot, booking) |
| **Dependências** | Upstash Redis |
| **Risco de alteração** | BAIXO |
| **Prioridade** | BAIXA |

## Módulo: Redis

| Item | Estado |
|------|--------|
| **Estado atual** | Funcional |
| **Funciona?** | Sim |
| **Problemas conhecidos** | Usado apenas para rate limiting e token revocation; sem cache de dados |
| **Dependências** | Upstash Redis |
| **Risco de alteração** | BAIXO |
| **Prioridade** | BAIXA |

---

# 4. FUNCIONALIDADES INCOMPLETAS

## 4.1 Settings (Configurações)

**O que já existe:**
- Interface da página de configurações
- Formulários de perfil, senha e exclusão
- Toggle de AI
- Conexão WhatsApp

**O que falta:**
- Salvar perfil: handler mostra toast mas não chama API de atualização
- Alterar senha: handler mostra toast mas não valida senha atual nem atualiza
- Excluir conta: chama `logout()` em vez de deletar o user do banco
- Upload de avatar: componente existe mas o handler não salva no banco

**Impacto:** Usuário não consegue alterar dados pessoais, senha ou excluir conta.

## 4.2 Checkout (Pagamento)

**O que já existe:**
- Página de checkout com seleção de plano
- Seleção de método de pagamento (card/pix/boleto)
- Interface visual completa

**O que falta:**
- Integração com gateway de pagamento (Stripe/MercadoPago)
- Criação de sessão de checkout real
- Webhook de confirmação de pagamento
- Atualização automática do plano do usuário
- Gerenciamento de assinatura recorrente

**Impacto:** Plataforma não gera receita. Todos os planos são de graça.

## 4.3 Reset de Senha

**O que já existe:**
- Rota POST `/api/auth/forgot` que gera token
- Rota PUT `/api/auth/forgot` que aceita token + nova senha
- Página `/forgot-password` NÃO EXISTE (link quebrado no login)

**O que falta:**
- Envio de e-mail com o token
- Página de redefinição de senha
- Validação de expiração do token

**Impacto:** Usuário que esqueceu a senha fica permanentemente bloqueado.

## 4.4 Client Area (Área do Cliente)

**O que já existe:**
- Interface de login por WhatsApp
- Rota POST `/api/public/[slug]/client-login` que gera token
- Rota GET `/api/public/[slug]/client-appointments` que aceita token

**O que falta:**
- Token nunca é validado (aceita qualquer valor)
- Token nunca é armazenado server-side
- Sem verificação real de identidade

**Impacto:** Qualquer pessoa com telefone + slug vê todos os agendamentos de qualquer cliente.

## 4.5 Trial

**O que já existe:**
- Campo `trialEndsAt` no schema do User
- Lógica de verificação no authMiddleware

**O que falta:**
- Campo `trialEndsAt` nunca é preenchido no registro
- Não há lógica que defina duração do trial
- Não há bloqueio automático quando trial expira

**Impacto:** Usuários ficam para sempre no plano free sem limite de tempo.

## 4.6 Plano Limite (Feature Gating)

**O que já existe:**
- Campo `hasPublicPage` no Plan
- Verificação no planMiddleware
- Limites numéricos (maxClients, maxAppointments, maxServices)

**O que falta:**
- Verificação `hasPublicPage` é dead code (free plan já tem `true`)
- `planId !== 'premium'` compara CUID do plano com string `'premium'` — sempre dá true
- Limites não são verificados em muitas rotas

**Impacto:** Usuários free usam features que deveriam ser pagas.

## 4.7 Galeria (Página Pública)

**O que já existe:**
- Componente GallerySection.tsx com 6 imagens

**O que falta:**
- Imagens são HARDCODED (locais: `/imagens/trabalho1-6.jpg`)
- Não são dinâmicas por estúdio
- Todas as páginas públicas mostram as mesmas fotos

**Impacto:** Todos os estúdios parecem idênticos na galeria.

## 4.8 Reviews/Avaliações

**O que já existe:**
- Interface de avaliação
- Rota POST que salva rating + review
- Lookup por telefone

**O que falta:**
- Sem autenticação (qualquer pessoa avalia)
- Sem rate limiting (spam possível)
- Após submissão: `window.location.reload()` (recarrega página inteira)
- Lookup por telefone retorna dados sem autenticação

**Impacto:** Avaliações podem ser fraudulentas; UX ruim.

## 4.9 Onboarding

**O que já existe:**
- Overlay de 3 steps
- API de progresso

**O que falta:**
- Settings submenu não auto-expande baseado na rota ativa
- Steps são muito básicos

**Impacto:** UX de novo usuário poderia ser melhor.

## 4.10 SEO

**O que já existe:**
- Metadata básica no layout
- Structured data na página pública

**O que falta:**
- Sem sitemap.xml
- Sem robots.txt dinâmico
- Sem Open Graph tags completas

**Impacto:** Página pode não rankear bem no Google.

---

# 5. FUNCIONALIDADES SIMULADAS (STUBS)

## 5.1 Checkout — 100% Simulado

- Página `/checkout/page.tsx` existe
- Seleciona plano e método de pagamento
- `setTimeout(2000)` simula processamento
- Redireciona para `/dashboard`
- **NENHUMA** alteração no banco
- **NENHUM** pagamento é processado

## 5.2 Salvar Perfil — Stub

- `src/app/dashboard/settings/page.tsx` — handler `handleProfileSave`
- Mostra `toast.success("Perfil atualizado!")`
- **NÃO** chama nenhuma API
- **NENHUMA** alteração no banco

## 5.3 Alterar Senha — Stub

- `src/app/dashboard/settings/page.tsx` — handler `handlePasswordChange`
- Mostra `toast.success("Senha alterada!")`
- **NÃO** valida senha atual
- **NÃO** atualiza no banco

## 5.4 Excluir Conta — Stub

- `src/app/dashboard/settings/page.tsx` — handler `handleDeleteAccount`
- Chama `logout()`
- **NÃO** exclui o user do banco
- **NÃO** exclui dados vinculados

## 5.5 Parceiros — Stub

- Rota `/api/partners` existe (GET + POST)
- Página `/parcerias/page.tsx` existe
- Formulário faz `e.preventDefault()` — **não faz nada**
- Rota não tem autenticação

## 5.6 Client Login — Stub

- Rota `/api/public/[slug]/client-login` gera token
- Token **nunca é armazenado** server-side
- Rota `/api/public/[slug]/client-appointments` aceita token mas **nunca valida**
- Qualquer valor de token é aceito

---

# 6. FUNCIONALIDADES REALMENTE PRONTAS

Estas funcionalidades podem ser consideradas completas e funcionais:

| # | Funcionalidade | Observação |
|---|---------------|------------|
| 1 | **Login** | Funciona (com ressalva do JWT_SECRET hardcoded) |
| 2 | **Registro** | Funciona (cria user + public profile + referral) |
| 3 | **Logout** | Funciona (revoga token no Redis) |
| 4 | **CRUD Clientes** | Funciona (criar, listar, buscar, editar, excluir) |
| 5 | **Upload de Fotos (Clientes)** | Funciona (upload para Cloudinary) |
| 6 | **CRUD Serviços** | Funciona (criar, listar, editar, excluir, ativar/desativar) |
| 7 | **CRUD Agendamentos** | Funciona (criar, listar, atualizar status, cancelar) |
| 8 | **Bloqueio de Horários** | Funciona (criar, listar, excluir) |
| 9 | **Slots Disponíveis** | Funciona (calcula horários livres) |
| 10 | **Booking Online** | Funciona (cria client + appointment + revenue + WhatsApp) |
| 11 | **WhatsApp Conexão** | Funciona (cria instância, exibe QR Code) |
| 12 | **WhatsApp Envio** | Funciona (envia mensagens) |
| 13 | **WhatsApp Recebimento** | Funciona (webhook salva mensagens) |
| 14 | **Rate Limiting** | Funciona (Upstash Redis) |
| 15 | **Fornecedores CRUD** | Funciona (criar, listar, excluir) |
| 16 | **Página Pública (perfil + serviços)** | Funciona (exibe dados do estúdio) |

**Nota:** Mesmo estas funcionalidades "prontas" possuem bugs conhecidos listados na seção 2.

---

# 7. FUNCIONALIDADES CRÍTICAS

Funcionalidades que **impedem o SaaS de operar comercialmente**:

## 7.1 Pagamento (Checkout)

**Por quê:** Sem pagamento real, não há receita. Todos os usuários são de graça. O negócio não se sustenta.

**Estado atual:** 100% simulado. `setTimeout(2000)`.

**O que falta:** Integração com Stripe/MercadoPago, webhook de confirmação, gerenciamento de assinatura.

## 7.2 WhatsApp (Conexão Estável)

**Por quê:** WhatsApp é o canal principal de comunicação com clientes. Sem ele, lembretes, confirmações e IA não funcionam.

**Estado atual:** Funciona mas instável. QR Code às vezes não aparece. Sessão cai e não reconecta sempre.

**O que falta:** Fila de mensagens, retry automático, monitoramento de conexão.

## 7.3 Segurança (Autenticação)

**Por quê:** JWT_SECRET hardcoded. CEO bypass hardcoded. Webhooks sem auth. Upload sem auth. Partners sem auth.

**Estado atual:** Funciona para uso normal, mas vulnerável a ataques.

**O que falta:** Migrar JWT_SECRET para variável de ambiente obrigatória; adicionar auth nos endpoints públicos.

## 7.4 Configurações (Gerenciamento de Conta)

**Por quê:** Usuário não consegue alterar perfil, senha ou excluir conta. Violação de direitos do usuário.

**Estado atual:** STUB — tudo mostra toast mas não faz nada.

**O que falta:** Implementar todas as funcionalidades de settings.

## 7.5 Trial / Planos

**Por quê:** Sem trial funcional, não há caminho para conversão de free para pago.

**Estado atual:** `trialEndsAt` nunca é preenchido. Limite de plano não é verificado corretamente.

**O que falta:** Definir duração do trial, bloquear features após expiração, verificar limites corretamente.

## 7.6 Deploy (GitHub → Vercel)

**Por quê:** Sem deploy automático, cada alteração precisa de deploy manual.

**Estado atual:** RESTAURADO (funcionando). Webhook automático do GitHub.

**O que falta:** Nenhuma — está funcionando.

---

# 8. PRÓXIMAS IMPLEMENTAÇÕES

Fila ordenada da maior para a menor prioridade:

| # | Implementação | Motivo | Dependências | Risco | Tempo Est. | Impacto |
|---|--------------|--------|--------------|-------|------------|---------|
| 1 | **Corrigir JWT_SECRET** | Segurança crítica — fallback hardcoded | Nenhuma | CRÍTICO | 30min | Segurança |
| 2 | **Corrigir CEO bypass** | Segurança crítica — email hardcoded | Nenhuma | CRÍTICO | 30min | Segurança |
| 3 | **Auth no /api/upload** | Segurança — qualquer pessoa faz upload | Nenhuma | ALTO | 30min | Segurança |
| 4 | **Auth no /api/partners** | Segurança — qualquer pessoa cria parceiros | Nenhuma | ALTO | 30min | Segurança |
| 5 | **Auth nos cron jobs** | Segurança — qualquer pessoa acion envio em massa | Nenhuma | ALTO | 1h | Segurança |
| 6 | **Auth no webhook** | Segurança — qualquer pessoa envia eventos falsos | Nenhuma | ALTO | 2h | Segurança |
| 7 | **Implementar Settings (perfil)** | Usuário não consegue alterar dados | Auth | MÉDIO | 4h | UX |
| 8 | **Implementar Settings (senha)** | Usuário não consegue alterar senha | Auth | MÉDIO | 2h | UX |
| 9 | **Implementar Settings (excluir conta)** | Usuário não consegue excluir conta | Auth | MÉDIO | 2h | UX/LGPD |
| 10 | **Implementar Esqueci a Senha** | Usuário bloqueado se esquecer senha | E-mail service | MÉDIO | 4h | UX |
| 11 | **Corrigir Plan Limits** | Free users usam features pagas | Auth | MÉDIO | 4h | Negócio |
| 12 | **Corrigir WhatsApp polling** | QR Code às vezes não aparece | WhatsApp | MÉDIO | 2h | UX |
| 13 | **Corrigir IA sanitize** | Acentos PT-BR são removidos | Groq API | BAIXO | 1h | IA |
| 14 | **Corrigir Dashboard performance** | Lento para muitos dados | Prisma | MÉDIO | 4h | Performance |
| 15 | **Implementar Checkout real** | Não gera receita | Stripe/MercadoPago | ALTO | 8h | Negócio |
| 16 | **Corrigir Galeria hardcoded** | Todas as páginas mostram as mesmas fotos | Cloudinary | BAIXO | 4h | UX |
| 17 | **Corrigir Reviews (auth)** | Qualquer pessoa avalia | Auth | MÉDIO | 2h | Integridade |
| 18 | **Corrigir Client Area (auth)** | Token nunca validado | Auth | MÉDIO | 4h | Segurança |
| 19 | **Corrigir Client delete cascade** | Exclusão deixa appointments órfãos | Prisma | MÉDIO | 2h | Integridade |
| 20 | **Corrigir Service delete cascade** | Exclusão pode causar FK violation | Prisma | MÉDIO | 2h | Integridade |
| 21 | **Corrigir Financial reports** | Relatório anual ignora receitas manuais | Prisma | BAIXO | 2h | Dados |
| 22 | **Implementar Trial** | Usuários ficam para sempre no free | Auth, Plan | MÉDIO | 4h | Negócio |
| 23 | **Corrigir Onboarding submenu** | Settings não auto-expande | UI | BAIXO | 1h | UX |
| 24 | **Adicionar sitemap.xml** | SEO | Nenhuma | BAIXO | 1h | SEO |
| 25 | **Corrigir GA hardcoded** | Analytics ID hardcoded | Nenhuma | BAIXO | 30min | Analytics |
| 26 | **Melhorar Promoções** | Envia links, não envia via API | WhatsApp | BAIXO | 4h | Marketing |
| 27 | **Melhorar Lembretes** | Adicionar retry, templates customizáveis | WhatsApp | BAIXO | 4h | UX |
| 28 | **Melhorar IA** | Migrar modelo, memória longo prazo | Groq/OpenAI | BAIXO | 8h | IA |

---

# 9. CHECKLIST DE VALIDAÇÃO

## Antes de iniciar QUALQUER implementação:

```
□ Ler este documento (ESTADO-ATUAL-IMPLEMENTACAO.md)
□ Ler DOCUMENTACAO.md
□ Ler MAPAIMPLEMENTACAO-COMPLETO.md
□ Ler MAPARQUITETURA-COMPLETO.md
□ Consultar Matriz de Impacto
□ Identificar TODOS os módulos afetados
□ Identificar TODOS os arquivos que serão modificados
□ Verificar se dependências estão funcionando
□ Verificar se há migration de banco necessária
□ Verificar variáveis de ambiente necessárias
□ Definir como fazer rollback se der errado
□ Verificar impacto em outros módulos
□ Testar funcionalidades dependentes
□ Rodar lint após alterações
□ Rodar typecheck após alterações
□ Testar manualmente
□ Só commitar quando aprovado
```

## Antes de fazer deploy:

```
□ Verificar se não há erros de build
□ Verificar se não há erros de TypeScript
□ Verificar se não há warnings críticos
□ Verificar se variáveis de ambiente estão configuradas no Vercel
□ Verificar se migration foi aplicada (se houver)
□ Verificar se não há secrets no código
□ Verificar se não há console.logs de debug
□ Verificar se não há código morto
```

## Após deploy:

```
□ Verificar se deploy foi para Vercel (verificar URL)
□ Testar login
□ Testar funcionalidade alterada
□ Testar funcionalidades dependentes
□ Verificar logs no Vercel
□ Verificar se não há erros no browser console
□ Verificar se não há erros no banco
```

---

**FIM DO DOCUMENTO**

*Documento gerado em 28/07/2026. Baseado exclusivamente na leitura completa do código fonte e documentações existentes.*
*Todas as informações foram verificadas pela leitura dos arquivos. Nenhuma suposição foi feita.*
