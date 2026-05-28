# Prompt: Versão Mobile do ClubNailsBrasil (React Native)

---

## Contexto

Este prompt descreve exatamente como desenvolver a versão mobile do **ClubNailsBrasil** — uma plataforma SaaS para nails designers que já existe como web app (Next.js + PostgreSQL). O objetivo é criar um app React Native (Expo) que replica todas as funcionalidades do web app consumindo as mesmas APIs.

---

## 1. Stack Recomendada

| Tecnologia | Versão | Motivo |
|-----------|--------|--------|
| React Native (Expo) | SDK 52+ | Desenvolvimento rápido, OTA updates, deploy fácil |
| TypeScript | 5.x | Type safety, mesma linguagem do backend |
| Expo Router | 4.x | File-based routing (similar ao Next.js) |
| React Query (TanStack Query) | 5.x | Cache, loading states, sincronização |
| Zustand | 5.x | Estado global leve |
| react-native-reanimated | 3.x | Animações nativas (onboarding, transições) |
| expo-secure-store | ~ | Storage seguro para JWT |
| expo-notifications | ~ | Push notifications para lembretes |
| expo-linking | ~ | Deep links para páginas públicas |

---

## 2. APIs Existentes (Backend Já Pronto)

O web app já possui todas as APIs REST. O app mobile consumirá exatamente as mesmas rotas. **Não é preciso recriar backend.**

### APIs de Autenticação
```
POST   /api/auth/login        → { email, password } → { token, user }
POST   /api/register          → { name, email, password, whatsapp, studioName } → { token, user }
POST   /api/auth/forgot       → { email, token, password } → reset de senha
```

### APIs do Dashboard
```
GET    /api/dashboard         → stats do dia (agendamentos, faturamento, clientes, pendentes)
```

### APIs de Agendamentos
```
GET    /api/appointments      → ?status=&date=&month=  → lista de agendamentos
PUT    /api/appointments/[id] → { status } → atualiza status (confirmed, completed, cancelled)
```

### APIs de Clientes
```
GET    /api/clients           → lista de clientes
POST   /api/clients           → { name, whatsapp, notes } → criar cliente
GET    /api/clients/[id]      → detalhes do cliente
GET    /api/clients/[id]/appointments → histórico de atendimentos
GET    /api/clients/[id]/photos      → galeria de fotos
POST   /api/clients/[id]/photos      → upload de foto (FormData)
DELETE /api/clients/[id]/photos/[photoId]
```

### APIs de Serviços
```
GET    /api/services          → lista de serviços do usuário
POST   /api/services          → { name, price, duration, description, image? }
PUT    /api/services/[id]     → atualizar serviço
DELETE /api/services/[id]     → deletar serviço
```

### APIs Financeiras
```
GET    /api/financial         → receitas e despesas do mês
POST   /api/financial         → { type, amount, description, category, date }
GET    /api/financial/reports → relatórios por período
```

### APIs de Página Pública
```
GET    /api/public/[slug]         → dados do estúdio (perfil, serviços)
GET    /api/public/[slug]/slots   → ?date=&dayOfWeek=&duration= → slots disponíveis
POST   /api/public/[slug]/book    → { clientName, clientWhatsapp, serviceId, date, startTime, notes }
```

### APIs de Marketing
```
GET    /api/promotions         → lista de promoções
POST   /api/promotions         → { title, message, discount? }
POST   /api/promotions/[id]/send → disparar para clientes via WhatsApp
```

### APIs de Configuração
```
GET    /api/profile           → dados do perfil
PUT    /api/profile           → atualizar perfil
POST   /api/user/avatar       → upload avatar
GET    /api/blocked-times     → horários bloqueados
POST   /api/blocked-times     → { date, startTime, endTime, reason }
```

### APIs de Admin
```
GET    /api/admin/users       → listar usuários (admin apenas)
PUT    /api/admin/users/[id]  → alterar plano/bloquear (admin apenas)
```

### Autenticação
- Header: `Authorization: Bearer {token}`
- O JWT contém: `{ userId, email, planId, role }`
- Validade: 30 dias (ou 7 dias, verificar no código)

---

## 3. Estrutura de Telas (Expo Router)

