# ClubNailsBrasil - Manual da Plataforma

## Introdução

O ClubNailsBrasil é uma plataforma SaaS completa para gerenciamento de salões de unhas e nails designers. A plataforma permite que profissionais da beleza gerenciem seus clientes, agendamentos, serviços e finanças de forma eficiente, além de oferecer uma página pública para agendamento online por parte das clientes.

---

## Funcionalidades

### 1. Sistema de Autenticação

#### Registro
- **URL**: `https://www.clubnailsbrasil.com.br`
- O novo usuário deve preencher: nome, email, senha, WhatsApp, nome do studio e Instagram (opcional)
- Cada usuário recebe um slug único baseado no nome do studio
- **Trial**: Toda nova conta recebe 15 dias gratuitos de acesso total
- **Campo Instagram**: Exibido no admin e pode ser usado para contato

#### Login
- Acesso com email e senha
- Token JWT com validade de 30 dias

---

### 2. Dashboard

O dashboard é a página inicial após o login e apresenta:

- **Agendamentos hoje**: Quantidade de agendamentos agendados para o dia
- **Faturamento do mês**: Total calculado automaticamente a partir de agendamentos concluídos
- **Clientes ativos**: Total de clientes cadastrados
- **Pendentes**: Número de agendamentos com status "pendente"
- **Lista de agendamentos do dia**: Visualização rápida dos horários
- **Próximos agendamentos**: Próximos 5 agendamentos futuros
- **Atalhos**: Links rápidos para Clientes, Financeiro e Serviços

---

### 3. Clientes

#### Gerenciamento de Clientes
- Cadastro de clientes com: nome, WhatsApp e observações
- Listagem de todos os clientes
- Busca por nome ou WhatsApp
- Contador de clientes (limitado por plano)
- **Perfil do cliente**: Clique no nome para abrir detalhes

#### Perfil do Cliente
Ao clicar no nome do cliente, abre um modal com duas abas:

**Aba Histórico:**
- Lista de todos os atendimentos do cliente
- Data, horário, serviço e valor
- Status: concluído, agendado, cancelado

**Aba Fotos:**
- Galeria de fotos dos trabalhos realizados
- Upload de fotos (otimizadas automaticamente)
- Armazenamento via Cloudinary (25GB gratuitos)
- Exclusão de fotos

#### Campos do Cliente
- Nome completo
- WhatsApp (com formatação)
- Observações (campo livre)
- Data do último serviço
- Fotos ilimitadas (Cloudinary)

---

### 4. Agendamentos

#### Criar Agendamento
- Seleção do cliente (busca automática)
- Seleção do serviço
- Data e horário
- Preço (preenchido automaticamente basedo no serviço)
- Status: pendente, confirmado, concluído, cancelado
- Observações

#### Calendário de Agendamentos
- Visualização em formato de lista/calendário
- Filtragem por status
- Edição e cancelamento
- Marcação como "concluído" (afeta faturamento)

#### Status dos Agendamentos
- **Pendente**: Aguardando confirmação
- **Confirmado**: Confirmado pela nail. Ao clicar, abre WhatsApp da cliente com mensagem de confirmação preenchida
- **Concluído**: Finalizado (inclui no faturamento do mês)
- **Cancelado**: Cancelado (não conta no faturamento)

---

### 5. Serviços

#### Cadastro de Serviços
Cada serviço inclui:
- Nome
- Preço (R$)
- Duração (minutos)
- Descrição (opcional)
- **Imagem** (opcional - URL)

#### Limites por Plano
- **Gratuito**: até 5 serviços
- **Pro**: até 20 serviços
- **Premium**: ilimitado

#### Exibição na Página Pública
- As imagens cadastradas aparecem na página pública
- Se não houver imagem, exibe imagem genérica baseada no nome

---

### 6. Controle Financeiro

#### Receita
- Calculada automaticamente a partir de agendamentos concluídos
- Faturamento do dia e do mês
- Histórico de agendamentos finalizados

#### Despesas
- Cadastro de despesas
- Categorias: material, loja, funcionário, outros
- Data e descrição

