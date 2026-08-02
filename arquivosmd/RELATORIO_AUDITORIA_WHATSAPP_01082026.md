# RELATÓRIO DE AUDITORIA — FLUXO DE CONEXÃO WHATSAPP (QR CODE)
**Projeto**: ClubNailsBrasil (SaaS para Nail Designers)
**Data**: 01/08/2026
**Status**: AUDITORIA CONCLUÍDA — NENHUMA ALTERAÇÃO DE CÓDIGO FOI EXECUTADA
**Objetivo**: Descobrir com evidências em qual etapa o QR Code deixa de existir no fluxo Conectar → Desconectar → Reconectar (Evolution Go).

---

## 1. EXECUTIVE SUMMARY

O QR Code **nunca é gerado pelo servidor da VPS**. O fluxo do app executa `createInstance` → `connectInstance` e recebe HTTP 200, mas o servidor não inicia o pareamento do WhatsApp — nem via API, nem via painel. Além disso, **o servidor não possui nenhum endpoint de QR** (todas as rotas testadas retornaram 404). Sem QR gerado, não há nada para a UI exibir, nem para o webhook entregar.

Foram confirmados, adicionalmente, **3 bugs reais no código do app** (latentes — vão quebrar o fluxo de reconexão) e **1 problema grave no servidor da VPS**.

---

## 2. METODOLOGIA

- Apenas chamadas HTTP manuais contra a VPS real (`http://77.37.41.176:4000`), usando instâncias de teste `audit-*`, criadas e **apagadas após cada teste**. Nenhuma instância de produção foi alterada.
- Leitura (somente leitura) das sessões no banco Neon via Prisma.
- Registro de: request enviado, HTTP status recebido e body completo da resposta.

---

## 3. EVIDÊNCIAS (CHAMADAS REAIS)

### 3.1. Fluxo principal

| Etapa | Request | HTTP Status | Resposta (resumo) |
|-------|---------|-------------|--------------------|
| Criar instância | `POST /instance/create` `{name, token}` | **200** | `data.id`, `qrcode:""`, `connected:false` — funciona |
| Conectar (token da instância, `immediate:false`) | `POST /instance/connect` | **200** | `data.eventString`, `data.jid:""` |
| Conectar (`immediate:true`) | `POST /instance/connect` | **200** | idem — **pareamento não inicia** |
| Conectar (com `number` no body + `immediate:true`) | `POST /instance/connect` | **200** | idem |
| `instance/info` após 30s do connect | `GET /instance/info/{id}` | **200** | `connected:false` · `jid:""` · `qrcode:""` · `disconnect_reason:""` |

**Conclusão da tabela:** o connect responde sucesso mas o WhatsApp **nunca entra em pareamento** — campo `qrcode` permanece vazio por 30+ segundos com auth correta e `immediate:true`.

### 3.2. Autenticação do connect

| Variante | HTTP Status | Resposta |
|----------|-------------|----------|
| `apikey` = chave global `EVOLUTION_API_KEY` | **401** | `{"error":"not authorized"}` |
| `apiKey` / `x-apikey` = chave global | **401** | `{"error":"not authorized"}` |
| `apikey` = **token da própria instância** | **200** | success |

**Conclusão:** o endpoint `/instance/connect` exige o **token da instância** como `apikey`, não a chave global.

### 3.3. Endpoints de QR — TODOS 404 neste servidor

| Rota | HTTP Status |
|------|-------------|
| `GET /instance/qr/{name}` | 404 |
| `GET /instance/{name}/qrcode` | 404 |
| `GET /instance/qrcode/{name}` | 404 |
| `GET /instance/qrcode/{id}` | 404 |
| `GET /instance/fetchQrCode/{name}` | 404 |
| `POST /instance/fetchQrCode/{name}` | 404 |
| `POST /instance/qrcode/{name}` | 404 |
| `POST /instance/connectToWhatsapp/{name}` | 404 |
| `GET /instance/connectionState/{name}` | 404 |
| `GET /instance/connectionState/{id}` | 404 |
| `GET /` e `GET /swagger` | 404 |

