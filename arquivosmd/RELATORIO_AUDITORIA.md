# RELATÓRIO DE AUDITORIA COMPLETA DA PLATAFORMA
**Projeto**: ClubNailsBrasil (SaaS para Nail Designers)  
**Data**: 26 de Julho de 2026  
**Status**: AUDITORIA CONCLUÍDA — NENHUMA CORREÇÃO FOI EXECUTADA

---

##  EXECUTIVE SUMMARY

Foi realizada uma varredura completa em todos os arquivos do repositório (rotas de API, componentes React, middlewares, utilitários, schema Prisma e configurações de ambiente).

Foram identificadas **49 vulnerabilidades / inconsistências**, divididas em 4 categorias de gravidade:
- 🔴 **7 Críticos**: Falhas de segurança grave ou quebra de arquitetura SaaS.
- 🟧 **12 Altos**: Funcionalidades quebradas, fakes ou gargalos de performance.
- 🟡 **22 Médios**: Features incompletas, regras de negócio inconsistentes ou integrações soltas.
- ⚪ **8 Baixos / Código Morto**: Módulos não utilizados, funções orfãs e logs de debug.

---

## 🔴 1. ITENS CRÍTICOS (7)

### 1.1. Arquitetura WhatsApp Single-Tenant Hardcoded
- **Arquivo**: `src/app/api/whatsapp/connect/route.ts`
- **Problema**: A rota de conexão fixa `instanceName = 'clubnailsbrasil'`.
- **Impacto**: Todas as nail designers que conectarem o WhatsApp vão sobrescrever a mesma instância do proprietário. Todas as mensagens de clientes vão para um único número.

### 1.2. Token JWT com Secret Hardcoded de Fallback
- **Arquivo**: `src/lib/auth.ts`
- **Problema**: Fallback para `'nails-saas-secret-key-change-in-production'`.
- **Impacto**: Se a variável `JWT_SECRET` falhar no Vercel, qualquer pessoa pode forjar tokens JWT de administrador.

### 1.3. Webhooks sem Validação de Assinatura/Autenticação
- **Arquivos**: `src/app/api/webhooks/evolution/incoming/route.ts` e `connection-update/route.ts`
- **Problema**: Aceitam requisições POST de qualquer origem sem verificar token ou assinatura HTTP.
- **Impacto**: Qualquer pessoa na internet pode forjar mensagens recebidas ou alterar status de conexões.

### 1.4. Upload de Imagens sem Autenticação
- **Arquivo**: `src/app/api/upload/route.ts`
- **Problema**: Recebe arquivos e faz upload direto no Cloudinary sem verificar se o usuário está logado.
- **Impacto**: Permite uso indevido do limite do Cloudinary por terceiros.

### 1.5. Rota do Cron de Lembretes Desprotegida
- **Arquivo**: `src/app/api/cron/reminders/route.ts`
- **Problema**: Endpoint GET público sem validação de header `Authorization` ou `CRON_SECRET`.
- **Impacto**: Qualquer pessoa pode disparar lembretes em massa repetidamente.

### 1.6. Rotas de Parceiros Desprotegidas
- **Arquivo**: `src/app/api/partners/route.ts`
- **Problema**: GET e POST sem autenticação.
- **Impacto**: Dados de parceiros e comissões expostos e modificáveis publicamente.

### 1.7. Deletar Bloqueio de Horários Sem Verificação de Domínio
- **Arquivo**: `src/app/api/blocked-times/route.ts` (DELETE)
- **Problema**: Não valida se o `blockedTime` pertence ao usuário logado antes de deletar.
- **Impacto**: Usuário A pode deletar bloqueios do Usuário B sabendo o ID.

---

## 🟧 2. ITENS DE GRAVIDADE ALTA (12)

### 2.1. Dashboard Carrega Todo o Banco em Memória JS
- **Arquivo**: `src/app/api/dashboard/route.ts`
- **Problema**: Busca TODOS os agendamentos, TODOS os clientes e TODAS as receitas no banco e filtra em JS (`Array.filter`).
- **Impacto**: Conforme o banco crescer, o dashboard vai estourar limite de memória da Vercel e ficar extremamente lento.