#### Relatórios
- Receita por período
- Despesas por período
- Lucro (receita - despesas)
- Disponível apenas nos planos Pro e Premium

---

### 7. Página Pública

#### Configurações
Cada nail pode configurar:

- **Imagem de Capa (Hero)**: URL de imagem que aparece no topo da página
- **Bio/Descrição**: Texto sobre o trabalho
- **Endereço**: Localização do salão
- **Horário de Funcionamento**: Dias e horários de atendimento (intervalos suportados, ex: "Ter a Sex" = Ter, Qua, Qui, Sex)
- **Horários Dinâmicos**: A página pública mostra apenas slots disponíveis baseados nos horários configurados
- **Instagram**: Link do perfil
- **Facebook**: Link da página
- **Status**: Ativar/desativar página pública

#### URL da Página Pública
- Formato: `https://www.clubnailsbrasil.com.br/[slug-do-studio]`
- Exemplo: `https://www.clubnailsbrasil.com.br/meu-salao`

#### Agendamento Online
As clientes podem:
1. Visualizar serviços disponíveis
2. Selecionar serviço desejado
3. Escolher data e horário disponível
4. Preencher nome e WhatsApp
5. Confirmar agendamento

#### Mensagens WhatsApp Automáticas

O ClubNailsBrasilenvia mensagens automáticas para as clientes via WhatsApp. São **9 mensagens** configuráveis:

**Botão Flutuante (1):**
> "Olá [Nome do Studio], gostaria de fazer um agendamento personalizado."

**Confirmação de Agendamento (1):**
```
Novo agendamento:

Cliente: [Nome da Cliente]
WhatsApp: [WhatsApp]
Serviço: [Nome do Serviço]
Valor: [R$ Preço]
Data: [DD de MMMM]
Horário: [HH:MM]
```

**Lembretes Automáticos (2):**
- Lembrete 1 dia antes do agendamento
- Lembrete no dia do agendamento

**Promoções (5 templates):**
- Templates personalizáveis para envio de promoções
- Envio manual pela nail designer

---

### 8. Planos e Assinatura

#### Planos Disponíveis

| Recurso | Gratuito | Pro | Premium |
|---------|----------|-----|---------|
| Clientes | 10 | 100 | Ilimitado |
| Agendamentos/mês | 50 | 200 | Ilimitado |
| Serviços | 5 | 20 | Ilimitado |
| Página pública | ✓ | ✓ | ✓ |
| Controle financeiro | ✗ | ✓ | ✓ |
| Análises | ✗ | ✓ | ✓ |
| Preço | Grátis | R$ 29,90/mês | R$ 59,90/mês |

#### Sistema de Trial
- 15 dias gratuitos ao criar conta
- Após expirar, acesso é bloqueado
- Usuário pode fazer upgrade para continuar

#### Pagamento (Simulado)
- Página de checkout com:
  - Cartão de crédito
  - PIX
  - Boleto
- Sistema simulado para demonstração

---

### 9. Área de Administração (Admin)

#### Acesso
- Disponível apenas para usuários com role "admin"
- URL: `/dashboard/admin`

#### Funcionalidades
- **Lista de usuários**: Visualizar todas as nails cadastradas
- **Busca**: Por nome, email ou studio
- **Filtros**: Por plano e status (ativo, bloqueado, em trial)
- **Alterar plano**: Upgrade ou downgrade manual
- **Bloquear/Desbloquear**: Acesso ao sistema
- **Visualizar dados**: Clientes, agendamentos, email, WhatsApp

---

### 10. WhatsApp Automation (Evolution API)

#### Visão Geral
Integração com a Evolution API (self-hosted) para enviar mensagens WhatsApp de forma automatizada, substituindo os links manuais wa.me por mensagens reais enviadas diretamente para o cliente.

#### Arquitetura
- **Evolution API**: Instância self-hosted em VPS (Docker) que gerencia a conexão WhatsApp
- **Serviço**: `src/lib/evolution-api.ts` - comunicação com a API
- **Banco de Dados**: Tabelas `WhatsAppSession` e `WhatsAppMessage` para rastrear sessões e mensagens
- **Componente**: `WhatsAppConnect.tsx` - modal de conexão via QR Code