**Conclusão:** o servidor não expõe nenhuma rota de QR. O único canal possível seria o evento `QRCODE` via webhook — que nunca dispara porque o pareamento não inicia.

### 3.4. Delete exige UUID, não nome

| Request | HTTP Status | Resposta |
|---------|-------------|----------|
| `DELETE /instance/delete/{name}` | **500** | `{"error":"invalid UUID format: invalid UUID length: 17"}` |
| `DELETE /instance/delete/{id}` (UUID) | **200** | `{"message":"success"}` |

**Conclusão:** `instance/info` e `instance/delete` aceitam **apenas UUID**.

### 3.5. Estado real das sessões no Neon (somente leitura)

| instanceName | status | qrCode | phoneNumber | Observação |
|--------------|--------|--------|-------------|------------|
| `fab-nail-designer-zl` | INITIALIZING | vazio | 5511967505827 | Token do banco **bate com o painel** (`bedc3ab3…`); `evolutionId` idêntico |
| `ana-studio-nail` | INITIALIZING | 1844 chars | — | QR antigo (26/07) salvo — prova que o webhook já funcionou |
| `fundador` | INITIALIZING | vazio | — | órfã |

**Conclusão:** hoje **não há dessincronização de token** entre banco e painel. O connect atual usa o token correto, responde 200 e, mesmo assim, nenhum QR é gerado.

---

## 4. CAUSA RAIZ — EM QUAL ETAPA O QR DEIXA DE EXISTIR

```
1. createInstance()        → 200 OK ✓ (instância criada)
2. connectInstance()       → 200 OK ✓ (HTTP responde sucesso)
3. Pareamento WhatsApp     → ✗ NUNCA INICIA (connected:false, jid:"", qrcode:"" por 30s+)
4. Endpoint de QR          → ✗ NENHUM EXISTE no servidor (todas as rotas 404)
5. Webhook QRCode          → ✗ NUNCA DISPARA (não há QR para enviar)
6. status route / UI       → ✗ FICA PRESO em "Gerando QR Code, aguarde um momento..."
```

**O QR deixa de existir na etapa 3 — dentro do servidor da VPS.** O app faz tudo certo até o connect; depois disso não existe QR para exibir, salvar ou entregar.

---

## 5. BUGS CONFIRMADOS NO CÓDIGO DO APP (latentes)

| # | Arquivo:Linha | Bug | Impacto |
|---|---------------|-----|---------|
| 1 | `src/lib/evolution-api.ts:27` | `deleteInstance` envia o **nome**; servidor exige **UUID** → todo delete retorna 500 | Reconnect nunca limpa o painel; token é resetado (`connect/route.ts:46`) enquanto o painel mantém o antigo → próximo connect com token errado → **401** |
| 2 | `src/lib/evolution-api.ts:167` | `getInstanceQrCode` aponta para `/instance/qr/{name}` → **404** neste servidor | Função de QR nunca funciona |
| 3 | `src/lib/evolution-api.ts:190` + `status/route.ts:28-29` | `instance/info` não retorna campos `state`/`status`/`remoteJid` (só `connected` booleano) | Polling nunca detecta `CONNECTED`/`DISCONNECTED`; status fica congelado |

> Nota: `connect/route.ts:44` e `connect/route.ts:69-70` engolem erros com `catch {}` (delete e logout mudos) — agrava a falha silenciosa.

---

## 6. CONCLUSÕES

1. **Causa raiz atual (servidor/VPS):** o servidor da VPS não gera QR Code — aceita `connect` (200) mas nunca inicia o pareamento e não possui nenhum endpoint de QR.
2. **Os 3 bugs do app (itens 5.1–5.3) são reais** e precisam ser corrigidos para o fluxo funcionar de ponta a ponta, mas sozinhos não produzem QR hoje.
3. **Nenhuma alteração de código/commit/deploy foi realizada** nesta auditoria.