```
app/
├── _layout.tsx              → NavigationContainer + AuthProvider
├── index.tsx                → Redirect para login ou dashboard
│
├── (auth)/
│   ├── _layout.tsx          → Stack navigator (sem header)
│   ├── login.tsx            → Tela de login
│   └── register.tsx         → Tela de cadastro
│
├── (dashboard)/
│   ├── _layout.tsx          → Tab navigator principal
│   ├── index.tsx            → Dashboard (home)
│   ├── appointments/        → Agendamentos
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── clients/             → Clientes
│   │   ├── _layout.tsx
│   │   ├── index.tsx        → Lista de clientes
│   │   └── [id].tsx         → Perfil do cliente (histórico + fotos)
│   ├── services/            → Serviços
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── financial/           → Financeiro
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── marketing/           → Marketing
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── public/              → Página pública (config)
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── settings/            → Configurações
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── plans/               → Planos
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   └── indicacoes/          → Indicações
│       ├── _layout.tsx
│       └── index.tsx
│
├── (public)/                → Página pública (cliente)
│   ├── _layout.tsx
│   └── [slug].tsx           → Página pública da nail (consumir API /api/public/[slug])
│
└── (admin)/
    ├── _layout.tsx
    └── index.tsx            → Admin (apenas role=admin)
```

---

## 4. Funcionalidades Detalhadas por Tela

### 4.1 Autenticação

**Login (`(auth)/login.tsx`)**
- Campos: email, senha
- Botão "Entrar" → POST `/api/auth/login` → salvar token no SecureStore
- Link "Esqueci senha" → modal de reset
- Validação de erros (credenciais inválidas, conta bloqueada, trial expirado)

**Registro (`(auth)/register.tsx`)**
- Campos: nome, email, senha, WhatsApp, nome do estúdio
- Senha deve ter no mínimo 6 caracteres
- Após registro, salvar token e redirecionar para onboarding

### 4.2 Onboarding (3 etapas)

Após o primeiro login, guiar o usuário em 3 etapas:

1. **Dashboard**: "Adicione uma foto para suas clientes confiarem mais" → botão de foto de perfil
2. **Serviços**: "Crie seu primeiro serviço" → botão "Novo Serviço"
3. **Página Pública**: "Configure sua página pública para receber agendamentos"

Controle via API:
- `GET /api/user/onboarding` → obtém step atual
- `POST /api/user/onboarding` → { step } → avança step
- `POST /api/user/onboarding-complete` → finaliza onboarding

Design: tooltip com fundo semi-transparente, borda pulsante no elemento-alvo, indicador de progresso (1/3), botão "Pular".

### 4.3 Dashboard (Tab Home)

**Header**: nome do estúdio + foto de perfil (se tiver)
**Cards de stats** (GET `/api/dashboard`):
- Agendamentos hoje (com valor)
- Faturamento do mês (R$)
- Clientes ativos
- Pendentes
- Auto-refresh a cada 5 segundos

**Lista de agendamentos do dia**: cards com hora, nome do cliente, serviço, status
**Próximos agendamentos**: próximos 5 agendamentos futuros
**Atalhos**: Clientes, Financeiro, Serviços (ícones)
**Floating Action Button**: "Novo Agendamento"

### 4.4 Agendamentos (Tab)

**Header**: Filtros por status (todos, pendente, confirmado, concluído, cancelado)
**Lista**: cards com:
- Nome do cliente, serviço, data, horário, valor, status (com cor)
- Botões de ação por status:
  - Pendente → "Confirmar" (abre WhatsApp da cliente com msg), "Cancelar"
  - Confirmado → "Concluir", "Cancelar"
  - Concluído → sem ações
  - Cancelado → sem ações
- Pull-to-refresh