#### Funcionalidades

**Conexão WhatsApp**
- Geração de QR Code para escanear com o WhatsApp
- Polling automático a cada 3s para detectar quando o QR é scaneado
- Status: `connected`, `disconnected`, `qr_read`, `expired`

**Mensagens Automáticas**
- Confirmação de agendamento quando status muda para "confirmado"
- Notificação para a nail quando cliente agenda online
- Lembretes automáticos (via cron):
  - 1 dia antes: "Lembramos do seu horário amanhã..."
  - No dia: "Hoje tem horário confirmado..."
- Promoções em massa (manual)

**Proteções Anti-Banimento**
- Delay aleatório de 20-30s entre mensagens
- ~300 mensagens/dia por número
- Rotação de templates de mensagem (múltiplas variações)
- Aquecimento de 2 semanas recomendado para novos números

#### Plano Premium
- WhatsApp automático disponível apenas no plano Premium (R$ 59,90/mês)
- IA Secretária como add-on (+R$ 29,90/mês)

#### Configuração
```env
EVOLUTION_API_URL=https://sua-vps:8080
EVOLUTION_API_KEY=sua-chave-de-api
```

#### Fluxo de Mensagens
```
Cliente agenda online → Webhook Evolution API → Notificação para nail
Nail confirma agendamento → Evolution API → Confirmação para cliente
Cron (9:00) → Evolution API → Lembrete para cliente
```

#### Arquivos Envolvidos
- `src/lib/evolution-api.ts` - Serviço principal
- `src/components/WhatsAppConnect.tsx` - Componente de conexão
- `src/app/api/whatsapp/connect/route.ts` - Conectar instância
- `src/app/api/whatsapp/disconnect/route.ts` - Desconectar
- `src/app/api/whatsapp/status/route.ts` - Status da conexão
- `src/app/api/whatsapp/send/route.ts` - Enviar mensagem
- `src/app/api/webhooks/evolution/incoming/route.ts` - Webhook mensagens recebidas
- `src/app/api/webhooks/evolution/connection-update/route.ts` - Webhook status conexão
- `src/app/api/cron/reminders/route.ts` - Lembretes automáticos
- `prisma/schema.prisma` - Modelos WhatsAppSession e WhatsAppMessage

---

### 11. Sistema de Onboarding

#### Visão Geral
Todo novo usuário que se cadastra na plataforma é guiado por um passo a passo de 3 etapas para configurar sua conta.

#### Fluxo do Onboarding

**Step 1 - Dashboard (/dashboard)**
- Mensagem: "Adicione uma foto sua para suas clientes confiarem mais"
- Alvo: Botão de foto de perfil
- Duração: 6 segundos (tooltip some automaticamente)

**Step 2 - Serviços (/dashboard/services)**
- Mensagem: "Crie seu primeiro serviço para suas clientes agendarem"
- Alvo: Botão "Novo Serviço"
- Ao criar serviço → redirecionamento automático para Step 3
- Duração: 6 segundos

**Step 3 - Página Pública (/dashboard/public)**
- Mensagem: "Configure sua página pública para começar a receber agendamentos"
- Alvo: Título "Página Pública"
- Ao clicar em "Ver página" → onboarding concluído
- Duração: 6 segundos

#### Comportamento do Tooltip
- Aparece com fundo branco sobreposto na tela
- Tem borda pulsante highlightando o elemento-alvo
- Indicador de progresso (1/3, 2/3, 3/3)
- some automaticamente após 6 segundos
- Botão "Mais tarde" para pular o onboarding
- Botão "Próximo" para avançar manualmente

#### Controle no Banco de Dados
- `onboardingStep`: número do step atual (1, 2, 3)
- `onboardingCompleted`: boolean (true quando concluído)
- Usuários existentes não são afetados