---

## 7. PRÓXIMOS PASSOS (aguardando decisão)

- [ ] Investigar o servidor da VPS: qual versão/instalação da Evolution está rodando, por que o pareamento não inicia, e se há reconfiguração que faça o QR ser gerado.
- [ ] Corrigir os 3 bugs do app (delete por UUID, connect com fallback/refresh de token, leitura de QR via webhook).
- [ ] Documentar decisão em `DOCUMENTACAO.md` / `ESTADO-ATUAL-IMPLEMENTACAO.md`.

---

# APÊNDICE — INVESTIGAÇÃO DA VPS (01/08/2026)

## 1. O servidor da VPS NÃO é o Evolution Go v0.7.2 oficial

Confronto entre as rotas oficiais do Evolution Go (docs evolutionfoundation + GitHub 0.7.0/0.7.2) e o que existe na VPS (`http://77.37.41.176:4000`):

| Rota oficial v0.7.2 | Na VPS |
|---------------------|--------|
| `GET /instance/{name}/qrcode` | **404** |
| `DELETE /instance/{name}` | **404** (VPS usa `/instance/delete/{id}` com UUID) |
| `POST /message/sendText` | **404** |
| `GET /instance/{name}/status` | **404** (VPS usa `/instance/status` com token) |
| `/swagger/index.html` | **404** |

Rotas que **existem** na VPS (estilo antigo/v1): `/instance/create`, `/instance/connect` (name no body), `/instance/logout`, `/instance/all`, `/instance/info/{id}`, `/instance/delete/{id}`, `/instance/status`, `/send/text`.

- `GET /instance/status` responde `{"data":{"Connected":false,"LoggedIn":false,"Name":""}}` — campos capitalizados estilo Go/whatsmeow.
- `POST /send/text` (rota usada pelo app) → `500 {"error":"no active session found"}` — **rota existe**; o app está alinhado a essa build antiga.

**Conclusão:** a VPS roda um build ANTIGO do Evolution Go, não a v0.7.2. Nessa build o QR NÃO tem endpoint — seria entregue apenas via evento `QRCode` do webhook.

## 2. Prova definitiva: o servidor NÃO emite nenhum evento (pareamento nunca inicia)

Teste com capturador de webhook (webhook.site), instância `audit-wb-*`:

1. Instância criada com `webhookUrl` apontando para o catcher.
2. `POST /instance/connect` com `immediate:false` → **200**.
3. Aguardado ~42s: **0 eventos recebidos** — nem `QRCode`, nem `Connected`, nada.
4. `instance/info` final: `connected:false` · `jid:""` · `qrcode:""`.

**Conclusão:** o `connect` apenas grava a configuração (webhook/events); o client WhatsApp (whatsmeow) nunca inicia — por isso nem QR, nem webhook, nem status.

## 3. Portas abertas na VPS

`22` (SSH), `4000` (Evolution Go), `5432` (PostgreSQL). Sem credenciais SSH não foi possível inspecionar logs / `.env` / container.

## 4. Causas prováveis de a sessão nunca iniciar (a verificar no servidor)

1. Bug da build antiga do Evolution Go no `connect` (só persiste config).
2. `.env` incompleto (ex.: sem banco de sessões/storage do whatsmeow, sem `WEBHOOK_URL` global).
3. Licença com heartbeat falho (doc: API retorna 503 se inativa — aqui retorna 200, então licença parece ativa).
4. Egresso de rede bloqueado (whatsmeow precisa alcançar os servidores do WhatsApp via 443/5222).

## 5. Recomendação