**Confirmação WhatsApp** (igual ao web app):
```typescript
let whatsapp = client.whatsapp.replace(/\D/g, '')
if (!whatsapp.startsWith('55')) {
  whatsapp = '55' + whatsapp
}
const msg = `Olá ${client.name}! Seu agendamento de ${service.name} no dia ${data} às ${hora} foi confirmado! 💅`
Linking.openURL(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`)
```

**Modal Novo Agendamento**:
- Seletor de cliente (com busca)
- Seletor de serviço
- Date picker
- Horário
- Preço automático
- Observações

### 4.5 Clientes (Tab)

**Lista**: FlatList com nome + WhatsApp + última visita
**Busca**: Search bar (por nome ou WhatsApp)
**Pull-to-refresh**
**Ao clicar**: abre perfil do cliente:

**Perfil do Cliente (screen)**:
- Aba Histórico: FlatList de atendimentos (data, serviço, valor, status)
- Aba Fotos: galeria com upload (câmera + galeria), delete
- Informações: nome, WhatsApp (link direto)

Adicionar cliente: FloatingActionButton → modal com nome, WhatsApp, observações

### 4.6 Serviços (Tab)

**Lista**: cards com nome, preço, duração, imagem (se tiver)
**FAB** → Modal criar serviço:
- Nome, preço (R$), duração (min), descrição, imagem (URL)
**Swipe to edit/delete**

### 4.7 Financeiro (Tab)

**Header do mês**: seletor de mês/ano
**Cards**: Receita do mês, Despesas, Lucro
**Lista de transações**: receitas (verde) e despesas (vermelho)
**FAB** → Modal "Nova Transação": tipo (receita/despesa), valor, descrição, categoria, data
**Relatórios**: gráfico simples de receita vs despesa por mês (apenas Pro/Premium)

### 4.8 Marketing (Tab)

**Lista de promoções**: título, mensagem, desconto, status
**FAB** → Criar promoção
**Ao clicar em promoção**: modal de envio → "Enviar para todos os clientes via WhatsApp"
- Gera link wa.me com lista de clientes

### 4.9 Página Pública (Tab)

**Preview**: visualização de como está a página pública
**Campos editáveis**:
- Imagem de capa (URL)
- Bio/descrição
- Endereço
- Horário de funcionamento
- Instagram, Facebook
- Ativar/desativar página
**Link**: "Ver página" → abre browser com `clubnailsbrasil.com.br/[slug]` (sem target=_blank, navegação interna)

### 4.10 Planos (Tab)

**Cards dos planos**: Free, Pro (R$29,90), Premium (R$59,90)
**Destaque** no plano atual
**Tabela comparativa**: clientes, agendamentos, serviços, financeiro, análises
**Botão "Assinar"** → checkout (cartão, PIX, boleto — simulado)

### 4.11 Configurações (Tab)

- Nome, email (read-only), WhatsApp, nome do estúdio
- Foto de perfil (com preview + upload)
- Dias de antecedência para lembrete (slider: 1-7 dias)
- Trocar senha
- Sair (limpar token)

### 4.12 Indicações (Tab)

- Código de indicação (refCode do usuário)
- Compartilhar link: `clubnailsbrasil.com.br?ref=CODIGO`
- Lista de indicações e status (trial, convertido)

### 4.13 Admin (Screen separada, apenas role=admin)

**Lista de usuários**: nome, email, studio, plano, WhatsApp, status
**Busca e filtros**: por nome/email/studio, por plano, por status
**Ao clicar**: modal com:
- Informações do usuário
- Alterar plano (Free/Pro/Premium) → PUT `/api/admin/users/[id]`
- Bloquear/Desbloquear
- Ao mudar para Pro/Premium, subscriptionEndsAt = +30 dias

### 4.14 Página Pública (Cliente) — App Aberto

**Rota**: `(public)/[slug].tsx`
**Dados**: GET `/api/public/[slug]`
**Seções**:
- Hero (imagem de capa + nome do estúdio)
- Sobre (bio, endereço, horários)
- Serviços (cards com preço e botão "Agendar")
- Avaliações
- Galeria (fotos)
- Área do Cliente (consultar agendamentos pelo WhatsApp)
- Footer com links

**BookingModal**: 
- Step 1: selecionar data (14 dias) + horário
- Step 2: nome + WhatsApp + observações
- Submit: POST `/api/public/[slug]/book` → abre WhatsApp do estúdio com mensagem de novo agendamento
- Tela de sucesso com resumo

---

## 5. Fluxo de Dados e Estado Global

### Zustand Stores

**AuthStore**
```typescript
interface AuthStore {
  token: string | null
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loadToken: () => Promise<void>  // SecureStore
}
```

**OnboardingStore**
```typescript
interface OnboardingStore {
  step: number
  completed: boolean
  nextStep: () => void
  skip: () => void
}
```

### React Query (TanStack Query)

Usar queries e mutations para todas as chamadas API:

```typescript
// Exemplo
export function useAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => fetchApi('/api/appointments', { params: filters }),
  })
}