#### Arquivos Envolvidos
- `src/components/OnboardingOverlay.tsx` - Componente principal
- `src/hooks/useOnboarding.tsx` - Hook de estado
- `src/app/api/user/onboarding/route.ts` - API de controle
- `src/app/api/user/onboarding-complete/route.ts` - API para finalizar
- `src/components/Providers.tsx` - Provedores (Auth + Onboarding)

---

## Aspectos Técnicos

### Tecnologias Utilizadas
- **Frontend**: Next.js (React), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL (Neon)
- **Autenticação**: JWT
- **ORM**: Prisma
- **Storage de Imagens**: Cloudinary (25GB gratuito)
- **Analytics**: Google Analytics 4
- **Hospedagem**: Vercel

### Estrutura de Pastas
```
src/
├── app/
│   ├── api/                    # APIs Routes
│   │   ├── admin/              # Rotas de administração
│   │   ├── appointments/
│   │   ├── clients/
│   │   │   ├── [id]/
│   │   │   │   ├── appointments/
│   │   │   │   └── photos/
│   │   │   └── route.ts
│   │   ├── cron/reminders/     # Lembretes automáticos WhatsApp
│   │   ├── dashboard/
│   │   ├── financial/
│   │   ├── public/
│   │   ├── services/
│   │   ├── auth/
│   │   ├── whatsapp/           # Integração Evolution API
│   │   │   ├── connect/
│   │   │   ├── disconnect/
│   │   │   ├── send/
│   │   │   └── status/
│   │   └── webhooks/evolution/ # Webhooks da Evolution API
│   │       ├── incoming/
│   │       └── connection-update/
│   ├── dashboard/              # Páginas do dashboard
│   └── [slug]/                 # Página pública
├── components/
│   ├── ClientProfileModal.tsx
│   ├── WhatsAppConnect.tsx     # Modal QR Code WhatsApp
│   └── public/                 # Componentes da página pública
├── context/
├── lib/
│   ├── cloudinary.ts
│   ├── evolution-api.ts        # Serviço Evolution API
│   └── ...
└── types/
    └── global.d.ts             # Declarações de tipos globais
```

### Variáveis de Ambiente
```
DATABASE_URL=                # URL do PostgreSQL (Neon)
JWT_SECRET=                  # Chave secreta para JWT
NEXT_PUBLIC_BASE_URL=        # URL base do app
NEXT_PUBLIC_GA_ID=           # Google Analytics 4 ID
CLOUDINARY_CLOUD_NAME=       # Nome do cloud Cloudinary
CLOUDINARY_API_KEY=          # API Key do Cloudinary
CLOUDINARY_API_SECRET=       # API Secret do Cloudinary
EVOLUTION_API_URL=           # URL da instância Evolution API (ex: https://vps:8080)
EVOLUTION_API_KEY=           # API Key da Evolution API
```

---

## Backup e Segurança

### Backups Automáticos
- O Neon faz backups automáticos contínuos
- Retention de 7 dias no plano gratuito

### Point in Time Recovery
- Disponíveis restore points manuais
- Criar branch de backup no GitHub

---

## Como Usar a Plataforma

### Para a Nail (Profissional)

1. **Cadastre-se**: Acesse o site e crie sua conta
2. **Configure**: Adicione seus serviços, clientes e configure a página pública
3. **Gerencie**: Use o dashboard para acompanhar agendamentos
4. **Configure imagem**: Adicione URL da imagem de capa na página pública
5. **Adicione fotos de serviços**: Cada serviço pode ter uma imagem

### Para a Cliente

1. **Acesse**: Entre na página pública da nail (via link compartilhado)
2. **Escolha**: Selecione o serviço desejado
3. **Agende**: Escolha data, horário e preencha seus dados
4. **Confirme**: Receba a confirmação via WhatsApp

---

## Perguntas Frequentes

**Posso cancelar a qualquer momento?**
Sim, mas o acesso permanece até o fim do período pago.

**O que acontece com meus dados se eu cancelar?**
Seus dados permanecem por 30 dias. Após isso, podem ser removidos.

**Como funciona o agendamento?**
A cliente agenda online e você recebe a notificação via WhatsApp para confirmar.

**Posso ter mais de um usuário na mesma conta?**
Ainda não, cada conta é para um profissional.