- Reinstalar/atualizar o Evolution Go na VPS para a versão atual (v0.7.2) com o `docker-compose` oficial, mantendo `CLIENT_NAME=clubnails` e `GLOBAL_API_KEY`.
- Em seguida, **alinhar o app às rotas oficiais**: `/message/sendText` (hoje `/send/text`), connect sem `name` no body, e QR com endpoint oficial `GET /instance/{name}/qrcode`.
- Os 3 bugs do app já identificados (delete por UUID, token no reconnect, leitura de estado) permanecem pendentes.

---

# CAUSA RAIZ DEFINITIVA — VAZAMENTO DE CONEXÕES NO POSTGRES (01/08/2026)

Acesso SSH à VPS confirmou o problema exato. **O Evolution Go na VPS é a imagem oficial `evoapicloud/evolution-go:0.7.2`** (container `evolution-go`, porta 4000, `CLIENT_NAME=clubnails`), com Postgres 15 em container próprio (porta 5432).

## O que os logs do container revelaram

A cada `connect`, o whatsmeow tenta iniciar o client e falha repetidamente:

```
[ERR] Failed to create container: failed to upgrade database:
      failed to check if version table is up to date:
      pq: sorry, too many clients already
```

## Estado do Postgres

| Métrica | Valor |
|---|---|
| `max_connections` | **100** |
| Conexões totais | **105** (99 idle + 6) |
| Conexões vazadas | **99 `idle`** em `evogo_auth`, do container evolution-go (172.18.0.2), todas com a query `SELECT version, compat FROM whatsmeow_version LIMIT 1` |
| Idade das vazadas | **~46–48 horas** (container "Up 2 days") |
| `idle_session_timeout` | **0** (desligado) |

## Mecanismo

1. O whatsmeow abre 1 conexão de store por tentativa de iniciar o client e **não fecha**.
2. Em ~2 dias, 100/100 vagas ocupadas → novas conexões são recusadas.
3. `connect` passa a falhar silenciosamente → client nunca inicia → sem QR, sem webhook, sem status.
4. O loop de reconexão do Evolution Go agrava (mais tentativas, mais conexões).
5. Explica a linha do tempo: funcionava até ~30/07 (vagas livres) e parou depois (banco cheio).

## Correção proposta (aguardando decisão do usuário)

1. Encerrar as 99 conexões idle vazadas (`pg_terminate_backend`).
2. `ALTER SYSTEM SET idle_session_timeout = 300` + `pg_reload_conf()` (auto-limpam conexões idle em 5 min — Go/database-sql reconecta sob demanda).
3. Testar connect + captura do evento `QRCode` em instância de teste.
4. (Opcional) `max_connections = 200` como margem extra.

---
*Apêndice gerado em 01/08/2026. Nenhuma alteração foi realizada na base de código.*

---

# RESOLUÇÃO E VALIDAÇÃO (02/08/2026)

**Status:** PROBLEMA RESOLVIDO — fluxo WhatsApp validado de ponta a ponta (QR → conexão → mensageria).

## 1. Causa raiz definitiva confirmada

O servidor é a imagem oficial **`evoapicloud/evolution-go:0.7.2`** (confirmado via `/app/VERSION` e digest da imagem). O bug é **conhecido e upstream** (GitHub `evolution-foundation/evolution-go`):

- **Issue #106**: cada chamada a `StartClient()` cria um novo pool `sqlstore` (`sqlstore.New()` em `pkg/whatsmeow/service/whatsmeow.go` L304–339) que **nunca é fechado/reutilizado**. Cada start/reconnect vaza 1 pool de conexões órfão para o Postgres.
- **PR #117** (fix oficial: reuso de um único container `sqlstore` via `NewWithDB`): **aberto, não mergeado**. Nenhuma imagem oficial publicada tem o fix.
- `cmd/evolution-go/main.go` L300–318 **já possui** um pool limitado (`SetMaxOpenConns(25)`, `SetMaxIdleConns(5)`, `ConnMaxLifetime 5min`, `ConnMaxIdleTime 1min`), mas `StartClient` **não usa esse pool** — daí o vazamento ilimitado.

