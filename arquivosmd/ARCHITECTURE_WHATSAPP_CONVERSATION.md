# ARQUITETURA — Conversas WhatsApp e Contexto da IA

> Status: **implementado (02/08/2026)** — resolve definitivamente a mistura de contexto entre contatos diferentes.
> Motivação: a Secretária IA chamava todo contato pelo nome do primeiro cliente ("Henrique") e misturava informações entre pessoas.

## Problema original

A IA montava o histórico com as últimas 20 mensagens **da sessão inteira** (WhatsApp da nail designer):

```ts
// ANTES (bug) — mistura todos os contatos da sessão
where: { sessionId, direction: 'INBOUND', aiProcessed: true }
```

Como todas as clientes conversam na mesma instância, o prompt misturava Henrique, João, Maria, etc.
A IA não tinha culpa: o contexto que chegava já vinha errado.

## Princípio: uma conversa = um contexto

A identidade do contexto é:

```
Nail designer (sessionId) + Telefone do contato (contactKey) = Contexto único
```

Cada número possui sua própria conversa, com histórico e dados isolados.
É o mesmo modelo de CRMs como Intercom/Zendesk.

## Modelo de dados

```prisma
model WhatsAppConversation {
  id              String   @id @default(cuid())
  sessionId       String
  contactKey      String             // dígitos E.164 canônicos (ex.: 5511967505827)
  customerName    String?            // nome do cliente quando conhecido
  lastMessage     String?
  lastInteraction DateTime?
  lastMessageAt   DateTime?          // útil para ordenar "último contato" / follow-up
  summary         String?            // resumo futuro da conversa (IA)
  lastAppointment String?            // referência ao último agendamento
  status          String   @default("ACTIVE")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  session  WhatsAppSession      @relation(... onDelete: Cascade)
  messages WhatsAppMessage[]

  @@unique([sessionId, contactKey])
  @@index([sessionId, updatedAt])
  @@index([sessionId, lastMessageAt])
}

model WhatsAppMessage {
  // ...
  conversationId String?              // FK -> WhatsAppConversation (onDelete: SetNull)
}
```

## Chave canônica — normalizeContactKey

`src/lib/whatsapp-conversation.ts`

Regra: **um número = uma conversa**, independente do sentido da mensagem.

| Origem | Exemplo | Resultado da normalização |
|---|---|---|
| INBOUND (remoteJid) | `5511967505827:11@s.whatsapp.net` | `5511967505827` |
| OUTBOUND (to) | `5511967505827` | `5511967505827` |

A normalização remove `@`, `:` e qualquer caractere não-dígito. Isso impede que
INBOUND e OUTBOUND criem duas conversas para o mesmo contato.

## Fluxo de mensagens

```
Webhook Evolution chega
        ↓
normalizeContactKey(remoteJid)
        ↓
getOrCreateConversation(sessionId, contactKey)   ← upsert na chave única
        ↓
grava WhatsAppMessage (INBOUND) com conversationId
        ↓
processIncomingMessage(...)
        ↓
busca histórico SÓ daquela conversa (2 sentidos, AI_CONTEXT_MESSAGES)
        ↓
busca cliente por E.164 exato (últimos 10 dígitos como fallback)
        ↓
monta prompt: dados do cliente + histórico isolado + regras
        ↓
IA responde → envia WhatsApp → salva aiResponse na mensagem
```

## Quem faz o quê

| Ação | Responsável | Onde |
|---|---|---|
| **Cria** a conversa | `getOrCreateConversation()` (upsert) | webhook INBOUND, send, reminders, appointments, book |
| **Atualiza** `lastMessage`/`lastInteraction` | os mesmos pontos de gravação | todos os pontos acima |
| **Lê** o histórico | `groq-ai.ts` | filtra por `conversationId` |
| **Grava** mensagens | webhook (INBOUND), send/reminders/book/appointments (OUTBOUND) | `whatsAppMessage.create` + `conversationId` |
| **Altera** dados do cliente | Nail designer via painel (Client) | — |

## Pontos de gravação (5)

1. `src/app/api/webhooks/evolution/incoming/route.ts` — **INBOUND** (onde nasce a conversa)
2. `src/app/api/whatsapp/send/route.ts` — OUTBOUND (envio manual)
3. `src/app/api/cron/reminders/route.ts` — OUTBOUND (lembretes)
4. `src/app/api/appointments/[id]/route.ts` — OUTBOUND (confirmação)
5. `src/app/api/public/[slug]/book/route.ts` — OUTBOUND (confirmação de agendamento)

## Leitura na IA (`src/lib/groq-ai.ts`)

- Histórico: últimas `AI_CONTEXT_MESSAGES` (padrão 20, constante em
  `src/lib/whatsapp-conversation.ts`) daquela `conversationId`, nos 2 sentidos.
- Formatação: INBOUND = `Cliente: ...` (+ `Voce: aiResponse` quando existe);
  OUTBOUND = `Voce: ...`.
- Timeouts (`[timeout - mensagem antiga]`) são excluídos do histórico.
- Lookup de cliente: **E.164 exato** via `normalizeContactKey`; fallback pelos
  últimos 10 dígitos (não usa mais `contains.slice(-8)`).
- Quando o cliente é identificado, `customerName` é gravado na conversa.

## Backfill

`scripts/backfill-conversations.ts` (rodar uma vez, com `npx tsx`):
- Agrupa mensagens existentes por contato (INBOUND usa `from`, OUTBOUND usa `to`)
- Cria as conversas com `lastMessage`/`lastInteraction`/`lastMessageAt`
- Vincula `conversationId` nas mensagens antigas

Resultado da execução: 13 conversas, 122 mensagens vinculadas, 0 órfãs.

## Casos de borda conhecidos

- **JIDs `@lid`** (contatos não-telefônicos): são normalizados para dígitos e
  isolados em própria conversa. Mensagens antigas podem ter ficado com chave
  truncada (`.slice(0,13)` do passado) — não afeta contatos reais.
- **Números mal cadastrados no `Client`** (sem DDD/country code): o fallback de
  10 dígitos cobre, e `formatPhoneForEvolution` normaliza na gravação.
- **Mensagens anteriores ao deploy**: ficam com `conversationId` preenchido pelo
  backfill; as que chegarem depois seguem o fluxo novo normalmente.

## Ordem de deploy

1. `npx prisma db push` (aditivo, sem risco — já executado)
2. `npm run db:generate`
3. `npx tsx scripts/backfill-conversations.ts` (já executado)
4. `npx tsc --noEmit` (limpo)
5. Deploy do app (Vercel)
6. Teste: dois números diferentes → IA deve tratar como conversas separadas

## Contingência (Fase 1)

Se a Fase 2 apresentar qualquer problema em produção, o hotfix de 1 linha
(filtrar `from` no histórico de `groq-ai.ts`) é o fallback imediato.