**As clientes podem cancelar agendamento?**
Ainda não, apenas a nail pode gerenciar status.

---

## Suporte

Em caso de dúvidas ou problemas:
- WhatsApp: [Incluir contato]
- Email: [Incluir email]

---

*Documento atualizado em Julho de 2026*
*ClubNailsBrasil - Plataforma para Nails Designers*

---

## Estado Atual do Projeto (30/07/2026)

### O que está FUNCIONANDO

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Autenticação (login/registro/JWT) | ✅ Funcionando | |
| Dashboard (agendamentos, faturamento) | ✅ Funcionando | |
| Clientes (cadastro, busca, perfil, fotos) | ✅ Funcionando | |
| Agendamentos (criar, editar, cancelar) | ✅ Funcionando | |
| Serviços (cadastro, limites por plano) | ✅ Funcionando | |
| Controle financeiro (receita, despesas) | ✅ Funcionando | |
| Página pública (agendamento online) | ✅ Funcionando | |
| Planos e trial (15 dias) | ✅ Funcionando | |
| Admin (gestão de usuários) | ✅ Funcionando | |
| Onboarding (3 passos) | ✅ Funcionando | |
| WhatsApp envio (confirmação, lembretes) | ✅ Funcionando | Via Evolution Go |
| WhatsApp AI (Groq + Evolution Go) | ✅ Funcionando | IA Secretária responde automaticamente |
| WhatsApp Conexão (QR Code) | ✅ Funcionando | Instância Fabi conectada |
| Galeria Híbrida (padrão + upload) | ✅ Funcionando | Mostra fotos do upload ou imagens padrão |
| Configurações da Conta (perfil, senha) | ✅ Funcionando | Salva perfil e altera senha via API |
| Esqueci a Senha | ✅ Funcionando | Envia email com token de redefinição |
| Configurações Página Pública | ✅ Funcionando | Hero, bio, endereço, horários, redes sociais |
| Client Area (Área do Cliente) | ✅ Funcionando | Login via WhatsApp + histórico de agendamentos |
| Reviews/Avaliações | ✅ Funcionando | Clientes avaliam após agendamento |
| Promoções em Massa | ✅ Funcionando | Envio via Evolution API com templates |
| Indicações (Referral) | ✅ Funcionando | Código de indicação no registro |
| Fornecedores (CRUD) | ✅ Funcionando | Cadastro e gerenciamento |
| Parceiros/Afiliados | ✅ Funcionando | Formulário de parcerias |
| SEO (metadata, analytics) | ✅ Funcionando | |
| Segurança (11 fixes) | ✅ Deployed | Ver seção Segurança abaixo |

---

### Progresso do Dia (30/07/2026)

#### Segurança (11 fixes - já deployados)
```
32f66f3 fix: prevent email enumeration in forgot password endpoint
ee032e5 fix: move DELETE handler to correct route for blocked-times
1385d58 fix: sanitize user input before AI prompt to prevent injection
5e6d466 fix: verify admin role from database instead of JWT payload
2edffe5 fix: make CEO email configurable via environment variable
14830ec fix: use authMiddleware in ai-toggle for proper access control
d049f5f fix: use confirmationSent instead of reminderSent in booking
8ae84bc fix: validate Evolution API config before making calls
16ac41f fix: centralize CEO email via environment variables
fe2856a fix: rate limiter now fails closed for auth endpoints
3c83ad8 fix: implement token revocation on logout using Redis
```

#### WhatsApp AI (6 itens - deployados via CLI)
```
d7e99f9 fix: health check cron, retry on send, event filtering, dedup, logging, Info.Sender priority
2b4dd79 fix: adapt webhook to Evolution Go v0.7.2 payload structure
061a2e2 fix: WhatsApp AI webhook - fix phone extraction, content types, session fallback
```

**Itens implementados nesta sessão:**