export function useUpdateAppointment() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetchApi(`/api/appointments/${id}`, { method: 'PUT', body: { status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  })
}
```

---

## 6. Regras de Negócio (IMPORTANTE)

1. **WhatsApp sempre com `55`**: QUALQUER link wa.me deve ter o prefixo `55` (Brasil). Se o número já começar com `55`, não duplicar.
2. **Timezone**: Datas são armazenadas em UTC no banco. Comparações devem considerar UTC. Usar `date-fns` com `utcToZonedTime` se necessário.
3. **Plan limits**:
   - Free: max 10 clientes, 50 agendamentos/mês, 5 serviços
   - Pro: max 100 clientes, 200 agendamentos/mês, 20 serviços
   - Premium: ilimitado
   - Financeiro e relatórios: apenas Pro e Premium
4. **Trial**: 15 dias. Ao expirar, bloquear acesso (o backend já faz isso, mas o app deve mostrar tela de upgrade).
5. **Onboarding**: Só aparece para novos usuários (onboardingStep < 3 ou onboardingCompleted = false).
6. **Admin**: GET `/api/admin/users` só retorna dados se o token tiver `role: "admin"`.
7. **Fotos**: Upload via Cloudinary (o backend já trata o upload, enviar FormData para a API).
8. **Deep Links**: A página pública `clubnailsbrasil.com.br/[slug]` deve abrir o app se instalado (configurar no app.json do Expo).

---

## 7. Design System

### Cores
```
nude-50:  #FDF8F5
nude-100: #F9EDE6
nude-200: #F2DCCE
nude-300: #E6C4AD
nude-400: #D4A88C
nude-500: #C08B6E
nude-600: #A67154
nude-700: #8B5C42
nude-800: #754B35
nude-900: #5C3A28