### 2.2. Email do CEO Hardcoded em Múltiplos Arquivos
- **Arquivos**: `src/app/api/admin/users/route.ts`, `src/lib/authMiddleware.ts`, etc.
- **Problema**: String `'euhenriqueofc26@gmail.com'` chumbada no código para conceder acesso admin.
- **Impacto**: Impossível trocar o e-mail do admin sem alterar código e fazer novo deploy.

### 2.3. Reset de Senha Nunca Envia o E-mail
- **Arquivo**: `src/app/api/auth/forgot/route.ts`
- **Problema**: Gera o token de reset no banco, mas NÃO dispara e-mail (retorna o token no JSON da API).
- **Impacto**: Fluxo de "Esqueci minha senha" não funciona para o usuário final.

### 2.4. Forms da Tela de Configurações são Stubs
- **Arquivo**: `src/app/dashboard/settings/page.tsx`
- **Problema**: Os formulários de alterar nome/email e alterar senha apenas mostram `toast("Salvo")`, mas não possuem rota de API no backend.
- **Impacto**: O usuário acha que alterou a senha/perfil, mas nada é salvo no banco.

### 2.5. Botão "Excluir Conta" Apenas Faz Logout
- **Arquivo**: `src/app/dashboard/settings/page.tsx`
- **Problema**: O botão de exclusão de conta chama a função `logout()`.
- **Impacto**: A conta e os dados continuam no banco.

### 2.6. Sistema de Trial Incompleto no Registro
- **Arquivo**: `src/app/api/register/route.ts`
- **Problema**: O registro cria o usuário mas não preenche o campo `trialEndsAt`.
- **Impacto**: O middleware de trial nunca bloqueia usuários que não assinaram após 15 dias.

### 2.7. Checkout 100% Simulado (Fake)
- **Arquivo**: `src/app/checkout/page.tsx` e `src/app/api/checkout/route.ts`
- **Problema**: O pagamento simula um `setTimeout` de 2 segundos e aprova. Não há integração real com Stripe/MercadoPago.
- **Impacto**: A plataforma não consegue cobrar mensalidades reais.

### 2.8. Rate Limiter Pass-Through (Não Funciona)
- **Arquivo**: `src/lib/rate-limit.ts`
- **Problema**: Sem as env vars do Upstash Redis, o `catch` retorna `success: true`.
- **Impacto**: Nenhuma rota tem proteção contra ataques de força bruta.

### 2.9. Cálculo de Horários Disponíveis (Slots) Pode Permitir Sobreposição
- **Arquivo**: `src/app/api/public/[slug]/slots/route.ts`
- **Problema**: Não calcula corretamente intervalos quebrados e durações de múltiplos serviços simultâneos.

### 2.10. Status de Agendamento "Cancelado" Inconsistente no Financeiro
- **Arquivo**: `src/app/api/financial/route.ts`
- **Problema**: Agendamentos soft-canceled às vezes entram no cálculo de faturamento previsto.

### 2.11. Ausência de Error Boundaries no Frontend
- **Arquivos**: Vários componentes de dashboard.
- **Problema**: Se a API retornar erro 500, a página fica em branco sem mensagem amigável para a nail.

### 2.12. Polling de Status do WhatsApp Verifica Campos Incorretos
- **Arquivo**: `src/app/api/whatsapp/status/route.ts`
- **Problema**: Mapeia `connected` vs `state` de forma inconsistente com a resposta do Evolution Go v0.7.2.

---

## 🟡 3. ITENS DE GRAVIDADE MÉDIA (22)