**Não é** problema de configuração do Postgres (`max_connections=100` é o default) nem bug upstream do WhatsMeow.

## 2. Correção aplicada (workaround — camada infra)

1. **Encerradas 99 conexões idle vazadas** em `evogo_auth` (via `pg_terminate_backend`, PIDs capturados em array — derrubar na própria sessão psql a mata antes do ALTER SYSTEM).
2. **`ALTER SYSTEM SET idle_session_timeout = 300000`** + `pg_reload_conf()` — persistido em `postgresql.auto.conf` (`SHOW` = 5min). Toda sessão idle do servidor é encerrada em 5 min (Go/database-sql reconecta sob demanda).

> Workaround = **contenção permanente, não cura**: derruba os pools órfãos no Postgres, mas não elimina o leak de memória/goroutines do processo. A cura real é o PR #117.

## 3. Fix no código do app (reconnect)

**Arquivo:** `src/app/api/whatsapp/connect/route.ts`

**Bug:** no reconnect (`status === 'DISCONNECTED'`), o route regenerava o token (`crypto.randomUUID()`) e zerava o `evolutionId` — mas o `deleteInstance(instanceName)` por **nome** falhava silenciosamente (o v0.7.2 exige **UUID**), a instância continuava viva no Evolution com o **token antigo**, e o connect com o token novo devolvia **401** → **500 no app**.

**Log real (00:40:50):**
```
DELETE /instance/delete/fab-nail-designer-zl → 500   (nome em vez de UUID, engolido)
POST  /instance/logout                               → 404   (rota inexistente, engolido)
POST  /instance/connect                              → 401   (apikey = token novo ≠ token da instância) → 500
```

**Correção:** removidas as 2 linhas que regeneravam o token e limpavam o `evolutionId` no bloco DISCONNECTED. O reconnect agora reutiliza o token existente da sessão (que bate com o da instância no Evolution). Typecheck limpo.

## 4. Validação ponta a ponta (conta da Fabíola)

### 4.1. QR Code
- Instância de teste `validate-qr-0108` criada e conectada → evento `QRCode` recebido no webhook.site (QR `data:image/png;base64,...` + code de pareamento) → **QR gera normalmente**.
- Fabíola: connect → QR → scan → conectado.

### 4.2. Reconectar
- Desconectar + reconectar via app (`npm run dev`): **funcionou sem 500** após o fix de token.

### 4.3. Mensageria
- Mensagens recebidas → HistorySync processado (808 secrets armazenados) → webhook 200 → IA respondeu (`{"success":true,"replied":true}`) → receipt lido.

### 4.4. Contenção do leak (monitoramento 1h — 12 amostras)
```
04:10 auth=1   04:15 auth=0   04:20 auth=0   04:25 auth=1
04:30 auth=1   04:35 auth=1   04:40 auth=1   04:45 auth=2
04:50 auth=0   04:55 auth=0   05:00 auth=0   05:05 auth=0
```
- **Máximo: 2 conexões em 1h (antes: 99).** Oscilação 0↔2 = contenção ativa (idle derrubado, reconecta sob demanda).
- Estado final: `fab-nail-designer-zl connected=t` (jid `:10` após re-scan), `audit-probe-13340` parada.

## 5. Pendências (não bloqueantes)

| # | Item | Tipo |
|---|------|------|
| 1 | Backport do PR #117 (imagem própria) ou aguardar release upstream — cura o leak de memória/goroutines | Infra |
| 2 | `deleteInstance` por **UUID** no app (`src/lib/evolution-api.ts:27`) — hoje 500 no reconnect | App |
| 3 | `getInstanceQrCode` → rota `/instance/qr/{name}` 404 (QR é entregue via webhook) | App |
| 4 | `instance/info` sem campo `state` — polling de status preso | App |

*Documento atualizado em 02/08/2026.*