| # | Item | Arquivo | Status |
|---|------|---------|--------|
| 1 | Health check cron + auto-reconnect | `src/app/api/cron/whatsapp-health/route.ts` | ✅ Deployed |
| 2 | Retry no sendTextMessage (3 tentativas) | `src/lib/evolution-api.ts` | ✅ Deployed |
| 3 | Filtrar eventos Receipt/SendMessage/QRTimeout | `src/app/api/webhooks/evolution/incoming/route.ts` | ✅ Deployed |
| 4 | Deduplicação de mensagens (10s window) | `src/app/api/webhooks/evolution/incoming/route.ts` | ✅ Deployed |
| 5 | Logging diagnóstico (4 checkpoints) | `src/lib/groq-ai.ts` | ✅ Deployed |
| 6 | Info.Sender como fonte primária do telefone | `src/app/api/webhooks/evolution/incoming/route.ts` | ✅ Deployed |

---

### Arquitetura de Deploy

```
GitHub (euhenriqueofc26/nails-saas)
    ↓ (webhook restaurado em 27/07/2026)
Vercel (projeto: nails-saas)
    ├── Domínio: www.clubnailsbrasil.com.br
    ├── Build: prisma db push && next build
    └── Deploy: automático via webhook GitHub→Vercel

Evolution Go v0.7.2 (VPS: 77.37.41.176:4000)
    ├── PostgreSQL (Evolution Go): porta 5432
    └── GLOBAL_API_KEY: configurada

Neon PostgreSQL
    └── Banco principal do SaaS (todas as tabelas)
```

---

### Instâncias Evolution Go (VPS)

| Instância | ID | Status | Webhook |
|-----------|-----|--------|---------|
| fundador | ce59bc1c | ❌ Desconectada | Sem webhook |
| clubnailsbrasil | 2d630867 | ❌ Reconnecting | clubnailsbrasil.com.br (domínio antigo) |
| **fab-nail-designer-zl** | c1d56432 | ✅ **CONECTADA** | www.clubnailsbrasil.com.br ✅ |
| ana-studio-nail | 93c20948 | ❌ Desconectada | www.clubnailsbrasil.com.br ✅ |

---

### Variáveis de Ambiente Necessárias

#### Vercel (configuradas ✅)
```
EVOLUTION_API_URL=http://77.37.41.176:4000     ✅
EVOLUTION_API_KEY=...                           ✅
GROQ_API_KEY=...                                ✅
NEXT_PUBLIC_APP_URL=https://www.clubnailsbrasil.com.br  ✅
DATABASE_URL=... (Neon)                         ✅
NEXT_PUBLIC_CEO_EMAIL=euhenriqueofc26@gmail.com ✅
CEO_EMAIL=euhenriqueofc26@gmail.com             ✅
```

#### Vercel (faltando ❌)
```
UPSTASH_REDIS_REST_URL=     ❌ Necessário para rate limiter e token revocation
UPSTASH_REDIS_REST_TOKEN=   ❌ Necessário para rate limiter e token revocation
```

---

### Próximos Passos

1. **MEDIUM:** Implementar delay aleatório (2-5s) antes da IA responder para simular "digitando..."
2. **MEDIUM:** Implementar bolinha "digitando..." via Evolution API
3. **LOW:** Configurar Upstash Redis na Vercel (habilitar rate limiter + revocation)
4. **LOW:** Limpar instâncias mortas na Evolution Go (fundador, clubnailsbrasil, ana-studio-nail)
5. **LOW:** Limpar projetos órfãos na Vercel (automsg, automsgpro123, client, automsg-pro, lumora-web, lumora)

### Changelog

**30/07/2026 (Itens 10–28 + Fixes):**
- Implementados e deployados itens 10–28: Configurações da Conta, Esqueci a Senha, Galeria Híbrida, Lembretes Automáticos, Client Area, Indicações, Promoções em Massa, Reviews, Fornecedores, Parceiros
- Galeria híbrida: se nail designer não enviar fotos → mostra imagens padrão; se enviar → mostra fotos dela
- Sidebar revertida: "Configurações" voltou a ser link direto (sem expand/colapso)
- "Modelos de Lembretes" removido da UI (campo mantido no schema/backend)
- Link "Ver planos disponíveis" corrigido: `href="#"` → `href="/dashboard/plans"`
- VPS PostgreSQL: `max_connections` 100 → 200 (resolvido `pq: sorry, too many clients already`)
- QR Code Evolution API: corrigido tratamento de pipe + prefixo `data:image/` duplicado
- WhatsApp conectado e funcional: confirmações automáticas, IA Secretária respondendo sem duplicação
- Confirmação automática de agendamento envia WhatsApp via Evolution API ao mudar status para "confirmado"
- IA Secretária: sanitiza NFC, 20 mensagens de contexto, client lookup, marca `aiProcessed` após envio
- Commit+push final enviado para `main` e deploy automático no Vercel