1. **Cliente final não vê agendamentos**: Não existe portal "Meus Agendamentos" para a cliente final.
2. **Cliente final não pode cancelar/reagendar**: Obriga uso do WhatsApp manual.
3. **Sistema de Parceiros Sem UI**: Modelo Prisma existe, mas não há telas no dashboard.
4. **Sistema de Indicações Incompleto**: Código de indicação é gerado, mas recompensa/desconto não é aplicado.
5. **GA4 Analytics Desconectado**: Componente carrega, mas eventos (`trackEvent`) nunca são disparados.
6. **Audit Logs em Memória**: `logEvent()` só faz `console.log()`, não grava no banco.
7. **Pacotes Zod e React Hook Form Instalados e Inexistentes no Código**: Forms usam state simples.
8. **React-Calendar Instalado e Não Usado**: Telas usam inputs nativos `<input type="date">`.
9. **Build Local Falha**: `npm run build` tenta rodar `prisma db push` no banco Neon inacessível localmente.
10. **Warning de Imagens no Next.js**: Avatares de depoimentos faltam propriedade `sizes`.
11. **Botões de Upgrade Redirecionam para WhatsApp**: Em `/dashboard/plans`, upgrade abre conversa de WhatsApp.
12. **Fornecedores sem Vínculo com Despesas**: Módulo de fornecedores isolado.
13. **Relatórios Anuais Inacessíveis no Frontend**: Backend suporta `yearly`, UI só solicita `monthly`.
14. **Link "Ver Planos" Quebrado**: `href="#"` na tela de configurações.
15. **Campo `Client.lastServiceDate` Write-Only**: Gravado no banco, nunca lido/exibido.
16. **Campo `Appointment.aiHandled` Write-Only**: Gravado no banco, nunca lido/exibido.
17. **Campo `User.reminderDaysBefore` Write-Only**: Gravado no banco, ignorado pelo cron.
18. **Campo `Revenue.appointmentId` Desconectado**: Relação solta no cálculo de faturamento.
19. **IA Groq Não Executa Agendamentos**: IA sugere horários, mas não grava no banco de dados.
20. **IA Groq Não Alerta ao Mudar de Plano**: Desativa silenciosamente se usuário cair para Free.
21. **Tooltip de Onboarding Desaparece Muito Rápido**: 6 segundos é insuficiente para leitura.
22. **Exclusão de Fotos no Cloudinary Apenas Lógica**: Mantém arquivo no servidor Cloudinary.

---

## ⚪ 4. CÓDIGO MORTO / LIMPEZA (8)

1. **Arquivo 100% Morto**: `src/lib/analytics.ts` (39 linhas).
2. **Funções Mortas em `evolution-api.ts`**: `deleteInstance`, `getInstanceInfo`, `generateMessageVariations`, `shuffleArray`, `generateDelay`.
3. **Funções Mortas em `utils.ts`**: `formatDateTime`, `generateTimeSlots`, `validateWhatsapp`, `formatWhatsapp`, `getMonthName`, `getDayOfWeek`.
4. **Função Morta em `auth.ts`**: `authenticateUser`.
5. **Função Morta em `authMiddleware.ts`**: `planMiddleware`.
6. **Imports Não Utilizados**: Ícones de Lucide sobressalentes em 5 páginas.
7. **Logs de Debug em Produção**: `console.log('Saving avatar:', avatarUrl)` em `dashboard/page.tsx`.
8. **Duplicidade de Utilitários de Telefone**: Três regex diferentes de sanitização espalhados pelo código.

---

## 📊 PLANO DE AÇÃO RECOMENDADO (QUANDO AUTORIZADO)

```
FASE 1: Segurança e Arquitetura Multi-Tenant (7 Críticos)
  └── Implementar instâncias dinâmicas por usuário (`user-${userId}`)
  └── Proteger webhooks, upload, cron, parceiros e rotas de review
  └── Remover fallback do JWT Secret

FASE 2: Estabilidade e Correção de Bugs (12 Altos)
  └── Otimizar queries do Dashboard (SQL via Prisma count/aggregate)
  └── Implementar reset de senha real (email via Resend/Nodemailer)
  └── Ligar formulários de perfil e senha na tela Settings
  └── Implementar regras reais de Trial e Limites de Plano

FASE 3: Funcionalidades Incompletas e IA (22 Médios)
  └── Conectar IA Groq para criar agendamentos reais
  └── Implementar Portal do Cliente (ver/cancelar agendamentos)
  └── Instrumentar GA4 com eventos customizados

FASE 4: Limpeza e Otimização (8 Baixos)
  └── Remover arquivos e funções mortas
  └── Remover console.logs e ajustar warnings de imagens
```

---
*Relatório gerado em 26/07/2026. Nenhuma alteração foi realizada na base de código.*