rose-500: #F43F5E (primary accent)
rose-600: #E11D48
green-500: #22C55E (confirmado/sucesso)
```

### Tipografia
- Font: System (SF Pro no iOS, Roboto no Android)
- Headings: bold, size 24-32
- Body: regular, size 14-16
- Caption: regular, size 12

### Componentes Compartilhados
- `Button` (primary, secondary, outline, ghost)
- `Card` (com sombra leve, rounded-xl)
- `Input` (com label, erro)
- `Modal` (slide up, fundo semi-transparente)
- `BottomSheet` (para seletores)
- `StatusBadge` (pendente=amarelo, confirmado=verde, concluído=azul, cancelado=cinza)
- `EmptyState` (ilustração + texto)
- `LoadingOverlay`
- `Toast` (react-native-toast-message)

---

## 8. Funcionalidades Mobile Exclusivas

Além de replicar o web app, adicionar:

1. **Push Notifications**: Lembrete de agendamento 1 dia antes (usar Expo Notifications + cron job existente)
2. **Biometric Auth**: Login com Face ID / Digital (após primeiro login)
3. **Share**: Compartilhar link da página pública via Share Sheet nativa
4. **Camera**: Tirar foto direto para galeria do cliente (em vez de URL)
5. **Offline Cache**: Últimos dados do dashboard e lista de agendamentos ficam visíveis mesmo sem internet
6. **Widget (iOS)**: Próximos agendamentos do dia

---

## 9. Estrutura de Pastas do Projeto Mobile

```
clubnails-mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── (public)/
│   └── (admin)/
├── src/
│   ├── api/                # API client + query hooks
│   │   ├── client.ts       # fetch wrapper com token
│   │   ├── auth.ts
│   │   ├── appointments.ts
│   │   ├── clients.ts
│   │   ├── services.ts
│   │   ├── financial.ts
│   │   └── ...
│   ├── components/         # UI components
│   │   ├── ui/             # Button, Input, Card, Modal...
│   │   └── ...             # Business components
│   ├── hooks/              # Custom hooks
│   ├── stores/             # Zustand stores
│   ├── utils/              # Formatters, helpers
│   ├── types/              # TypeScript types
│   └── constants/          # Colors, plans, config
├── assets/                 # Fonts, images
├── app.json                # Expo config
└── eas.json                # EAS Build config
```

---

## 10. Checklist de Desenvolvimento (Ordem Sugerida)

### Fase 1 — Fundação
- [ ] Projeto Expo configurado (Expo Router, TypeScript, lint)
- [ ] API client com interceptador de token (SecureStore)
- [ ] Auth store (Zustand) + tela de login
- [ ] Tela de registro
- [ ] Layout protegido (dashboard) vs público (auth)
- [ ] Deep link configurado para `clubnailsbrasil.com.br/[slug]`

### Fase 2 — Dashboard + Agendamentos
- [ ] Dashboard com stats + auto-refresh
- [ ] Lista de agendamentos com filtros
- [ ] Modal criar agendamento
- [ ] Ações: confirmar (WhatsApp), concluir, cancelar
- [ ] Pull-to-refresh

### Fase 3 — Clientes + Serviços
- [ ] Lista de clientes com busca
- [ ] Perfil do cliente (histórico + fotos)
- [ ] Upload de foto (câmera + galeria)
- [ ] CRUD serviços
- [ ] Limites por plano (exibir ao atingir)

### Fase 4 — Financeiro + Marketing
- [ ] Dashboard financeiro com gráfico
- [ ] CRUD receitas/despesas
- [ ] Relatórios (Pro/Premium)
- [ ] Marketing: criar e disparar promoções via WhatsApp

### Fase 5 — Página Pública + Onboarding
- [ ] Configuração da página pública
- [ ] Preview da página
- [ ] Página pública do cliente (BookingModal)
- [ ] Onboarding 3 passos

### Fase 6 — Planos + Admin
- [ ] Tela de planos com upgrade
- [ ] Checkout simulado
- [ ] Admin: lista de usuários, alterar planos, bloquear

### Fase 7 — Polimento
- [ ] Push notifications
- [ ] Biometric auth
- [ ] Offline cache
- [ ] Widget iOS (próximos agendamentos)
- [ ] Animações e transições
- [ ] Testes em dispositivos físicos (Android + iOS)
- [ ] Deploy na App Store + Google Play

---

## 11. Observações Importantes

1. **Já existe um web app funcional**: aproveitar ao máximo as APIs existentes. **Não recriar backend.**
2. **O backend roda em produção**: URL base: `https://www.clubnailsbrasil.com.br`
3. **O web app não tem versão mobile responsiva**: o app React Native é uma experiência nativa separada.
4. **WhatsApp é crítico**: toda automação passa por `wa.me`. Garantir prefixo `55` em absolutamente todos os lugares.
5. **Manter nomes de rotas consistentes**: usar os mesmos nomes do web app (ex: appointments, clients, services) para facilitar manutenção paralela.
6. **Usar Expo EAS Build** para gerar os binários (APK/IPA) e **EAS Submit** para publicar nas lojas.
7. **OTA Updates**: Configurar `expo-updates` para atualizar o app sem passar pela loja (útil para correções rápidas).

---

## 12. Configuração Inicial (comandos)

```bash
# Criar projeto
npx create-expo-app@latest clubnails-mobile --template tabs

# Dependências principais
npx expo install expo-router expo-linking expo-secure-store expo-notifications
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install @tanstack/react-query zustand
npx expo install date-fns
npx expo install react-native-toast-message
npx expo install expo-image-picker expo-camera
npx expo install expo-sharing expo-constants

# Configurar expo-router no app.json
# "scheme": "clubnails"
# "plugins": ["expo-router", "expo-secure-store"]
```

---

**Bônus**: se quiser usar o mesmo design system do web (TailwindCSS), pode usar **NativeWind** para estilização com classes utilitárias no React Native:

```bash
npx expo install nativewind tailwindcss-react-native
```

---

Fim do prompt. Qualquer dúvida, consultar `DOCUMENTACAO.md` para detalhes do web app ou o código-fonte em `src/` para referência de implementação.