**27/07/2026:**
- WhatsApp AI (Groq + Evolution Go) parcialmente implementada e deployada
- Corrigido payload da Evolution Go v0.7.2 (data.Info.Chat, data.Message)
- Health check cron criado (/api/cron/whatsapp-health) — monitora instâncias conectadas e reconecta automaticamente
- Retry adicionado ao sendTextMessage (3 tentativas com delay progressivo)
- Filtragem de eventos inúteis (Receipt, SendMessage, QRTimeout) no webhook
- Deduplicação de mensagens (janela de 10 segundos por sessionId+from+content)
- Logging diagnóstico completo em groq-ai.ts (4 checkpoints)
- Info.Sender priorizado sobre Info.Chat para extração do telefone do remetente
- Cron de health check limitado a 1x/dia (conta Vercel Hobby)
- Webhook GitHub→Vercel restaurado (integração reconectada)
- Projeto duplicado `modsaas` removido da Vercel
- Deploy automático via webhook restabelecido (não mais via CLI)
- Corrigido git config (user.name e user.email para euhenriqueofc26)
- 11 fixes de segurança aplicados (email enumeration, SQL injection, admin check, etc)
- Novo arquivo: src/app/api/cron/whatsapp-health/route.ts
- Novo arquivo: src/lib/token-revocation.ts
- Novo arquivo: src/app/api/auth/logout/route.ts
- Novo arquivo: src/app/api/blocked-times/[id]/route.ts
- Migração: prisma/migrations/20260726010000_add_whatsapp_ai_fields

**20/06/2026:**
- Implementada integração com Evolution API para WhatsApp automatizado
- Criado serviço `evolution-api.ts` (createInstance, sendTextMessage, delay, rotação de templates)
- Adicionados modelos Prisma: `WhatsAppSession`, `WhatsAppMessage`, campo `aiHandled` em Appointment
- Criadas rotas de API: connect, disconnect, status, send, webhooks (incoming, connection-update)
- Criado componente `WhatsAppConnect.tsx` com modal QR Code e polling 3s
- Integrado envio automático de confirmação ao confirmar agendamento
- Integrada notificação automática para nail quando cliente agenda online
- Reescrito cron de lembretes para enviar via Evolution API com rotação de templates
- Delay aleatório 20-30s + rotação de textos + limite ~300 msg/dia para evitar banimento
- WhatsApp automático disponível apenas no plano Premium
- Adicionadas env vars `EVOLUTION_API_URL` e `EVOLUTION_API_KEY`
- Build script alterado para `prisma db push && next build` (migração automática no deploy)
- CEO (euhenriqueofc26@gmail.com) reconhecido automaticamente como admin em todas as rotas
- Corrigidos pacotes @types corrompidos na node_modules

**26/05/2026:**
- Corrigido bug: link WhatsApp na confirmação de agendamento agora inclui código do país `55` (Brasil)
- Isso resolve o problema do número quebrar em dispositivos móveis (ex: `11948746767` → `5511948746767`)

**20/04/2026:**
- Google Analytics 4 implementado
- Componente de analytics com carregamento não-bloqueante
- Funções utilitárias para tracking de eventos

**29/03/2026:**
- Adicionado campo Instagram no registro de usuários
- Criado perfil do cliente com histórico de atendimentos
- Adicionada galeria de fotos por cliente (Cloudinary)
- Implementados horários dinâmicos na página pública
- Integração com Cloudinary para storage de imagens
